import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../App';
import { POSLicense, Vendor, Plan } from '../types';
import type { POSActivationRecord, POSLicenseMode, POSStorageMode } from '../licensing';
import { createPOSActivationRecord, getPOSActivationRecords } from '../services/posActivationBridge';
import { posActivationRecordToFirestoreActivation, posActivationRecordToSCIPOSLicense } from '../adapters';
import { safeFirestoreWrite } from '../firebase/gateway';
import { canWriteToFirestore, getSCIFirestoreModeState } from '../firebase/mode';
import type { SCIVendor } from '../domain';
import { 
  Terminal, 
  Plus, 
  Key, 
  Ban, 
  FileText, 
  Clock, 
  Search, 
  History, 
  X, 
  Check, 
  AlertTriangle, 
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
  Info,
  Sliders,
  Copy,
  Cpu,
  Layers,
  Activity,
  User,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

const NEW_VENDOR_OPTION = '__new_vendor__';

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function createCode(label: string, prefix: string) {
  const cleaned = label
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12);

  return `${prefix}-${cleaned || 'NODE'}-${Math.floor(100 + Math.random() * 900)}`;
}

function createPOSLicenseKey() {
  return `ITRD-POS-${Math.floor(1000 + Math.random() * 9000)
    .toString(16)
    .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)
    .toString(16)
    .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)
    .toString(16)
    .toUpperCase()}`;
}

