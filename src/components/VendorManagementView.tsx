import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../App';
import { Vendor, Plan, RPNAgent, POSLicense } from '../types';
import { 
  Building, 
  FileText, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Plus, 
  Sliders, 
  Bookmark, 
  ArrowRight, 
  RotateCcw,
  ShieldAlert,
  Cpu,
  Trash2,
  Edit,
  ChevronDown,
  User,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function VendorManagementView() {
  const { 
    vendors, 
    setVendors, 
    plans, 
    activeStaffSession, 
    posLicenses, 
    setPosLicenses, 
    rpnAgents, 
    setRpnAgents,
    workflows,
    onAddWorkflow,
    onUpdateWorkflow,
    workspaceAuditEvents,
    onAddWorkspaceAuditEvent,
    onAddWorkspaceActivity,
    onAddWorkspaceNotification
  } = useLifecycle();

  // Active view layout tab: 'registry' (registry + profile) or 'activations' (activation queue)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'registry' | 'activations'>('registry');

  // Selected Vendor for Profile inspect
  const [selectedVendorId, setSelectedVendorId] = useState<string>(() => {
    return vendors[0]?.id || '';
  });

  const selectedVendor = useMemo(() => {
    return vendors.find(v => v.id === selectedVendorId) || null;
  }, [vendors, selectedVendorId]);

  // Profile View tabs
  const [activeProfileTab, setActiveProfileTab] = useState<'general' | 'contacts' | 'business' | 'plan' | 'license' | 'apps' | 'audit' | 'timeline'>('general');

  // Activation Queue filters
  const [queueFilter, setQueueFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'Needs Review'>('Pending');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterBusinessType, setFilterBusinessType] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStorageMode, setFilterStorageMode] = useState('all');

  // Modals visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const [isAssignRpnOpen, setIsAssignRpnOpen] = useState(false);
  const [isIssueLicenseOpen, setIsIssueLicenseOpen] = useState(false);

  // Form states - Create / Edit Vendor
  const [formName, setFormName] = useState('');
  const [formTradingName, setFormTradingName] = useState('');
  const [formCategory, setFormCategory] = useState('Grocery & Hypermarket');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCountry, setFormCountry] = useState('United States');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formStorageMode, setFormStorageMode] = useState<'localOnly' | 'cloud'>('localOnly');

  // Form states - Assignments
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedRpnId, setSelectedRpnId] = useState('');

  // Resolved list of countries and categories from actual vendors list
  const uniqueCountries = useMemo(() => {
    const list = new Set(vendors.map(v => v.country || 'United States'));
    return Array.from(list);
  }, [vendors]);

  const uniqueCategories = useMemo(() => {
    const list = new Set(vendors.map(v => v.category));
    return Array.from(list);
  }, [vendors]);

  // Enterprise KPI Counts
  const kpis = useMemo(() => {
    const pending = vendors.filter(v => v.status === 'Pending Verification').length;
    const active = vendors.filter(v => v.status === 'Active').length;
    const suspended = vendors.filter(v => v.status === 'Suspended').length;
    const demo = vendors.filter(v => v.assignedPlanId === 'VENDOR_DEMO').length;
    const awaitingLicense = vendors.filter(v => !v.licenseKey).length;
    const awaitingRpn = vendors.filter(v => !v.linkedRpnId).length;

    return { pending, active, suspended, demo, awaitingLicense, awaitingRpn };
  }, [vendors]);

  // Filtering Logic
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        v.name.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.phone && v.phone.toLowerCase().includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        v.category.toLowerCase().includes(q);

      // 2. Filters
      const matchCountry = filterCountry === 'all' || v.country === filterCountry;
      const matchType = filterBusinessType === 'all' || v.category === filterBusinessType;
      const matchPlan = filterPlan === 'all' || v.assignedPlanId === filterPlan;
      const matchStatus = filterStatus === 'all' || v.status === filterStatus;
      const matchStorage = filterStorageMode === 'all' || (v.storageMode || 'localOnly') === filterStorageMode;

      return matchSearch && matchCountry && matchType && matchPlan && matchStatus && matchStorage;
    });
  }, [vendors, searchQuery, filterCountry, filterBusinessType, filterPlan, filterStatus, filterStorageMode]);

  // Resolve audit logs for selected vendor
  const vendorAuditLogs = useMemo(() => {
    if (!selectedVendor) return [];
    return workspaceAuditEvents.filter(e => e.targetId === selectedVendor.id);
  }, [workspaceAuditEvents, selectedVendor]);

  // Resolve active workflow for selected vendor
  const vendorWorkflow = useMemo(() => {
    if (!selectedVendor) return null;
    return workflows.find(w => w.targetId === selectedVendor.id && w.workflowType === 'vendor_activation') || null;
  }, [workflows, selectedVendor]);

  // Onboarding timeline status resolver
  const timelineSteps = useMemo(() => {
    if (!selectedVendor) return [];
    const hasRpn = !!selectedVendor.linkedRpnId;
    const hasPlan = !!selectedVendor.assignedPlanId;
    const hasLicense = !!selectedVendor.licenseKey;
    const isActive = selectedVendor.status === 'Active';

    return [
      { id: 'created', label: 'Vendor Created', desc: 'General business record established.', done: true },
      { id: 'activation', label: 'Activation Requested', desc: 'Operational gateway verification initiated.', done: selectedVendor.status !== 'Draft' },
      { id: 'rpn', label: 'RPN Assigned', desc: hasRpn ? `Route mapped to ${selectedVendor.linkedRpnName || 'Agent'}.` : 'Awaiting RPN gateway assignment.', done: hasRpn },
      { id: 'plan', label: 'Plan Assigned', desc: hasPlan ? `Assigned plan: ${selectedVendor.assignedPlanName}.` : 'Awaiting plan pricing model selection.', done: hasPlan },
      { id: 'license', label: 'POS License Issued', desc: hasLicense ? `Cryptographic license issued.` : 'Awaiting POS terminal key signature.', done: hasLicense },
      { id: 'activated', label: 'Vendor Activated', desc: isActive ? 'Console clearance fully live.' : 'Awaiting operational approval sign-off.', done: isActive }
    ];
  }, [selectedVendor]);

  // Queue vendors
  const queueVendors = useMemo(() => {
    return vendors.filter(v => {
      if (queueFilter === 'Pending') return v.status === 'Pending Verification';
      if (queueFilter === 'Approved') return v.status === 'Approved';
      if (queueFilter === 'Rejected') return v.status === 'Rejected';
      if (queueFilter === 'Needs Review') return v.status === 'Ready' || v.status === 'Draft';
      return false;
    });
  }, [vendors, queueFilter]);

  // Operational Commands & Actions

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return alert('Business name is required.');

    const newId = `V-${Math.floor(100 + Math.random() * 900)}`;
    const newVendor: Vendor = {
      id: newId,
      name: formName,
      tradingName: formTradingName || formName,
      category: formCategory,
      email: formEmail || 'contact@vendor.sci',
      phone: formPhone || '',
      country: formCountry,
      city: formCity || 'Boston',
      address: formAddress || '',
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Pending Verification', // default lifecycle entry state
      storageMode: formStorageMode
    };

    // Create default onboarding workflow
    onAddWorkflow({
      workflowType: 'vendor_activation',
      title: `Activation: ${formName}`,
      description: 'Vendor created. Pending RPN route assignment.',
      status: 'pending',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: newId,
      targetType: 'vendor',
      currentStep: 1,
      totalSteps: 5
    });

    // Save Vendor
    const updated = [newVendor, ...vendors];
    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    // Audit & Notify
    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_CREATE',
      targetType: 'vendor',
      targetId: newId,
      result: 'success',
      message: `Created new vendor record ${formName} (${newId}) in Draft mode.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'vendor_operations',
      type: 'vendor',
      severity: 'info',
      title: 'New Vendor Created',
      message: `Vendor ${formName} has been initialized in the system.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    onAddWorkspaceNotification({
      title: 'Vendor Created',
      message: `Vendor ${formName} has been registered and is pending activation review.`,
      type: 'approval',
      priority: 'high',
      targetPath: '/vendors',
      workspaceId: 'vendor_operations'
    });

    setSelectedVendorId(newId);
    setIsCreateModalOpen(false);

    // Reset Form
    setFormName('');
    setFormTradingName('');
    setFormEmail('');
    setFormPhone('');
    setFormCity('');
    setFormAddress('');
  };

  const handleEditVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    const updated = vendors.map(v => {
      if (v.id === selectedVendor.id) {
        return {
          ...v,
          name: formName,
          tradingName: formTradingName,
          category: formCategory,
          email: formEmail,
          phone: formPhone,
          country: formCountry,
          city: formCity,
          address: formAddress,
          storageMode: formStorageMode
        };
      }
      return v;
    });

    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_EDIT',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Updated profile settings for vendor ${selectedVendor.name}.`
    });

    setIsEditModalOpen(false);
  };

  const handleSuspend = () => {
    if (!selectedVendor) return;
    const updated = vendors.map(v => v.id === selectedVendor.id ? { ...v, status: 'Suspended' as const } : v);
    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_SUSPEND',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Suspended operations clearance for vendor ${selectedVendor.name}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'vendor_operations',
      type: 'vendor',
      severity: 'warning',
      title: 'Vendor Suspended',
      message: `Vendor ${selectedVendor.name} has been suspended.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    alert(`Vendor ${selectedVendor.name} suspended.`);
  };

  const handleReactivate = () => {
    if (!selectedVendor) return;
    const updated = vendors.map(v => v.id === selectedVendor.id ? { ...v, status: 'Active' as const } : v);
    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_REACTIVATE',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Restored active operations clearance for vendor ${selectedVendor.name}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'vendor_operations',
      type: 'vendor',
      severity: 'success',
      title: 'Vendor Reactivated',
      message: `Vendor ${selectedVendor.name} has been reactivated.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    alert(`Vendor ${selectedVendor.name} reactivated.`);
  };

  const handleConvertDemo = () => {
    if (!selectedVendor) return;
    const updated = vendors.map(v => {
      if (v.id === selectedVendor.id) {
        return {
          ...v,
          assignedPlanId: 'PLN-POS-STARTER',
          assignedPlanName: 'Starter POS'
        };
      }
      return v;
    });
    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_DEMO_CONVERSION',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Converted vendor ${selectedVendor.name} from Demo to Paid Starter POS plan.`
    });

    onAddWorkspaceNotification({
      title: 'Demo Converted to Paid',
      message: `Vendor ${selectedVendor.name} converted successfully to Starter POS plan.`,
      type: 'license',
      priority: 'normal',
      targetPath: '/vendors',
      workspaceId: 'vendor_operations'
    });

    alert(`Demo converted successfully for ${selectedVendor.name}.`);
  };

  const handleAssignPlan = (planId: string) => {
    if (!selectedVendor) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const updated = vendors.map(v => {
      if (v.id === selectedVendor.id) {
        return {
          ...v,
          assignedPlanId: plan.id,
          assignedPlanName: plan.name
        };
      }
      return v;
    });

    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    // Update activation workflow progress
    if (vendorWorkflow) {
      onUpdateWorkflow(vendorWorkflow.workflowId, {
        currentStep: 3,
        description: 'Plan assigned. Awaiting POS licensing setup.'
      });
    }

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'PLAN_ASSIGN',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Assigned pricing plan "${plan.name}" to vendor ${selectedVendor.name}.`
    });

    setIsAssignPlanOpen(false);
    alert(`Plan assigned: ${plan.name}`);
  };

  const handleAssignRpn = (rpnId: string) => {
    if (!selectedVendor) return;
    const agent = rpnAgents.find(a => a.id === rpnId);
    if (!agent) return;

    const updated = vendors.map(v => {
      if (v.id === selectedVendor.id) {
        return {
          ...v,
          linkedRpnId: agent.id,
          linkedRpnName: agent.name
        };
      }
      return v;
    });

    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    // Update activation workflow progress
    if (vendorWorkflow) {
      onUpdateWorkflow(vendorWorkflow.workflowId, {
        currentStep: 2,
        description: 'RPN node linked. Awaiting subscription plan assignment.'
      });
    }

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'RPN_ASSIGN',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Mapped vendor ${selectedVendor.name} routing to RPN node "${agent.name}".`
    });

    setIsAssignRpnOpen(false);
    alert(`RPN node assigned: ${agent.name}`);
  };

  const handleIssueLicense = () => {
    if (!selectedVendor) return;
    const key = `ITRD-POS-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-\ ${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-LIC`;

    const updated = vendors.map(v => {
      if (v.id === selectedVendor.id) {
        return {
          ...v,
          licenseKey: key
        };
      }
      return v;
    });

    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    // Add key to posLicenses list
    const newLicense: POSLicense = {
      id: `POS-LIC-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorName: selectedVendor.name,
      terminalId: `TRM-VND-${Math.floor(100 + Math.random() * 905)}`,
      licenseKey: key,
      status: 'Active',
      issuedAt: new Date().toISOString().split('T')[0],
      planName: selectedVendor.assignedPlanName || 'Starter POS',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Generated from Vendor Operations Lifecycle Panel',
      billingCycle: 'Yearly',
      tokenPrice: 120,
      collectionTag: 'Standard Activation'
    };

    const updatedLicenses = [newLicense, ...posLicenses];
    setPosLicenses(updatedLicenses);
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(updatedLicenses));

    // Update activation workflow progress
    if (vendorWorkflow) {
      onUpdateWorkflow(vendorWorkflow.workflowId, {
        currentStep: 4,
        description: 'POS License issued. Awaiting final operational approval.'
      });
    }

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_ISSUE',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Issued cryptographic licensing key ${key} for vendor ${selectedVendor.name}.`
    });

    onAddWorkspaceNotification({
      title: 'POS License Issued',
      message: `Cryptographic license issued successfully for ${selectedVendor.name}.`,
      type: 'license',
      priority: 'high',
      targetPath: '/pos',
      workspaceId: 'licensing_centre'
    });

    setIsIssueLicenseOpen(false);
    alert('POS License Key successfully issued!');
  };

  const handleApproveOnboarding = () => {
    if (!selectedVendor) return;
    const updated = vendors.map(v => v.id === selectedVendor.id ? { ...v, status: 'Active' as const } : v);
    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    // Complete workflow
    if (vendorWorkflow) {
      onUpdateWorkflow(vendorWorkflow.workflowId, {
        currentStep: 5,
        status: 'completed',
        description: 'Vendor fully approved and activated.'
      });
    }

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_APPROVE',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Approved onboarding activation for vendor ${selectedVendor.name}.`
    });

    onAddWorkspaceNotification({
      title: 'Vendor Approved',
      message: `Vendor ${selectedVendor.name} onboarding workflow approved and console is live.`,
      type: 'approval',
      priority: 'high',
      targetPath: '/vendors',
      workspaceId: 'vendor_operations'
    });

    alert(`Vendor ${selectedVendor.name} successfully activated.`);
  };

  const handleRejectOnboarding = () => {
    if (!selectedVendor) return;
    const updated = vendors.map(v => v.id === selectedVendor.id ? { ...v, status: 'Rejected' as const } : v);
    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    // Cancel / Reject workflow
    if (vendorWorkflow) {
      onUpdateWorkflow(vendorWorkflow.workflowId, {
        status: 'rejected',
        description: 'Vendor onboarding activation rejected.'
      });
    }

    onAddWorkspaceAuditEvent({
      workspaceId: 'vendor_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System Operator',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'VENDOR_REJECT',
      targetType: 'vendor',
      targetId: selectedVendor.id,
      result: 'success',
      message: `Rejected onboarding request for vendor ${selectedVendor.name}.`
    });

    onAddWorkspaceNotification({
      title: 'Vendor Onboarding Rejected',
      message: `Vendor ${selectedVendor.name} onboarding request was rejected.`,
      type: 'approval',
      priority: 'high',
      targetPath: '/vendors',
      workspaceId: 'vendor_operations'
    });

    alert(`Vendor ${selectedVendor.name} onboarding rejected.`);
  };

  return (
    <div className="space-y-6 select-none font-mono text-[#1A1A1A]">
      
      {/* Dynamic Header & Operational Tab Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D1D1CF] pb-4">
        <div>
          <h1 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] font-sans">
            Vendor Operations Lifecycle Workspace
          </h1>
          <p className="text-[10px] text-gray-500 font-medium font-sans">
            Centralized portal for managing vendor activation pipelines, pricing configs, routing nodes, and compliance states.
          </p>
        </div>

        <div className="flex border-2 border-[#1A1A1A] bg-white text-[9px] font-black uppercase rounded-none">
          <button
            onClick={() => setActiveWorkspaceTab('registry')}
            className={`px-3 py-1.5 cursor-pointer transition-all border-r border-[#1A1A1A] ${
              activeWorkspaceTab === 'registry' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F4F4F1] text-gray-700 bg-transparent'
            }`}
          >
            Vendor Registry
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('activations')}
            className={`px-3 py-1.5 cursor-pointer transition-all ${
              activeWorkspaceTab === 'activations' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F4F4F1] text-gray-700 bg-transparent'
            }`}
          >
            Activation Queue
          </button>
        </div>
      </div>

      {/* ENTERPRISE KPI DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5A00]" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Pending Activations</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.pending}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Verification requested</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Active Vendors</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.active}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Live console clearance</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Suspended Vendors</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.suspended}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Operations disabled</span>
        </div>

        {/* Card 4 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-orange-400" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Demo Vendors</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.demo}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Sandbox usage limit</span>
        </div>

        {/* Card 5 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Awaiting License</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.awaitingLicense}</span>
          <span className="text-[7px] text-gray-500 font-medium block">POS Key missing</span>
        </div>

        {/* Card 6 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Awaiting RPN</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.awaitingRpn}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Routing node empty</span>
        </div>

      </div>

      {/* RENDER TAB 1: REGISTRY & PROFILE MASTER-DETAIL */}
      {activeWorkspaceTab === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: REGISTRY TABLE (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Search, Filters, and Config Toolbar */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
              
              {/* Search input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, name, email, phone, city, type..."
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 pl-9 text-xs focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase tracking-wider"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 text-[10px]">ESC</button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-[8px] font-black uppercase">Filters:</span>
                  <button 
                    onClick={() => {
                      setFilterCountry('all');
                      setFilterBusinessType('all');
                      setFilterPlan('all');
                      setFilterStatus('all');
                      setFilterStorageMode('all');
                    }}
                    className="text-[8px] underline text-[#FF5A00] hover:text-orange-700 font-bold uppercase cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Filters grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-[#F4F4F1] pt-3 text-[8px] font-bold text-gray-500">
                
                <div className="space-y-1">
                  <label className="uppercase">Country</label>
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-1.5 focus:outline-none focus:border-[#FF5A00] text-[9px] uppercase font-bold cursor-pointer"
                  >
                    <option value="all">All Countries</option>
                    {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Business Type</label>
                  <select
                    value={filterBusinessType}
                    onChange={(e) => setFilterBusinessType(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-1.5 focus:outline-none focus:border-[#FF5A00] text-[9px] uppercase font-bold cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Sub Plan</label>
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-1.5 focus:outline-none focus:border-[#FF5A00] text-[9px] uppercase font-bold cursor-pointer"
                  >
                    <option value="all">All Plans</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-1.5 focus:outline-none focus:border-[#FF5A00] text-[9px] uppercase font-bold cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending Verification">Pending</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Approved">Approved</option>
                    <option value="Demo">Demo</option>
                    <option value="Expired">Expired</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Storage Mode</label>
                  <select
                    value={filterStorageMode}
                    onChange={(e) => setFilterStorageMode(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-1.5 focus:outline-none focus:border-[#FF5A00] text-[9px] uppercase font-bold cursor-pointer"
                  >
                    <option value="all">All Modes</option>
                    <option value="localOnly">Local Only</option>
                    <option value="cloud">Cloud Sync</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Vendor Registry Enterprise Table */}
            <div className="bg-white border-2 border-[#1A1A1A] overflow-hidden">
              
              {/* Registry Toolbar */}
              <div className="bg-[#FAF9F6] border-b-2 border-[#1A1A1A] p-2 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center space-x-2 text-[9px] font-black uppercase text-gray-500 pl-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>Registry Console</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  
                  {/* Create button */}
                  <button
                    onClick={() => {
                      setFormName('');
                      setFormTradingName('');
                      setFormCategory('Grocery & Hypermarket');
                      setFormEmail('');
                      setFormPhone('');
                      setFormCountry('United States');
                      setFormCity('');
                      setFormAddress('');
                      setFormStorageMode('localOnly');
                      setIsCreateModalOpen(true);
                    }}
                    className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white transition-all px-2.5 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Create Vendor
                  </button>

                  {/* Operational actions needing selection */}
                  {selectedVendor && (
                    <>
                      <button
                        onClick={() => {
                          setFormName(selectedVendor.name);
                          setFormTradingName(selectedVendor.tradingName || selectedVendor.name);
                          setFormCategory(selectedVendor.category);
                          setFormEmail(selectedVendor.email);
                          setFormPhone(selectedVendor.phone || '');
                          setFormCountry(selectedVendor.country || 'United States');
                          setFormCity(selectedVendor.city || '');
                          setFormAddress(selectedVendor.address || '');
                          setFormStorageMode(selectedVendor.storageMode || 'localOnly');
                          setIsEditModalOpen(true);
                        }}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                        title="Edit Settings"
                      >
                        Edit Vendor
                      </button>

                      {selectedVendor.status === 'Suspended' ? (
                        <button
                          onClick={handleReactivate}
                          className="bg-emerald-50 text-emerald-800 border border-emerald-350 hover:bg-emerald-600 hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={handleSuspend}
                          className="bg-red-50 text-red-800 border border-red-350 hover:bg-red-600 hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}

                      {selectedVendor.assignedPlanId === 'VENDOR_DEMO' && (
                        <button
                          onClick={handleConvertDemo}
                          className="bg-orange-50 text-orange-850 border border-orange-250 hover:bg-[#FF5A00] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                        >
                          Convert Demo
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedPlanId(selectedVendor.assignedPlanId || '');
                          setIsAssignPlanOpen(true);
                        }}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                      >
                        Assign Plan
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRpnId(selectedVendor.linkedRpnId || '');
                          setIsAssignRpnOpen(true);
                        }}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                      >
                        Assign RPN
                      </button>

                      {!selectedVendor.licenseKey && (
                        <button
                          onClick={handleIssueLicense}
                          className="bg-[#FF5A00] text-white border border-transparent hover:bg-[#1A1A1A] px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                        >
                          Issue License
                        </button>
                      )}
                    </>
                  )}

                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[9px]">
                  <thead>
                    <tr className="bg-stone-50 border-b border-[#1A1A1A] uppercase font-bold text-[#1A1A1A] tracking-wider text-[8px]">
                      <th className="p-3 border-r border-gray-200">Vendor ID</th>
                      <th className="p-3 border-r border-gray-200">Business Name</th>
                      <th className="p-3 border-r border-gray-200">Trading Name</th>
                      <th className="p-3 border-r border-gray-200">Type</th>
                      <th className="p-3 border-r border-gray-200">Country</th>
                      <th className="p-3 border-r border-gray-200">City</th>
                      <th className="p-3 border-r border-gray-200">Plan</th>
                      <th className="p-3 border-r border-gray-200">License Status</th>
                      <th className="p-3 border-r border-gray-200">Storage Mode</th>
                      <th className="p-3 border-r border-gray-200">RPN</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-6 text-center text-gray-400 italic">
                          No matching vendor records discovered in registry database.
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map((v) => {
                        const isSelected = selectedVendorId === v.id;
                        
                        // Status styling helper
                        let badgeColor = 'bg-stone-100 text-stone-800 border-stone-300';
                        if (v.status === 'Active') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                        else if (v.status === 'Pending Verification') badgeColor = 'bg-yellow-50 text-yellow-850 border-yellow-300';
                        else if (v.status === 'Suspended') badgeColor = 'bg-red-50 text-red-800 border-red-300';
                        else if (v.status === 'Approved') badgeColor = 'bg-blue-50 text-blue-800 border-blue-300';
                        else if (v.status === 'Rejected') badgeColor = 'bg-black text-white border-black';
                        else if (v.status === 'Draft') badgeColor = 'bg-[#FAF9F6] text-gray-500 border-gray-300';
                        else if (v.status === 'Expired') badgeColor = 'bg-stone-700 text-white border-stone-800';
                        else if (v.assignedPlanId === 'VENDOR_DEMO') badgeColor = 'bg-orange-50 text-orange-850 border-orange-300';

                        return (
                          <tr
                            key={v.id}
                            onClick={() => setSelectedVendorId(v.id)}
                            className={`border-b border-gray-150 hover:bg-[#FAF9F6] transition-colors cursor-pointer select-none ${
                              isSelected ? 'bg-orange-50/40 font-bold' : ''
                            }`}
                          >
                            <td className="p-3 border-r border-gray-200 font-bold text-gray-450">{v.id}</td>
                            <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{v.name}</td>
                            <td className="p-3 border-r border-gray-200 font-sans text-gray-500 italic">{v.tradingName || '—'}</td>
                            <td className="p-3 border-r border-gray-200 text-gray-600 uppercase text-[8px]">{v.category}</td>
                            <td className="p-3 border-r border-gray-200 text-gray-700">{v.country || '—'}</td>
                            <td className="p-3 border-r border-gray-200 text-gray-700">{v.city || '—'}</td>
                            <td className="p-3 border-r border-gray-200 text-[#FF5A00] font-bold text-[8px] uppercase">
                              {v.assignedPlanName || 'No Plan'}
                            </td>
                            <td className="p-3 border-r border-gray-200 font-mono text-[8px]">
                              {v.licenseKey ? (
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 font-bold select-all">{v.licenseKey}</span>
                              ) : (
                                <span className="text-gray-400 italic">AWAITING</span>
                              )}
                            </td>
                            <td className="p-3 border-r border-gray-200 font-mono text-[8px] uppercase">
                              {v.storageMode || 'localOnly'}
                            </td>
                            <td className="p-3 border-r border-gray-200 text-gray-500 font-bold text-[8px] truncate max-w-[80px]">
                              {v.linkedRpnName || 'None'}
                            </td>
                            <td className="p-3">
                              <span className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${badgeColor}`}>
                                {v.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-[#FAF9F6] p-3 text-[8px] font-bold text-gray-450 flex justify-between uppercase">
                <span>Database Sync Active</span>
                <span>Total records matching filters: ${filteredVendors.length} / ${vendors.length}</span>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: VENDOR LIFECYCLE PROFILE & COMMAND CENTRE (Col span 1) */}
          <div className="lg:col-span-1 space-y-4">
            
            {selectedVendor ? (
              <div className="bg-white border-2 border-[#1A1A1A] shadow-sm relative text-left">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
                
                {/* Header profile title */}
                <div className="p-4 border-b border-[#D1D1CF]">
                  <div className="flex items-center space-x-2 text-[#FF5A00] font-black uppercase text-[10px]">
                    <Building className="w-4 h-4 shrink-0" />
                    <span>Vendor profile & timeline</span>
                  </div>
                  <h3 className="font-sans font-black text-sm text-[#1A1A1A] mt-1">{selectedVendor.name}</h3>
                  <span className="text-[8px] bg-stone-100 text-stone-800 px-1.5 font-bold uppercase mt-1 inline-block">
                    ID: ${selectedVendor.id}
                  </span>
                </div>

                {/* Sub Tab selection */}
                <div className="flex flex-wrap border-b border-[#D1D1CF] bg-gray-50 text-[7px] font-black uppercase select-none">
                  {(['general', 'contacts', 'business', 'plan', 'license', 'apps', 'audit', 'timeline'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveProfileTab(tab)}
                      className={`px-2.5 py-2 cursor-pointer border-r border-[#D1D1CF] transition-colors ${
                        activeProfileTab === tab ? 'bg-white font-black text-[#FF5A00]' : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content Canvas */}
                <div className="p-4 text-[9px] uppercase font-bold space-y-3 min-h-[220px]">
                  
                  {/* TAB: GENERAL */}
                  {activeProfileTab === 'general' && (
                    <div className="space-y-2 text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[8px]">BUSINESS CODE</span>
                        <span className="text-[#1A1A1A] font-black text-xs font-mono">{selectedVendor.code || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px]">TRADING / ENTITY NAME</span>
                        <span className="text-[#1A1A1A]">{selectedVendor.tradingName || selectedVendor.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px]">REGISTRATION DATE</span>
                        <span className="text-[#1A1A1A]">{selectedVendor.joinedDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px]">OPERATIONAL STATE</span>
                        <span className="text-[#1A1A1A]">{selectedVendor.status}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB: CONTACTS */}
                  {activeProfileTab === 'contacts' && (
                    <div className="space-y-2 text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[8px]"><Mail className="w-3.5 h-3.5 inline mr-1 text-gray-450" /> OWNER COMPLIANCE EMAIL</span>
                        <span className="text-[#1A1A1A] normal-case block font-mono text-[10px] truncate">{selectedVendor.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px]"><Phone className="w-3.5 h-3.5 inline mr-1 text-gray-450" /> TELEPHONE CONTACT</span>
                        <span className="text-[#1A1A1A] block font-mono">{selectedVendor.phone || '—'}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB: BUSINESS */}
                  {activeProfileTab === 'business' && (
                    <div className="space-y-2 text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[8px]">BUSINESS CATEGORY TYPE</span>
                        <span className="text-[#1A1A1A] block">{selectedVendor.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px]"><MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-450" /> ORIGIN / REGION</span>
                        <span className="text-[#1A1A1A] block">{selectedVendor.city || '—'}, {selectedVendor.country || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px]">LOCAL TERMINAL STORAGE POLICY</span>
                        <span className="text-[#1A1A1A] block">{selectedVendor.storageMode || 'localOnly'}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB: PLAN */}
                  {activeProfileTab === 'plan' && (
                    <div className="space-y-2 text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[8px]">SUBSCRIBED PLAN TYPE</span>
                        <span className="text-[#1A1A1A] text-[10px] block font-black text-orange-600">{selectedVendor.assignedPlanName || 'No plan assigned'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px]">PLAN REFERENCE ID</span>
                        <span className="text-[#1A1A1A] block font-mono">{selectedVendor.assignedPlanId || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB: LICENSE */}
                  {activeProfileTab === 'license' && (
                    <div className="space-y-2 text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[8px]">CRYPTOGRAPHIC POS LICENSE KEY</span>
                        {selectedVendor.licenseKey ? (
                          <textarea
                            readOnly
                            value={selectedVendor.licenseKey}
                            className="w-full bg-gray-50 border border-stone-200 text-[8px] font-mono p-2 h-12 focus:outline-none select-all rounded-none uppercase resize-none leading-normal font-bold"
                          />
                        ) : (
                          <span className="text-red-500 block italic">Awaiting key issuance protocols</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: APPS */}
                  {activeProfileTab === 'apps' && (
                    <div className="space-y-2">
                      <span className="text-gray-400 block text-[8px] uppercase">ENABLED PLATFORM INTEGRATIONS</span>
                      <div className="flex flex-wrap gap-1 mt-1 font-mono">
                        {selectedVendor.requestedApps && selectedVendor.requestedApps.length > 0 ? (
                          selectedVendor.requestedApps.map(a => (
                            <span key={a} className="bg-stone-100 text-stone-750 px-1.5 py-0.5 text-[8px] uppercase border border-stone-200">
                              {a}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">No supplemental apps active</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: AUDIT */}
                  {activeProfileTab === 'audit' && (
                    <div className="space-y-2">
                      <span className="text-gray-400 block text-[8px] uppercase">OPERATIONAL DECISION AUDIT (${vendorAuditLogs.length})</span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {vendorAuditLogs.length === 0 ? (
                          <span className="text-gray-400 italic block">No audit operations on record</span>
                        ) : (
                          vendorAuditLogs.map(log => (
                            <div key={log.auditId} className="bg-[#FAF9F6] border border-stone-200 p-1.5 font-mono text-[7px] text-gray-650 flex flex-col gap-0.5 leading-relaxed rounded-none">
                              <div className="flex justify-between items-center text-gray-400 text-[6px]">
                                <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                <span className="font-bold">{log.action}</span>
                              </div>
                              <div className="text-gray-700 normal-case">{log.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: TIMELINE */}
                  {activeProfileTab === 'timeline' && (
                    <div className="space-y-3">
                      <span className="text-gray-400 block text-[8px] uppercase">LIFECYCLE TIMELINE</span>
                      <div className="relative border-l border-[#D1D1CF] pl-4 ml-2 space-y-4 text-left font-sans">
                        {timelineSteps.map(step => (
                          <div key={step.id} className="relative">
                            <div className={`absolute -left-6 top-0.5 w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                              step.done ? 'bg-[#FF5A00] border-[#FF5A00]' : 'bg-white border-[#D1D1CF]'
                            }`}>
                              {step.done && <Check className="w-2 h-2 text-white shrink-0" />}
                            </div>
                            <div className="text-[9px]">
                              <div className={`font-black uppercase tracking-wider ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step.label}
                              </div>
                              <div className="text-gray-500 font-medium text-[8px] leading-relaxed mt-0.5">{step.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Profile panel Quick Actions & commands */}
                <div className="bg-stone-50 border-t border-[#D1D1CF] p-4 space-y-2">
                  <span className="text-gray-400 block text-[8px] font-black uppercase mb-1">QUICK ACTIONS COMMAND CONSOLE</span>
                  
                  {/* Approve / Reject when Pending */}
                  {selectedVendor.status === 'Pending Verification' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleApproveOnboarding}
                        className="w-full text-center py-2 border border-emerald-350 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white uppercase font-black tracking-wider transition-colors cursor-pointer rounded-none text-[8px]"
                      >
                        Approve Onboarding
                      </button>
                      <button
                        onClick={handleRejectOnboarding}
                        className="w-full text-center py-2 border border-red-350 bg-red-50 text-red-800 hover:bg-red-600 hover:text-white uppercase font-black tracking-wider transition-colors cursor-pointer rounded-none text-[8px]"
                      >
                        Reject Onboarding
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveProfileTab('timeline')}
                      className="flex-1 text-center py-1.5 border border-stone-200 hover:border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white transition-all text-[8px] font-black uppercase cursor-pointer"
                    >
                      View Timeline
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-300 p-8 text-center text-gray-400 italic text-[10px] uppercase font-bold">
                Select a vendor from the registry table to inspect profile, timelines, and trigger clearances.
              </div>
            )}

          </div>

        </div>
      )}

      {/* RENDER TAB 2: ACTIVATION QUEUE */}
      {activeWorkspaceTab === 'activations' && (
        <div className="space-y-4 text-left">
          
          {/* Status selector tabs */}
          <div className="flex border-b border-[#D1D1CF] text-[9px] font-black uppercase bg-white">
            {(['Pending', 'Approved', 'Rejected', 'Needs Review'] as const).map(f => (
              <button
                key={f}
                onClick={() => setQueueFilter(f)}
                className={`px-4 py-2 border-r border-[#D1D1CF] cursor-pointer transition-colors ${
                  queueFilter === f ? 'bg-[#FF5A00] text-white border-b-2 border-b-transparent' : 'text-gray-500 hover:bg-[#F4F4F1]'
                }`}
              >
                {f} Queue
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queueVendors.length === 0 ? (
              <div className="col-span-full bg-white border-2 border-dashed border-gray-300 p-8 text-center text-gray-400 italic text-[10px] uppercase font-bold">
                No onboard ticket applications pending in the ${queueFilter.toUpperCase()} queue.
              </div>
            ) : (
              queueVendors.map(v => {
                const isSelected = selectedVendorId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedVendorId(v.id);
                      setActiveWorkspaceTab('registry'); // Navigate back to details
                    }}
                    className={`bg-white border-2 p-4 cursor-pointer hover:border-[#FF5A00] transition-colors relative flex flex-col justify-between ${
                      isSelected ? 'border-[#FF5A00]' : 'border-[#1A1A1A]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start text-[8px] font-bold text-gray-400">
                        <span>ID: ${v.id}</span>
                        <span className="uppercase">${v.joinedDate}</span>
                      </div>
                      <h4 className="text-xs font-black text-gray-900 leading-snug">${v.name}</h4>
                      <p className="text-[9px] text-gray-500 uppercase">${v.category} • ${v.city || 'Detroit'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F4F4F1] flex justify-between items-center">
                      <span className="text-[8px] font-black text-[#FF5A00] uppercase">
                        ${v.assignedPlanName || 'Starter POS'}
                      </span>
                      <span className="text-[8px] underline font-bold uppercase text-gray-500 hover:text-black">
                        Configure Profile &rarr;
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ==========================================================================
         ACTION MODALS
         ========================================================================== */}

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleCreateVendor} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase text-[#1A1A1A] border-b border-[#D1D1CF] pb-2">
              Create Vendor Profile
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Business Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] text-xs font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Trading Name</label>
                <input
                  type="text"
                  value={formTradingName}
                  onChange={(e) => setFormTradingName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Country</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">City</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs normal-case font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Business Type</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Grocery & Hypermarket">Grocery & Hypermarket</option>
                    <option value="Convenience Stores">Convenience Stores</option>
                    <option value="General Goods">General Goods</option>
                    <option value="Apparel & Footwear">Apparel & Footwear</option>
                    <option value="Building Materials">Building Materials</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Storage Mode</label>
                  <select
                    value={formStorageMode}
                    onChange={(e) => setFormStorageMode(e.target.value as any)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="localOnly">Local Only</option>
                    <option value="cloud">Cloud Sync</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Register Vendor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleEditVendor} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase text-[#1A1A1A] border-b border-[#D1D1CF] pb-2">
              Edit Vendor Settings
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Business Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] text-xs font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Trading Name</label>
                <input
                  type="text"
                  value={formTradingName}
                  onChange={(e) => setFormTradingName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Country</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">City</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs normal-case font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Business Type</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Grocery & Hypermarket">Grocery & Hypermarket</option>
                    <option value="Convenience Stores">Convenience Stores</option>
                    <option value="General Goods">General Goods</option>
                    <option value="Apparel & Footwear">Apparel & Footwear</option>
                    <option value="Building Materials">Building Materials</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Storage Mode</label>
                  <select
                    value={formStorageMode}
                    onChange={(e) => setFormStorageMode(e.target.value as any)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="localOnly">Local Only</option>
                    <option value="cloud">Cloud Sync</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ASSIGN PLAN MODAL */}
      {isAssignPlanOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A1A1A] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative font-mono text-[#1A1A1A]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase border-b border-[#D1D1CF] pb-2">
              Assign Subscription Plan
            </h3>

            <div className="space-y-2">
              <span className="text-gray-400 text-[8px] uppercase block">Select pricing tier:</span>
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleAssignPlan(p.id)}
                  className="w-full text-left p-3 border border-[#D1D1CF] hover:border-[#1A1A1A] hover:bg-[#FAF9F6] bg-white transition-all uppercase flex justify-between items-center cursor-pointer text-[9px] font-bold text-gray-700"
                >
                  <div>
                    <div className="text-gray-900 font-black">${p.name} (${p.type})</div>
                    <div className="text-gray-400 text-[8px] mt-0.5 normal-case font-medium font-sans">
                      ${p.maxTerminals} Terminals Max • ${p.maxBranches} Branches Max
                    </div>
                  </div>
                  <div className="text-[#FF5A00] font-black">$${p.price}/mo</div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAssignPlanOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 text-[10px] font-black uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN RPN MODAL */}
      {isAssignRpnOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A1A1A] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative font-mono text-[#1A1A1A]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase border-b border-[#D1D1CF] pb-2">
              Map RPN Routing Node
            </h3>

            <div className="space-y-2">
              <span className="text-gray-400 text-[8px] uppercase block">Select acquisition agent node:</span>
              {rpnAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => handleAssignRpn(agent.id)}
                  className="w-full text-left p-3 border border-[#D1D1CF] hover:border-[#1A1A1A] hover:bg-[#FAF9F6] bg-white transition-all uppercase flex justify-between items-center cursor-pointer text-[9px] font-bold text-gray-700"
                >
                  <div>
                    <div className="text-gray-900 font-black">${agent.name}</div>
                    <div className="text-gray-400 text-[8px] mt-0.5 normal-case font-medium font-sans">
                      Region: ${agent.region} • Node Type: ${agent.type}
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-1.5 border ${
                    agent.connectionStatus === 'Connected' ? 'border-emerald-300 text-emerald-800 bg-emerald-50' : 'border-red-300 text-red-800 bg-red-50'
                  }`}>
                    ${agent.connectionStatus}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAssignRpnOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 text-[10px] font-black uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}