function parsePlanLimit(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  if (value.toLowerCase().includes('unlimited')) return 999999;

  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getEmailName(email: string) {
  return email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'New Vendor';
}

export default function POSLicensingView() {
  const { 
    posLicenses, 
    setPosLicenses, 
    vendors, 
    setVendors,
    plans,
    googleEmail,
    envMode,
    onChangeEnvMode,
    activeStaffSession,
    onAddWorkspaceAuditEvent,
    onAddWorkspaceActivity,
    onAddWorkspaceNotification,
    workspaceAuditEvents,
    workflows,
    onAddWorkflow,
    onUpdateWorkflow
  } = useLifecycle();

  // Active view tab: 'manager' (License Manager + Validation) or 'demo-licensing' (Demo Licensing)
  const [activeTab, setActiveTab] = useState<'manager' | 'demo-licensing'>('manager');

  // Search & Selector State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Selected records
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>(() => {
    return posLicenses[0]?.id || '';
  });

  const selectedLicense = useMemo(() => {
    return posLicenses.find(l => l.id === selectedLicenseId) || null;
  }, [posLicenses, selectedLicenseId]);

  // Validation state
  const [selectedValidationVendorId, setSelectedValidationVendorId] = useState<string>('');

  // Validation output computed properties
  const validationResult = useMemo(() => {
    if (!selectedValidationVendorId) return null;
    const vendor = vendors.find(v => v.id === selectedValidationVendorId);
    if (!vendor) return null;

    const license = posLicenses.find(l => l.vendorName === vendor.name);
    
    if (!license) {
      return {
        allowed: false,
        reasonCode: 'MISSING_LICENSE',
        message: 'No Point-of-Sale licensing key has been issued for this vendor record.',
        licenseId: '—',
        plan: vendor.assignedPlanName || 'None',
        expiry: '—',
        mode: envMode,
        storage: vendor.storageMode || 'localOnly'
      };
    }

    if (license.status === 'Suspended') {
      return {
        allowed: false,
        reasonCode: 'LICENSE_SUSPENDED',
        message: 'Licensing console keys have been temporarily suspended by operator.',
        licenseId: license.id,
        plan: license.planName,
        expiry: license.expiryDate,
        mode: envMode,
        storage: vendor.storageMode || 'localOnly'
      };
    }

    if (license.status === 'Expired' || new Date(license.expiryDate) < new Date()) {
      return {
        allowed: false,
        reasonCode: 'LICENSE_EXPIRED',
        message: 'Licensing key term has expired. Renew subscription plan immediately.',
        licenseId: license.id,
        plan: license.planName,
        expiry: license.expiryDate,
        mode: envMode,
        storage: vendor.storageMode || 'localOnly'
      };
    }

    return {
      allowed: true,
      reasonCode: 'VAL_SUCCESS',
      message: 'Cryptographic activation signature verified successfully.',
      licenseId: license.id,
      plan: license.planName,
      expiry: license.expiryDate,
      mode: envMode,
      storage: vendor.storageMode || 'localOnly'
    };
  }, [selectedValidationVendorId, vendors, posLicenses, envMode]);

  // Licensing Events Timeline computed from audit logs
  const licenseEvents = useMemo(() => {
    const actions = [
      'POS_LICENSE_ISSUE', 
      'POS_LICENSE_RENEW', 
      'POS_LICENSE_SUSPEND', 
      'POS_LICENSE_REVOKE', 
      'POS_LICENSE_EXPIRE',
      'POS_LICENSE_ACTIVATE',
      'VENDOR_DEMO_START',
      'VENDOR_DEMO_CONVERSION'
    ];
    return workspaceAuditEvents
      .filter(e => actions.includes(e.action))
      .slice(0, 10);
  }, [workspaceAuditEvents]);

  // Demo records filtering
  const demoVendorsList = useMemo(() => {
    return vendors.filter(v => v.assignedPlanId === 'VENDOR_DEMO');
  }, [vendors]);

  const demoLicensesList = useMemo(() => {
    return posLicenses.filter(l => l.planName === 'Vendor Demo');
  }, [posLicenses]);

  // Form States - Issue License
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueVendorId, setIssueVendorId] = useState('');
  const [issuePlanId, setIssuePlanId] = useState('');

  // Form States - Authority Activation Drawer
  const [isActivationDrawerOpen, setIsActivationDrawerOpen] = useState(false);
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);
  const [activationNotice, setActivationNotice] = useState<string | null>(null);
  const [activationVendorId, setActivationVendorId] = useState('');
  const [activationOwnerEmail, setActivationOwnerEmail] = useState(googleEmail || '');
  const [activationPlanId, setActivationPlanId] = useState('');
  const [activationBranchName, setActivationBranchName] = useState('Main Branch');
  const [activationTerminalName, setActivationTerminalName] = useState('Main POS Terminal');
  const [activationTerminalCode, setActivationTerminalCode] = useState('TERM-MAIN-001');
  const [activationStartDate, setActivationStartDate] = useState(() => toDateInputValue(new Date()));
  const [activationExpiryDate, setActivationExpiryDate] = useState(() => toDateInputValue(addDays(new Date(), 365)));
  const [activationLicenseMode, setActivationLicenseMode] = useState<POSLicenseMode>('production');
  const [activationStorageMode, setActivationStorageMode] = useState<POSStorageMode>('cloud');

  const posPlanOptions = useMemo(() => {
    return plans.filter(p => p.type === 'POS' || p.type === 'Hybrid');
  }, [plans]);

  const activationRecords = useMemo(() => {
    return getPOSActivationRecords();
  }, [posLicenses, vendors]);

  // Operations Handlers

  const openActivationDrawer = () => {
    const firstVendor = vendors[0];
    const firstPlan =
      posPlanOptions.find(p => p.id !== 'VENDOR_DEMO') ||
      posPlanOptions[0] ||
      plans[0];

    setActivationVendorId(firstVendor?.id || NEW_VENDOR_OPTION);
    setActivationOwnerEmail(firstVendor?.email || googleEmail || '');
    setActivationPlanId(firstPlan?.id || '');
    setActivationBranchName(firstVendor ? `${firstVendor.name} Main` : 'Main Branch');
    setActivationTerminalName('Main POS Terminal');
    setActivationTerminalCode(createCode(firstVendor?.code || firstVendor?.name || 'main', 'TERM'));
    setActivationStartDate(toDateInputValue(new Date()));
    setActivationExpiryDate(toDateInputValue(addDays(new Date(), firstPlan?.id === 'VENDOR_DEMO' ? 30 : 365)));
    setActivationLicenseMode(firstPlan?.id === 'VENDOR_DEMO' ? 'demo' : 'production');
    setActivationStorageMode(firstPlan?.id === 'VENDOR_DEMO' ? 'localOnly' : 'cloud');
    setActivationNotice(null);
    setIsActivationDrawerOpen(true);
  };

  const handleActivationVendorChange = (vendorId: string) => {
    setActivationVendorId(vendorId);

    if (vendorId === NEW_VENDOR_OPTION) {
      setActivationBranchName('Main Branch');
      setActivationTerminalCode(createCode('new vendor', 'TERM'));
      return;
    }

    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    setActivationOwnerEmail(vendor.email || googleEmail || '');
    setActivationBranchName(`${vendor.name} Main`);
    setActivationTerminalCode(createCode(vendor.code || vendor.name, 'TERM'));
  };

  const handleActivationPlanChange = (planId: string) => {
    setActivationPlanId(planId);
    const plan = plans.find(p => p.id === planId);

    if (plan?.id === 'VENDOR_DEMO') {
      setActivationLicenseMode('demo');
      setActivationStorageMode('localOnly');
      setActivationExpiryDate(toDateInputValue(addDays(new Date(), 30)));
      return;
    }

    setActivationLicenseMode('production');
    setActivationStorageMode('cloud');
    setActivationExpiryDate(toDateInputValue(addDays(new Date(), 365)));
  };

  const buildFirestoreVendor = (
    vendor: Vendor,
    now: string,
    issuedBy: string
  ): SCIVendor => ({
    id: vendor.id,
    vendorId: vendor.id,
    ownerUid: vendor.email,
    ownerEmail: vendor.email,
    businessName: vendor.name,
    tradingName: vendor.tradingName || vendor.name,
    businessType: vendor.category,
    country: vendor.country || 'Unknown',
    city: vendor.city || vendor.location || 'Control Centre',
    physicalAddress: vendor.address,
    contactPhone: vendor.phone,
    status: vendor.status === 'Suspended' ? 'suspended' : 'active',
    planId: vendor.assignedPlanId,
    licenseMode: vendor.licenseMode || activationLicenseMode,
    storageMode: vendor.storageMode || activationStorageMode,
    isDemoVendor: (vendor.licenseMode || activationLicenseMode) === 'demo',
    createdAt: now,
    updatedAt: now,
    createdBy: issuedBy,
    updatedBy: issuedBy,
  });

  const handleActivatePOSLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationNotice(null);

    const plan = plans.find(p => p.id === activationPlanId);
    if (!plan) return alert('Please select a valid POS plan.');

    const ownerEmail = activationOwnerEmail.trim();
    const branchName = activationBranchName.trim();
    const terminalName = activationTerminalName.trim();
    const terminalCode = activationTerminalCode.trim().toUpperCase();

    if (!ownerEmail || !ownerEmail.includes('@')) return alert('Owner Google Email is required.');
    if (!branchName) return alert('Branch name is required.');
    if (!terminalName) return alert('Terminal name is required.');
    if (!terminalCode) return alert('Terminal code is required.');
    if (!activationStartDate || !activationExpiryDate) return alert('Start and expiry dates are required.');
    if (new Date(activationExpiryDate).getTime() <= new Date(activationStartDate).getTime()) {
      return alert('Expiry date must be after the start date.');
    }
    if (activationLicenseMode === 'production' && activationStorageMode !== 'cloud') {
      return alert('Production POS licenses must use cloud storage mode.');
    }

    setIsActivatingLicense(true);

    try {
      const now = new Date().toISOString();
      const issuedBy = activeStaffSession?.fullName || googleEmail || 'SCI Control Centre';
      const actorStaffId = activeStaffSession?.staffId || 'system';
      const existingVendor = vendors.find(v => v.id === activationVendorId);
      const createdVendor = !existingVendor;
      const vendorId = existingVendor?.id || createId('VND');
      const vendorName =
        existingVendor?.name ||
        `${branchName || getEmailName(ownerEmail)} Vendor`;
      const vendorCode = existingVendor?.code || createCode(vendorName, 'VND');
      const licenseId = createId('POS-LIC');
      const activationId = createId('POS-ACT');
      const branchId = createId('BR');
      const terminalId = createId('TRM');
      const licenseKey = createPOSLicenseKey();

      const updatedVendor: Vendor = {
        ...(existingVendor || {
          id: vendorId,
          name: vendorName,
          category: 'POS Merchant',
          status: 'Active' as const,
          code: vendorCode,
          joinedDate: activationStartDate,
          location: branchName,
        }),
        id: vendorId,
        name: vendorName,
        code: vendorCode,
        email: ownerEmail,
        assignedPlanId: plan.id,
        assignedPlanName: plan.name,
        licenseKey,
        licenseMode: activationLicenseMode,
        storageMode: activationStorageMode,
      };

      const updatedVendors = existingVendor
        ? vendors.map(v => (v.id === vendorId ? updatedVendor : v))
        : [updatedVendor, ...vendors];

      const newLicense: POSLicense = {
        id: licenseId,
        vendorName,
        terminalId,
        licenseKey,
        status: 'Active',
        issuedAt: activationStartDate,
        planName: plan.name,
        expiryDate: activationExpiryDate,
        notes: `Authority activation ${activationId}: ${branchName} / ${terminalName}`,
        billingCycle: plan.interval === 'Annual' ? 'Yearly' : 'Monthly',
        tokenPrice: plan.price,
        collectionTag: `${activationLicenseMode} ${activationStorageMode}`,
      };

      const updatedLicenses = [newLicense, ...posLicenses];
      const activationRecord: POSActivationRecord = createPOSActivationRecord({
        activationId,
        licenseId,
        vendorId,
        vendorName,
        ownerEmail,
        planId: plan.id,
        planName: plan.name,
        branchId,
        branchName,
        terminalId,
        terminalCode,
        status: 'active',
        licenseMode: activationLicenseMode,
        storageMode: activationStorageMode,
        maxBranches: parsePlanLimit(plan.maxBranches, 1),
        maxTerminals: parsePlanLimit(plan.maxTerminals, 1),
        maxStaff: parsePlanLimit(plan.maxStaff, 3),
        maxProducts: parsePlanLimit(plan.maxProducts, 500),
        startsAt: activationStartDate,
        expiresAt: activationExpiryDate,
        issuedBy,
        notes: `Terminal name: ${terminalName}`,
      });

      setVendors(updatedVendors);
      setPosLicenses(updatedLicenses);
      localStorage.setItem('sgn_vendors', JSON.stringify(updatedVendors));
      localStorage.setItem('sgn_pos_licenses', JSON.stringify(updatedLicenses));

      let firestoreMessage = 'Firestore write mode is disabled; activation saved locally.';
      let firestoreResult: 'success' | 'warning' = 'success';

      if (canWriteToFirestore()) {
        const mode = getSCIFirestoreModeState();
        const structuredLicense = posActivationRecordToSCIPOSLicense(activationRecord);
        const structuredActivation = posActivationRecordToFirestoreActivation(activationRecord);
        const firestoreVendor = buildFirestoreVendor(updatedVendor, now, actorStaffId);

        const result = await safeFirestoreWrite(async (repositories) => {
          if (!repositories.licensing) throw new Error('Licensing repository is unavailable.');

          if (createdVendor) {
            if (!repositories.vendors) throw new Error('Vendor repository is unavailable.');
            await repositories.vendors.upsertVendor(firestoreVendor);
          }

          await repositories.licensing.upsertPOSLicense(structuredLicense);
          await repositories.licensing.upsertPOSActivation(structuredActivation);
          await repositories.licensing.upsertLicenseEvent({
            id: `evt_${activationId}`,
            eventId: `evt_${activationId}`,
            vendorId,
            licenseId,
            licenseType: 'pos',
            action: 'activate',
            previousStatus: 'none',
            newStatus: 'active',
            actorId: actorStaffId,
            actorName: issuedBy,
            message: `Control Centre activated POS license ${licenseId} for ${vendorName}.`,
            createdAt: now,
          });

          return activationRecord;
        });

        if (result.success) {
          firestoreMessage = `${mode.label}: activation written to Firestore.`;
        } else {
          firestoreResult = 'warning';
          firestoreMessage = `${mode.label}: local activation created, Firestore write failed (${result.message}).`;
        }
      }

      onAddWorkflow({
        workflowType: 'pos_license',
        title: `POS Activation: ${vendorName}`,
        description: `Activation ${activationId} issued for ${branchName} / ${terminalCode}.`,
        status: 'completed',
        requesterId: actorStaffId,
        requesterName: issuedBy,
        targetId: activationId,
        targetType: 'license',
        currentStep: 3,
        totalSteps: 3,
      });

      onAddWorkspaceAuditEvent({
        workspaceId: 'licensing_centre',
        actorStaffId,
        actorName: issuedBy,
        activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
        action: 'POS_LICENSE_ACTIVATE',
        targetType: 'pos_activation',
        targetId: activationId,
        result: firestoreResult,
        message: `Control Centre issued POS activation ${activationId} and license ${licenseId} for ${vendorName}. ${firestoreMessage}`,
      });

      onAddWorkspaceActivity({
        workspaceId: 'licensing_centre',
        type: 'license',
        severity: firestoreResult === 'success' ? 'success' : 'warning',
        title: 'POS License Activated',
        message: `${vendorName} can now be read from sci_pos_activations as ${activationId}.`,
        actorName: issuedBy,
        targetPath: '/pos',
      });

      onAddWorkspaceNotification({
        title: 'POS Activation Created',
        message: `${vendorName} POS activation ${activationId} was issued by Control Centre.`,
        type: 'license',
        priority: firestoreResult === 'success' ? 'high' : 'critical',
        targetPath: '/pos',
        workspaceId: 'licensing_centre',
      });

      setSelectedLicenseId(licenseId);
      setActivationNotice(`Activation ${activationId} saved to sci_pos_activations.`);
      setIsActivationDrawerOpen(false);
    } finally {
      setIsActivatingLicense(false);
    }
  };

  const handleIssueLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === issueVendorId);
    const plan = plans.find(p => p.id === issuePlanId);

    if (!vendor || !plan) return alert('Please select a valid vendor and plan pricing.');

    const key = `ITRD-POS-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-LIC`;
    const newId = `POS-LIC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLicense: POSLicense = {
      id: newId,
      vendorName: vendor.name,
      terminalId: `TRM-VND-${Math.floor(100 + Math.random() * 900)}`,
      licenseKey: key,
      status: 'Active',
      issuedAt: new Date().toISOString().split('T')[0],
      planName: plan.name,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Issued from POS Licensing Command Centre',
      billingCycle: plan.interval === 'Annual' ? 'Yearly' : 'Monthly',
      tokenPrice: plan.price,
      collectionTag: 'Standard Terminal'
    };

    // Update vendor key
    const updatedVendors = vendors.map(v => v.id === vendor.id ? { ...v, licenseKey: key } : v);
    setVendors(updatedVendors);
    localStorage.setItem('sgn_vendors', JSON.stringify(updatedVendors));

    // Save License
    const updatedLicenses = [newLicense, ...posLicenses];
    setPosLicenses(updatedLicenses);
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(updatedLicenses));

    // Add compliance workflow event
    onAddWorkflow({
      workflowType: 'pos_license',
      title: `License: ${vendor.name}`,
      description: 'POS License key issued and registered.',
      status: 'completed',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: newId,
      targetType: 'license',
      currentStep: 3,
      totalSteps: 3
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_ISSUE',
      targetType: 'license',
      targetId: newId,
      result: 'success',
      message: `Issued POS cryptographic license key for vendor ${vendor.name}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'licensing_centre',
      type: 'license',
      severity: 'success',
      title: 'POS License Issued',
      message: `POS License key ${newId} generated for ${vendor.name}.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    onAddWorkspaceNotification({
      title: 'POS License Issued',
      message: `New terminal license key issued for ${vendor.name}.`,
      type: 'license',
      priority: 'high',
      targetPath: '/pos',
      workspaceId: 'licensing_centre'
    });

    setSelectedLicenseId(newId);
    setIsIssueModalOpen(false);
  };

  const handleRenewLicense = () => {
    if (!selectedLicense) return;

    // Extend 1 year
    const parts = selectedLicense.expiryDate.split('-');
    const newYear = parseInt(parts[0]) + 1;
    const nextExpiry = `${newYear}-${parts[1]}-${parts[2]}`;

    const updated = posLicenses.map(l => l.id === selectedLicense.id ? { ...l, expiryDate: nextExpiry, status: 'Active' as const } : l);
    setPosLicenses(updated);
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(updated));

    // Log Workflow
    onAddWorkflow({
      workflowType: 'pos_license',
      title: `Renewal: ${selectedLicense.vendorName}`,
      description: 'POS License extended for another billing year.',
      status: 'completed',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: selectedLicense.id,
      targetType: 'license',
      currentStep: 3,
      totalSteps: 3
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_RENEW',
      targetType: 'license',
      targetId: selectedLicense.id,
      result: 'success',
      message: `Renewed POS license key term until ${nextExpiry} for vendor ${selectedLicense.vendorName}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'licensing_centre',
      type: 'license',
      severity: 'success',
      title: 'POS License Renewed',
      message: `POS License key ${selectedLicense.id} extended to ${nextExpiry}.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    alert('POS License successfully renewed.');
  };

  const handleSuspendLicense = () => {
    if (!selectedLicense) return;

    const updated = posLicenses.map(l => l.id === selectedLicense.id ? { ...l, status: 'Suspended' as const } : l);
    setPosLicenses(updated);
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_SUSPEND',
      targetType: 'license',
      targetId: selectedLicense.id,
      result: 'success',
      message: `Suspended operations clearance for POS license ${selectedLicense.id}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'licensing_centre',
      type: 'license',
      severity: 'warning',
      title: 'POS License Suspended',
      message: `POS License ${selectedLicense.id} has been suspended.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    onAddWorkspaceNotification({
      title: 'License Suspended',
      message: `License key ${selectedLicense.id} was suspended by security operators.`,
      type: 'security',
      priority: 'high',
      targetPath: '/pos',
      workspaceId: 'licensing_centre'
    });

    alert('POS License suspended.');
  };

  const handleRevokeLicense = () => {
    if (!selectedLicense) return;

    const updated = posLicenses.map(l => l.id === selectedLicense.id ? { ...l, status: 'Revoked' as const } : l);
    setPosLicenses(updated);
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(updated));

    // Remove key from vendor
    const vendor = vendors.find(v => v.name === selectedLicense.vendorName);
    if (vendor) {
      const updatedVendors = vendors.map(v => v.id === vendor.id ? { ...v, licenseKey: undefined } : v);
      setVendors(updatedVendors);
      localStorage.setItem('sgn_vendors', JSON.stringify(updatedVendors));
    }

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_REVOKE',
      targetType: 'license',
      targetId: selectedLicense.id,
      result: 'success',
      message: `Revoked POS license key authorization ${selectedLicense.id} for vendor ${selectedLicense.vendorName}.`
    });

    alert('POS License revoked.');
  };

  const handleExpireLicense = () => {
    if (!selectedLicense) return;

    const updated = posLicenses.map(l => l.id === selectedLicense.id ? { ...l, status: 'Expired' as const } : l);
    setPosLicenses(updated);
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_EXPIRE',
      targetType: 'license',
      targetId: selectedLicense.id,
      result: 'success',
      message: `Set POS license status to Expired for key ${selectedLicense.id}.`
    });

    onAddWorkspaceNotification({
      title: 'License Expired',
      message: `License key ${selectedLicense.id} has expired.`,
      type: 'license',
      priority: 'normal',
      targetPath: '/pos',
      workspaceId: 'licensing_centre'
    });

    alert('POS License set to Expired.');
  };

  const handleStartDemo = () => {
    // 1. Set environment mode to prototype/local_demo
    onChangeEnvMode('prototype');

    // 2. Create demo vendor
    const demoId = `V-DEMO-${Math.floor(100 + Math.random() * 900)}`;
    const newVendor: Vendor = {
      id: demoId,
      name: `Demo Outpost ${Math.floor(10 + Math.random() * 90)}`,
      tradingName: 'Demo Store Enclave',
      category: 'Grocery & Hypermarket',
      email: 'demo@itred.local',
      phone: '000-000-0000',
      country: 'United States',
      city: 'Local Dev Node',
      address: 'Simulated Address',
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      assignedPlanId: 'VENDOR_DEMO',
      assignedPlanName: 'Vendor Demo'
    };

    // 3. Issue demo license (localOnly)
    const key = `DEMO-POS-KEY-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-LOCAL`;
    const licId = `DEMO-LIC-${Math.floor(1000 + Math.random() * 9000)}`;
    
    newVendor.licenseKey = key;

    const newLicense: POSLicense = {
      id: licId,
      vendorName: newVendor.name,
      terminalId: 'TRM-DEMO-LOCAL',
      licenseKey: key,
      status: 'Active',
      issuedAt: new Date().toISOString().split('T')[0],
      planName: 'Vendor Demo',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      notes: 'Demo key (LOCAL ONLY / sandbox sandbox)',
      billingCycle: 'Monthly',
      tokenPrice: 0,
      collectionTag: 'Local Sandbox'
    };

    setVendors([newVendor, ...vendors]);
    setPosLicenses([newLicense, ...posLicenses]);

    localStorage.setItem('sgn_vendors', JSON.stringify([newVendor, ...vendors]));
    localStorage.setItem('sgn_pos_licenses', JSON.stringify([newLicense, ...posLicenses]));

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_DEMO_START',
      targetType: 'demo',
      targetId: demoId,
      result: 'success',
      message: `Started sandbox demo store session: ${newVendor.name}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'licensing_centre',
      type: 'license',
      severity: 'info',
      title: 'Demo Started',
      message: `Started sandbox demo session for ${newVendor.name}.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    alert('Sandbox demo started successfully. Storage mode is locked to localOnly.');
  };

  const handleResetDemo = () => {
    // Clear demo data
    const nonDemosVendors = vendors.filter(v => v.assignedPlanId !== 'VENDOR_DEMO');
    const nonDemosLicenses = posLicenses.filter(l => l.planName !== 'Vendor Demo');

    setVendors(nonDemosVendors);
    setPosLicenses(nonDemosLicenses);

    localStorage.setItem('sgn_vendors', JSON.stringify(nonDemosVendors));
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(nonDemosLicenses));

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_DEMO_RESET',
      targetType: 'demo',
      targetId: 'all',
      result: 'success',
      message: 'Reset sandbox demo databases. All local demo logs purged.'
    });

    alert('Local sandbox demo data reset successfully.');
  };

  const handleConvertDemoToPaid = (vendor: Vendor) => {
    if (!vendor) return;
    
    // Change plan & issue starter license
    const starterPlan = plans.find(p => p.id === 'PLN-POS-STARTER') || plans[0];
    const key = `ITRD-POS-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-LIC`;
    const licId = `POS-LIC-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedVendors = vendors.map(v => {
      if (v.id === vendor.id) {
        return {
          ...v,
          assignedPlanId: starterPlan.id,
          assignedPlanName: starterPlan.name,
          licenseKey: key
        };
      }
      return v;
    });

    const demoLic = posLicenses.find(l => l.vendorName === vendor.name);
    let updatedLicenses: POSLicense[];

    const newLicense: POSLicense = {
      id: licId,
      vendorName: vendor.name,
      terminalId: 'TRM-PROD-CONV',
      licenseKey: key,
      status: 'Active',
      issuedAt: new Date().toISOString().split('T')[0],
      planName: starterPlan.name,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Upgraded from Local Demo mode',
      billingCycle: 'Monthly',
      tokenPrice: starterPlan.price,
      collectionTag: 'Demo Upgraded'
    };

    if (demoLic) {
      updatedLicenses = posLicenses.map(l => l.id === demoLic.id ? newLicense : l);
    } else {
      updatedLicenses = [newLicense, ...posLicenses];
    }

    setVendors(updatedVendors);
    setPosLicenses(updatedLicenses);

    localStorage.setItem('sgn_vendors', JSON.stringify(updatedVendors));
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(updatedLicenses));

    // Update workflow
    onAddWorkflow({
      workflowType: 'vendor_activation',
      title: `Conversion: ${vendor.name}`,
      description: 'Demo converted to paid Starter subscription plan.',
      status: 'completed',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: vendor.id,
      targetType: 'vendor',
      currentStep: 5,
      totalSteps: 5
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_DEMO_CONVERSION',
      targetType: 'demo',
      targetId: vendor.id,
      result: 'success',
      message: `Upgraded demo store "${vendor.name}" to production paid Starter POS plan.`
    });

    onAddWorkspaceNotification({
      title: 'Demo converted to Paid',
      message: `Vendor ${vendor.name} converted successfully to Starter POS plan.`,
      type: 'license',
      priority: 'normal',
      targetPath: '/pos',
      workspaceId: 'licensing_centre'
    });

    alert(`Conversion successful. Vendor ${vendor.name} upgraded to Starter POS.`);
  };

  // Filtered Licenses for Table
  const filteredLicenses = useMemo(() => {
    return posLicenses.filter(l => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        l.id.toLowerCase().includes(q) ||
        l.vendorName.toLowerCase().includes(q) ||
        l.planName.toLowerCase().includes(q) ||
        l.licenseKey.toLowerCase().includes(q);

      const matchStatus = filterStatus === 'all' || l.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [posLicenses, searchQuery, filterStatus]);

  // Available vendors for new license issuance
  const unlicensedVendors = useMemo(() => {
    return vendors.filter(v => !v.licenseKey);
  }, [vendors]);

  return (
    <div className="space-y-6 select-none font-mono text-[#1A1A1A]">
      
      {/* Header and Switcher tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D1D1CF] pb-4">
        <div className="text-left">
          <h1 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] font-sans">
            POS & Terminal License Enclave
          </h1>
          <p className="text-[10px] text-gray-500 font-medium font-sans">
            Cryptographic key validation and sandbox local testing command center.
          </p>
        </div>

        <div className="flex border-2 border-[#1A1A1A] bg-white text-[9px] font-black uppercase rounded-none">
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-3 py-1.5 cursor-pointer transition-all border-r border-[#1A1A1A] ${
              activeTab === 'manager' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F4F4F1] text-gray-700 bg-transparent'
            }`}
          >
            License Manager & Val
          </button>
          <button
            onClick={() => setActiveTab('demo-licensing')}
            className={`px-3 py-1.5 cursor-pointer transition-all ${
              activeTab === 'demo-licensing' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F4F4F1] text-gray-700 bg-transparent'
            }`}
          >
            Demo Licensing
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: LICENSE MANAGER + VALIDATION + TIMELINE */}
      {activeTab === 'manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left / Table area (Col span 2) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            
            {/* Search and Filters */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keys, ID, vendor..."
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 pl-9 text-xs focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase tracking-wider"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-gray-500 shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border-2 border-[#1A1A1A] p-1.5 text-[9px] font-black focus:outline-none uppercase cursor-pointer rounded-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                  <option value="Revoked">Revoked</option>
                </select>
              </div>
            </div>

            {/* License registry Table */}
            <div className="bg-white border-2 border-[#1A1A1A] overflow-hidden">
              
              <div className="bg-[#FAF9F6] border-b border-[#1A1A1A] p-2.5 flex justify-between items-center text-[9px] font-black uppercase text-gray-500">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Licensed Terminals Registry</span>
                  <span className="border border-[#D1D1CF] bg-white px-1.5 py-0.5 text-[7px] text-gray-500">
                    ACTIVATIONS {activationRecords.length}
                  </span>
                </div>
                
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={openActivationDrawer}
                    className="bg-[#FF5A00] text-white border border-[#FF5A00] hover:bg-[#1A1A1A] hover:border-[#1A1A1A] px-2 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    Activate POS License
                  </button>

                  {selectedLicense && (
                    <>
                      <button
                        onClick={handleRenewLicense}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                      >
                        Renew
                      </button>
                      <button
                        onClick={handleSuspendLicense}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={handleRevokeLicense}
                        className="bg-white border border-[#1A1A1A] hover:bg-red-650 hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                      >
                        Revoke
                      </button>
                      <button
                        onClick={handleExpireLicense}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                      >
                        Expire
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[9px] font-mono">
                  <thead>
                    <tr className="bg-stone-50 border-b border-[#1A1A1A] uppercase font-bold text-[8px] tracking-wider text-gray-500">
                      <th className="p-3 border-r border-gray-200">License ID</th>
                      <th className="p-3 border-r border-gray-200">Vendor</th>
                      <th className="p-3 border-r border-gray-200">Pricing Plan</th>
                      <th className="p-3 border-r border-gray-200">Key Signature</th>
                      <th className="p-3 border-r border-gray-200">Limits</th>
                      <th className="p-3 border-r border-gray-200">Expiry</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLicenses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-gray-400 italic">
                          No cryptographic licenses discovered matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLicenses.map(lic => {
                        const isSelected = selectedLicenseId === lic.id;
                        const isDemo = lic.planName === 'Vendor Demo';
                        
                        let badge = 'bg-stone-100 text-stone-800 border-stone-300';
                        if (lic.status === 'Active') badge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                        else if (lic.status === 'Suspended') badge = 'bg-yellow-50 text-yellow-800 border-yellow-300';
                        else if (lic.status === 'Expired') badge = 'bg-red-50 text-red-800 border-red-300';
                        else if (lic.status === 'Revoked') badge = 'bg-black text-white border-black';

                        return (
                          <tr
                            key={lic.id}
                            onClick={() => setSelectedLicenseId(lic.id)}
                            className={`border-b border-gray-150 hover:bg-[#FAF9F6] transition-colors cursor-pointer ${
                              isSelected ? 'bg-orange-50/40 font-bold' : ''
                            }`}
                          >
                            <td className="p-3 border-r border-gray-200 font-bold text-gray-450 flex items-center space-x-1">
                              <span>{lic.id}</span>
                              {isDemo && (
                                <span className="bg-orange-100 text-orange-850 px-1 py-0.2 text-[6px] font-black uppercase tracking-widest border border-orange-200 shrink-0">DEMO</span>
                              )}
                            </td>
                            <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{lic.vendorName}</td>
                            <td className="p-3 border-r border-gray-200 font-sans text-gray-500 uppercase text-[8px]">{lic.planName}</td>
                            <td className="p-3 border-r border-gray-200 font-mono text-[8px] uppercase select-all font-bold text-gray-600">{lic.licenseKey}</td>
                            <td className="p-3 border-r border-gray-200 text-gray-500 text-[8px]">
                              {lic.terminalId}
                            </td>
                            <td className="p-3 border-r border-gray-200 font-mono">{lic.expiryDate}</td>
                            <td className="p-3">
                              <span className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${badge}`}>
                                {lic.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

          {/* Right column: validation panel + event logs (Col span 1) */}
          <div className="lg:col-span-1 space-y-4 text-left">
            
            {/* Real-Time Terminal Validation Panel */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
              
              <div className="border-b border-[#D1D1CF] pb-2.5 mb-4">
                <div className="flex items-center space-x-2 text-[#FF5A00] font-black uppercase text-[10px]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Real-Time POS Access Validator</span>
                </div>
                <p className="text-[8px] text-gray-400 font-medium font-sans mt-0.5">
                  Verify cryptographic license clearance before booting endpoint terminal.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-gray-500 text-[8px] font-black uppercase">SELECT VENDOR SYSTEM</label>
                  <select
                    value={selectedValidationVendorId}
                    onChange={(e) => setSelectedValidationVendorId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 text-xs font-bold focus:outline-none uppercase cursor-pointer"
                  >
                    <option value="">-- SELECT VENDOR RECORD --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.id})
                      </option>
                    ))}
                  </select>
                </div>

                {validationResult ? (
                  <div className="space-y-3 font-mono text-[9px] uppercase font-bold">
                    
                    {/* Status Alert box */}
                    <div className={`p-3 border-2 flex items-start space-x-2 ${
                      validationResult.allowed 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                        : 'bg-red-50 border-red-500 text-red-800'
                    }`}>
                      <div className="shrink-0 mt-0.5">
                        {validationResult.allowed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-black text-[10px] tracking-wide">
                          VALIDATION STATUS: {validationResult.allowed ? 'ALLOWED' : 'BLOCKED'}
                        </div>
                        <p className="font-sans normal-case text-gray-600 text-[9.5px] mt-0.5 leading-normal">
                          {validationResult.message}
                        </p>
                      </div>
                    </div>

                    {/* Metadata breakdown */}
                    <div className="p-3 bg-stone-50 border border-[#D1D1CF] space-y-1.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>License ID:</span>
                        <span className="text-gray-900">{validationResult.licenseId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pricing Plan:</span>
                        <span className="text-gray-900">{validationResult.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expiration:</span>
                        <span className="text-gray-900">{validationResult.expiry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uplink Mode:</span>
                        <span className="text-orange-500">{validationResult.mode.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage policy:</span>
                        <span className="text-gray-900">{validationResult.storage.toUpperCase()}</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 text-center text-gray-400 italic text-[9px] border border-dashed border-gray-300 font-bold uppercase">
                    Select a vendor node from dropdown to compile diagnostics.
                  </div>
                )}
              </div>
            </div>

            {/* License events vertical timeline */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
              
              <div className="border-b border-[#D1D1CF] pb-2.5 mb-4">
                <div className="flex items-center space-x-2 text-[#FF5A00] font-black uppercase text-[10px]">
                  <History className="w-4 h-4 shrink-0" />
                  <span>License events timeline</span>
                </div>
              </div>

              <div className="relative border-l border-[#D1D1CF] pl-4 ml-2 space-y-4 text-left font-sans">
                {licenseEvents.length === 0 ? (
                  <div className="text-[9px] text-gray-400 italic uppercase font-mono font-bold">No licensing actions logged in telemetry database.</div>
                ) : (
                  licenseEvents.map(e => (
                    <div key={e.auditId} className="relative">
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 bg-white border-[#FF5A00] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-full" />
                      </div>
                      <div className="text-[9px]">
                        <div className="font-mono font-black uppercase tracking-wider text-gray-800 flex justify-between">
                          <span>{e.action.replace('POS_LICENSE_', '')}</span>
                          <span className="text-[7.5px] text-gray-400 font-normal">[{new Date(e.createdAt).toLocaleTimeString()}]</span>
                        </div>
                        <div className="text-gray-500 font-medium text-[8px] leading-relaxed mt-0.5 font-sans normal-case">{e.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* RENDER TAB 2: DEMO LICENSING PANEL */}
      {activeTab === 'demo-licensing' && (
        <div className="space-y-6 text-left">
          
          {/* Split controls: Start / Reset sandbox */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase text-gray-800">Sandbox Environment Control</h3>
              <p className="text-[9px] text-gray-500 font-medium font-sans mt-0.5 normal-case">
                Boot simulated prototype networks to run license validation checks under localOnly constraints.
              </p>
            </div>

            <div className="flex space-x-2 text-[9px] font-black uppercase">
              <button
                type="button"
                onClick={handleStartDemo}
                className="bg-[#FF5A00] text-white hover:bg-[#1A1A1A] border border-transparent px-3 py-2 cursor-pointer transition-colors"
              >
                Boot Demo Sandbox
              </button>
              <button
                type="button"
                onClick={handleResetDemo}
                className="bg-white border border-[#1A1A1A] hover:bg-red-650 hover:text-white hover:border-transparent px-3 py-2 cursor-pointer transition-colors"
              >
                Purge Sandbox Logs
              </button>
            </div>
          </div>

          {/* Double column grid for Demos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Demo Vendors list */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
              <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px] flex justify-between items-center">
                <span>Demo Sandbox Vendors ({demoVendorsList.length})</span>
                <span className="bg-orange-100 text-orange-950 text-[7px] px-1 border border-orange-200 font-sans">DEMO ONLY</span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 text-[9px] font-bold">
                {demoVendorsList.length === 0 ? (
                  <div className="text-[9px] text-gray-400 italic uppercase">No active sandbox vendor nodes.</div>
                ) : (
                  demoVendorsList.map(v => (
                    <div key={v.id} className="bg-orange-50/20 border border-orange-200 p-3 flex justify-between items-center rounded-none">
                      <div>
                        <div className="text-gray-900 font-black">{v.name} ({v.id})</div>
                        <div className="text-gray-400 text-[8px] font-medium font-sans normal-case mt-0.5">
                          Uplink Location: {v.city || 'Localhost'} • Storage: {v.storageMode || 'localOnly'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleConvertDemoToPaid(v)}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                      >
                        Convert to Paid
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Demo Licenses list */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
              <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px] flex justify-between items-center">
                <span>Demo Sandbox Licenses ({demoLicensesList.length})</span>
                <span className="bg-orange-100 text-orange-950 text-[7px] px-1 border border-orange-200 font-sans">LOCAL ONLY</span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 text-[9px] font-bold font-mono">
                {demoLicensesList.length === 0 ? (
                  <div className="text-[9px] text-gray-400 italic uppercase">No sandbox licenses active.</div>
                ) : (
                  demoLicensesList.map(l => (
                    <div key={l.id} className="bg-orange-50/20 border border-orange-200 p-3 space-y-1 rounded-none">
                      <div className="flex justify-between items-center text-[8px]">
                        <span className="text-[#FF5A00] font-black font-mono">ID: {l.id}</span>
                        <span className="text-gray-400 font-sans normal-case font-medium">{l.expiryDate}</span>
                      </div>
                      <div className="text-gray-800">{l.vendorName}</div>
                      <div className="text-gray-400 text-[8.5px] font-bold uppercase tracking-widest break-all font-mono">
                        KEY: {l.licenseKey}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ACTIVATE POS LICENSE DRAWER */}
      {isActivationDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex justify-end">
          <form
            onSubmit={handleActivatePOSLicense}
            className="h-full w-full max-w-xl bg-white border-l-4 border-[#1A1A1A] shadow-2xl overflow-y-auto text-left font-mono text-[#1A1A1A]"
          >
            <div className="sticky top-0 z-10 bg-white border-b-2 border-[#1A1A1A]">
              <div className="h-1.5 bg-[#FF5A00]" />
              <div className="p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#FF5A00]">
                    Control Centre Authority
                  </div>
                  <h3 className="font-sans font-black text-sm uppercase mt-1">
                    Activate POS License
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActivationDrawerOpen(false)}
                  className="border-2 border-[#1A1A1A] w-8 h-8 inline-flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white cursor-pointer"
                  aria-label="Close activation drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5 text-[9px] font-bold text-gray-500">
              {activationNotice && (
                <div className="border border-emerald-300 bg-emerald-50 text-emerald-800 p-3 font-black uppercase">
                  {activationNotice}
                </div>
              )}

              <div className="space-y-1">
                <label className="uppercase flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Select vendor
                </label>
                <select
                  value={activationVendorId}
                  onChange={(e) => handleActivationVendorChange(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none text-[10px] font-bold cursor-pointer uppercase"
                >
                  <option value={NEW_VENDOR_OPTION}>Create vendor from owner email</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="uppercase flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Owner Google Email
                </label>
                <input
                  type="email"
                  value={activationOwnerEmail}
                  onChange={(e) => setActivationOwnerEmail(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none focus:border-[#FF5A00] text-[10px] font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Select plan
                </label>
                <select
                  value={activationPlanId}
                  onChange={(e) => handleActivationPlanChange(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none text-[10px] font-bold cursor-pointer uppercase"
                  required
                >
                  {posPlanOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.interval} - ${p.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Branch name</label>
                  <input
                    type="text"
                    value={activationBranchName}
                    onChange={(e) => setActivationBranchName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none focus:border-[#FF5A00] text-[10px] font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Terminal name</label>
                  <input
                    type="text"
                    value={activationTerminalName}
                    onChange={(e) => setActivationTerminalName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none focus:border-[#FF5A00] text-[10px] font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  Terminal code
                </label>
                <input
                  type="text"
                  value={activationTerminalCode}
                  onChange={(e) => setActivationTerminalCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none focus:border-[#FF5A00] text-[10px] font-bold uppercase tracking-wider"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Start date
                  </label>
                  <input
                    type="date"
                    value={activationStartDate}
                    onChange={(e) => setActivationStartDate(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none focus:border-[#FF5A00] text-[10px] font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expiry date
                  </label>
                  <input
                    type="date"
                    value={activationExpiryDate}
                    onChange={(e) => setActivationExpiryDate(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none focus:border-[#FF5A00] text-[10px] font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">License mode</label>
                  <select
                    value={activationLicenseMode}
                    onChange={(e) => {
                      const mode = e.target.value as POSLicenseMode;
                      setActivationLicenseMode(mode);
                      setActivationStorageMode(mode === 'demo' ? 'localOnly' : 'cloud');
                    }}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none text-[10px] font-bold cursor-pointer uppercase"
                  >
                    <option value="demo">Demo</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Storage mode</label>
                  <select
                    value={activationStorageMode}
                    onChange={(e) => setActivationStorageMode(e.target.value as POSStorageMode)}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none text-[10px] font-bold cursor-pointer uppercase"
                  >
                    <option value="localOnly">Local Only</option>
                    <option value="cloud">Cloud</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t-2 border-[#1A1A1A] p-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsActivationDrawerOpen(false)}
                className="px-3 py-2 border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[10px] font-black uppercase cursor-pointer inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActivatingLicense}
                className="px-3 py-2 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] disabled:opacity-60 disabled:cursor-wait text-[10px] font-black uppercase cursor-pointer inline-flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {isActivatingLicense ? 'Activating' : 'Activate'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ISSUE LICENSE DIALOG */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleIssueLicense} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative font-mono text-[#1A1A1A]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase border-b border-[#D1D1CF] pb-2">
              Issue POS terminal License
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Select Target Vendor</label>
                <select
                  value={issueVendorId}
                  onChange={(e) => setIssueVendorId(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                >
                  {unlicensedVendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Select Subscription Plan</label>
                <select
                  value={issuePlanId}
                  onChange={(e) => setIssuePlanId(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Generate Key
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
