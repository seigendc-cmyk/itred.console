import React, { useState, useMemo, useEffect } from 'react';
import { useLifecycle } from '../App';
import { POSLicense, Vendor, Plan, RPNAgent } from '../types';
import { 
  issueMockPOSActivation, 
  getPOSActivationRecords, 
  updatePOSActivationStatus, 
  validatePOSActivationForVendor 
} from '../services/posActivationBridge';
import { POSActivationRecord } from '../licensing/posActivationTypes';
import { 
  Terminal, 
  Plus, 
  RefreshCw, 
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
  Tag,
  Database,
  Link,
  Link2,
  Cpu,
  Layers,
  Copy,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Activity,
  Globe,
  Network
} from 'lucide-react';

export default function POSLicensingView() {
  const { 
    posLicenses, 
    setPosLicenses, 
    vendors, 
    setVendors,
    plans, 
    currentAdmin, 
    addLogAndNotify,
    auditLogs,
    rpnAgents,
    setRpnAgents,
    setFinanceRecords
  } = useLifecycle();

  // Active Tab: 'licenses' | 'activation-bridge' | 'generator' | 'matrix' | 'rpn-linker'
  const [activeTab, setActiveTab] = useState<'licenses' | 'activation-bridge' | 'generator' | 'matrix' | 'rpn-linker'>('licenses');

  // ==========================================================================
  // TAB 1: TERMINAL LICENSES MAIN STATE & HANDLERS
  // ==========================================================================
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<POSLicense | null>(null);

  const [formVendorId, setFormVendorId] = useState('');
  const [formPlanId, setFormPlanId] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-07-01');
  const [formExpiryDate, setFormExpiryDate] = useState('2027-07-01');
  const [formNotes, setFormNotes] = useState('');

  // POS Activation Bridge States
  const [activationRecords, setActivationRecords] = useState<POSActivationRecord[]>(() => getPOSActivationRecords());
  const [isActivationDrawerOpen, setIsActivationDrawerOpen] = useState(false);
  const [actVendorId, setActVendorId] = useState('');
  const [actPlanId, setActPlanId] = useState('');
  const [actLicenseMode, setActLicenseMode] = useState<'demo' | 'production'>('production');
  const [actStorageMode, setActStorageMode] = useState<'localOnly' | 'cloud'>('cloud');
  const [actStartDate, setActStartDate] = useState('2026-07-02');
  const [actExpiryDate, setActExpiryDate] = useState('2027-07-02');
  const [actMaxBranches, setActMaxBranches] = useState('1');
  const [actMaxTerminals, setActMaxTerminals] = useState('1');
  const [actMaxStaff, setActMaxStaff] = useState('3');
  const [actMaxProducts, setActMaxProducts] = useState('500');
  const [actNotes, setActNotes] = useState('');
  
  const [validateVendorId, setValidateVendorId] = useState('');
  const [validationResult, setValidationResult] = useState<any | null>(null);

  // Synchronize Storage Mode with License Mode automatically
  useEffect(() => {
    if (actLicenseMode === 'demo') {
      setActStorageMode('localOnly');
    } else {
      setActStorageMode('cloud');
    }
  }, [actLicenseMode]);

  // Synchronize Capacity Limits with Plan automatically
  useEffect(() => {
    const plan = plans.find(p => p.id === actPlanId);
    if (!plan) return;
    setActMaxBranches(plan.maxBranches || '1');
    setActMaxTerminals(plan.maxTerminals || '1');
    setActMaxStaff(plan.maxStaff || '3');
    setActMaxProducts(plan.maxProducts || '500');
  }, [actPlanId, plans]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const handleOpenDrawer = () => {
    const activeVendors = vendors.filter((v: Vendor) => v.status === 'Active');
    if (activeVendors.length > 0) {
      setFormVendorId(activeVendors[0].id);
    } else if (vendors.length > 0) {
      setFormVendorId(vendors[0].id);
    } else {
      setFormVendorId('');
    }

    const posPlans = plans.filter((p: Plan) => p.type === 'POS' || p.type === 'Hybrid');
    if (posPlans.length > 0) {
      setFormPlanId(posPlans[0].id);
    } else if (plans.length > 0) {
      setFormPlanId(plans[0].id);
    } else {
      setFormPlanId('');
    }

    setFormStartDate('2026-07-01');
    setFormExpiryDate('2027-07-01');
    setFormNotes('');
    setIsDrawerOpen(true);
  };

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find((v: Vendor) => v.id === actVendorId);
    const plan = plans.find((p: Plan) => p.id === actPlanId);

    if (!vendor) {
      alert("Please select a vendor.");
      return;
    }
    if (!plan) {
      alert("Please select a plan.");
      return;
    }

    const finalStorageMode = actLicenseMode === 'demo' ? 'localOnly' : 'cloud';

    const parseLimit = (val: string) => {
      if (val === 'Unlimited' || val === 'unlimited') return 9999;
      return parseInt(val) || 1;
    };

    const newRecord = issueMockPOSActivation({
      vendorId: vendor.id,
      vendorName: vendor.name,
      planId: plan.id,
      planName: plan.name,
      licenseMode: actLicenseMode,
      storageMode: finalStorageMode,
      maxBranches: parseLimit(actMaxBranches),
      maxTerminals: parseLimit(actMaxTerminals),
      maxStaff: parseLimit(actMaxStaff),
      maxProducts: parseLimit(actMaxProducts),
      startsAt: actStartDate,
      expiresAt: actExpiryDate,
      issuedBy: currentAdmin?.name || 'Admin',
      notes: actNotes
    });

    setActivationRecords(getPOSActivationRecords());
    setIsActivationDrawerOpen(false);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'ISSUE_POS_ACTIVATION',
        `${vendor.name} • ${newRecord.licenseId}`,
        'success',
        'success',
        'POS Activation Issued',
        `Registered activation bridge reference ${newRecord.licenseId} for ${vendor.name}.`
      );
    }
  };

  const handleValidateAccess = () => {
    if (!validateVendorId) {
      alert("Please choose a vendor to validate.");
      return;
    }
    const decision = validatePOSActivationForVendor(validateVendorId);
    setValidationResult(decision);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find((v: Vendor) => v.id === formVendorId);
    const plan = plans.find((p: Plan) => p.id === formPlanId);

    if (!vendor) {
      alert('Error: Please select a valid merchant vendor.');
      return;
    }
    if (!plan) {
      alert('Error: Please select a valid licensing plan.');
      return;
    }

    const randId = `POS-LIC-${Math.floor(1000 + Math.random() * 9000)}`;
    const vendorAbbr = vendor.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
    const randTerminalId = `TRM-${vendorAbbr}-${Math.floor(100 + Math.random() * 900)}`;
    
    const genPart = () => Math.floor(16**4 + Math.random()*(16**5 - 16**4)).toString(16).toUpperCase().substring(0, 4);
    const randLicenseKey = `ITRD-POS-${genPart()}-${genPart()}-${genPart()}`;

    const newLicense: POSLicense = {
      id: randId,
      vendorName: vendor.name,
      terminalId: randTerminalId,
      licenseKey: randLicenseKey,
      status: 'Active',
      issuedAt: formStartDate,
      planName: plan.name,
      expiryDate: formExpiryDate,
      notes: formNotes.trim() || 'Provisioned via Enterprise License Manager console.',
      billingCycle: 'Yearly',
      tokenPrice: plan.price * 12,
      collectionTag: 'Standard Licenses'
    };

    setPosLicenses((prev: POSLicense[]) => [newLicense, ...prev]);
    setIsDrawerOpen(false);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'ISSUE_POS_LICENSE',
        `${vendor.name} • ${randTerminalId}`,
        'Success',
        'success',
        'POS Terminal License Issued',
        `Terminal ${randTerminalId} associated with "${plan.name}" successfully binded cryptographic key ${randLicenseKey}.`
      );
    }
  };

  const handleRenew = (lic: POSLicense) => {
    let baseDate = lic.expiryDate ? new Date(lic.expiryDate) : new Date('2026-07-01');
    if (isNaN(baseDate.getTime())) {
      baseDate = new Date('2026-07-01');
    }
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    const nextExpiry = baseDate.toISOString().split('T')[0];

    setPosLicenses((prev: POSLicense[]) => 
      prev.map(p => p.id === lic.id ? { 
        ...p, 
        status: 'Active',
        expiryDate: nextExpiry,
        notes: `${p.notes || ''}\n[Renewed on 2026-07-01 by ${currentAdmin?.name || 'Admin'}]`
      } : p)
    );

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'RENEW_POS_LICENSE',
        `${lic.vendorName} • ${lic.terminalId}`,
        'Success',
        'success',
        'POS License Renewed',
        `Access credentials for Terminal ${lic.terminalId} extended to ${nextExpiry} under active clearance.`
      );
    }
  };

  const handleSuspend = (lic: POSLicense) => {
    setPosLicenses((prev: POSLicense[]) => 
      prev.map(p => p.id === lic.id ? { 
        ...p, 
        status: 'Suspended',
        notes: `${p.notes || ''}\n[Suspended on 2026-07-01 by ${currentAdmin?.name || 'Admin'}]`
      } : p)
    );

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'SUSPEND_POS_LICENSE',
        `${lic.vendorName} • ${lic.terminalId}`,
        'Warning',
        'warning',
        'POS License Suspended',
        `Hardware TPM clearance has been suspended for terminal key on device ${lic.terminalId}.`
      );
    }
  };

  const handleDeactivate = (lic: POSLicense) => {
    setPosLicenses((prev: POSLicense[]) => 
      prev.map(p => p.id === lic.id ? { 
        ...p, 
        status: 'Deactivated',
        notes: `${p.notes || ''}\n[Deactivated on 2026-07-01 by ${currentAdmin?.name || 'Admin'}]`
      } : p)
    );

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'DEACTIVATE_POS_LICENSE',
        `${lic.vendorName} • ${lic.terminalId}`,
        'Warning',
        'alert',
        'POS License Deactivated',
        `Terminal gateway link permanently broken and rotational keys purged for device ${lic.terminalId}.`
      );
    }
  };

  const handleOpenHistory = (lic: POSLicense) => {
    setSelectedLicense(lic);
    setIsHistoryOpen(true);
  };

  // Dynamic filter for Tab 1 Licenses Table
  const filteredLicenses = useMemo(() => {
    return posLicenses.filter((lic: POSLicense) => {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        lic.vendorName.toLowerCase().includes(search) ||
        (lic.planName || '').toLowerCase().includes(search) ||
        lic.licenseKey.toLowerCase().includes(search) ||
        lic.id.toLowerCase().includes(search) ||
        lic.terminalId.toLowerCase().includes(search);
      
      const matchesStatus = filterStatus === 'All' || lic.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [posLicenses, searchQuery, filterStatus]);

  const filteredAuditTimeline = useMemo(() => {
    if (!selectedLicense) return [];
    const key = selectedLicense.terminalId;
    const vendor = selectedLicense.vendorName;
    const id = selectedLicense.id;
    return auditLogs.filter((log: any) => {
      return (
        log.target.includes(key) || 
        log.target.includes(vendor) || 
        log.target.includes(id) ||
        log.action.includes('POS_LICENSE') ||
        log.action.includes('TOKEN')
      );
    });
  }, [selectedLicense, auditLogs]);


  // ==========================================================================
  // TAB 2: LICENSING TOKEN GENERATOR STATE & HANDLERS
  // ==========================================================================
  const [genVendorId, setGenVendorId] = useState('');
  const [genPlanId, setGenPlanId] = useState('');
  const [genBillingCycle, setGenBillingCycle] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [genCollectionTag, setGenCollectionTag] = useState('European Expansion');
  const [customTagInput, setCustomTagInput] = useState('');
  const [isCustomTagSelected, setIsCustomTagSelected] = useState(false);
  const [genNotes, setGenNotes] = useState('');

  // Cryptographic generation process simulation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedTokenResult, setGeneratedTokenResult] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Dynamically compile a list of unique collection tags across licenses
  const uniqueCollections = useMemo(() => {
    const tagsSet = new Set<string>();
    posLicenses.forEach((lic: POSLicense) => {
      if (lic.collectionTag) tagsSet.add(lic.collectionTag);
    });
    // Add default initial collections if none exist
    tagsSet.add('European Expansion');
    tagsSet.add('Tokyo Stores');
    tagsSet.add('US Logistics');
    tagsSet.add('Sydney Retail');
    tagsSet.add('Milan Runway');
    return Array.from(tagsSet);
  }, [posLicenses]);

  // Set default form selections on load
  React.useEffect(() => {
    const activeV = vendors.filter((v: Vendor) => v.status === 'Active');
    if (activeV.length > 0 && !genVendorId) {
      setGenVendorId(activeV[0].id);
    }
    const posP = plans.filter((p: Plan) => p.type === 'POS' || p.type === 'Hybrid');
    if (posP.length > 0 && !genPlanId) {
      setGenPlanId(posP[0].id);
    }
  }, [vendors, plans]);

  // Pricing calculations
  const calculatedPricing = useMemo(() => {
    const plan = plans.find((p: Plan) => p.id === genPlanId);
    if (!plan) return { basePrice: 0, months: 0, subtotal: 0, discountRate: 0, discountAmt: 0, finalPrice: 0 };
    
    const basePrice = plan.price;
    let months = 1;
    let discountRate = 0; // 0% monthly, 10% quarterly, 20% yearly

    if (genBillingCycle === 'Monthly') {
      months = 1;
      discountRate = 0;
    } else if (genBillingCycle === 'Quarterly') {
      months = 3;
      discountRate = 0.10;
    } else if (genBillingCycle === 'Yearly') {
      months = 12;
      discountRate = 0.20;
    }

    const subtotal = basePrice * months;
    const discountAmt = subtotal * discountRate;
    const finalPrice = Math.round(subtotal - discountAmt);

    return {
      basePrice,
      months,
      subtotal,
      discountRate,
      discountAmt,
      finalPrice
    };
  }, [genPlanId, genBillingCycle, plans]);

  const liveTokenPreview = useMemo(() => {
    const vendor = vendors.find((v: Vendor) => v.id === genVendorId);
    const plan = plans.find((p: Plan) => p.id === genPlanId);
    if (!vendor || !plan) return 'SGN-LIC-PREVIEW-HASH';
    
    const cycleChar = genBillingCycle.substring(0, 1).toUpperCase();
    const vendorAbbr = vendor.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
    const planAbbr = plan.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
    return `SGN-LIC-${cycleChar}-${vendorAbbr}-${planAbbr}-PREV-8F4C`;
  }, [genVendorId, genPlanId, genBillingCycle, vendors, plans]);

  const handleStartGenerateToken = () => {
    const vendor = vendors.find((v: Vendor) => v.id === genVendorId);
    const plan = plans.find((p: Plan) => p.id === genPlanId);

    if (!vendor) {
      alert('Error: Please select a valid merchant vendor.');
      return;
    }
    if (!plan) {
      alert('Error: Please select a valid plan.');
      return;
    }

    setIsGenerating(true);
    setGeneratedTokenResult(null);
    setCopiedToken(false);

    // Dynamic progression states
    setGenerationStep('1/4 RECOGNIZING MERCHANT REGISTRY SECURE ID...');
    
    setTimeout(() => {
      setGenerationStep('2/4 CRYPTOGRAPHIC BINDING TO SLABS PLAN: ' + plan.name.toUpperCase());
      
      setTimeout(() => {
        setGenerationStep('3/4 DEPLOYING SHA256 PUBLIC CODES & SALTS...');
        
        setTimeout(() => {
          setGenerationStep('4/4 RE-INDEXING DISTRIBUTED LEDGER LEDGER CONTROLLERS...');
          
          setTimeout(() => {
            // Generate real cryptographic looking token
            const cycleChar = genBillingCycle.substring(0, 1).toUpperCase();
            const vendorAbbr = vendor.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
            const planAbbr = plan.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
            const randHex = () => Math.floor(16**3 + Math.random()*(16**4 - 16**3)).toString(16).toUpperCase();
            const tokenKey = `SGN-LIC-${cycleChar}-${vendorAbbr}-${planAbbr}-${randHex()}-${randHex()}`;

            const finalCollectionTag = isCustomTagSelected ? (customTagInput.trim() || 'New Ingress Collection') : genCollectionTag;

            // Compute expiration date
            const today = new Date();
            let expMonths = 1;
            if (genBillingCycle === 'Quarterly') expMonths = 3;
            if (genBillingCycle === 'Yearly') expMonths = 12;
            today.setMonth(today.getMonth() + expMonths);
            const formattedExpDate = today.toISOString().split('T')[0];

            // Setup new license item
            const newLicId = `POS-LIC-${Math.floor(1000 + Math.random() * 9000)}`;
            const randTermId = `TRM-${vendorAbbr}-${Math.floor(100 + Math.random() * 900)}`;

            const newLicense: POSLicense = {
              id: newLicId,
              vendorName: vendor.name,
              terminalId: randTermId,
              licenseKey: tokenKey,
              status: 'Active',
              issuedAt: new Date().toISOString().split('T')[0],
              planName: plan.name,
              expiryDate: formattedExpDate,
              notes: genNotes.trim() || `Automated licensing token issued for term: ${genBillingCycle}.`,
              billingCycle: genBillingCycle,
              tokenPrice: calculatedPricing.finalPrice,
              collectionTag: finalCollectionTag
            };

            // Commit license state
            setPosLicenses((prev: POSLicense[]) => [newLicense, ...prev]);

            // Commit finance transaction record
            const newTxnId = `TXN-${Math.floor(100 + Math.random() * 900)}`;
            const newTxn = {
              id: newTxnId,
              description: `${vendor.name} - Issued ${genBillingCycle} Token (Plan: ${plan.name})`,
              amount: calculatedPricing.finalPrice,
              type: 'Credit' as const,
              date: new Date().toISOString().split('T')[0],
              refNo: `REF-SGN-${Math.floor(10000 + Math.random() * 90000)}`
            };
            setFinanceRecords((prev: any) => [newTxn, ...prev]);

            // Add Log and Notification in context
            if (addLogAndNotify) {
              addLogAndNotify(
                currentAdmin?.name || 'SysOp',
                'GENERATE_LICENSING_TOKEN',
                `${vendor.name} • ${tokenKey.substring(0, 15)}...`,
                'Success',
                'success',
                'Cryptographic License Token Generated',
                `Successfully signed a ${genBillingCycle} term token worth $${calculatedPricing.finalPrice} for ${vendor.name}.`
              );
            }

            setGeneratedTokenResult(tokenKey);
            setIsGenerating(false);
            setGenerationStep('');
          }, 350);
        }, 350);
      }, 350);
    }, 350);
  };

  const handleCopyToken = () => {
    if (generatedTokenResult) {
      navigator.clipboard.writeText(generatedTokenResult);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };


  // ==========================================================================
  // TAB 3: ACTIVE SLABS MATRIX MAIN STATE & HANDLERS
  // ==========================================================================
  const [matrixCollectionFilter, setMatrixCollectionFilter] = useState('All');
  const [matrixPlanFilter, setMatrixPlanFilter] = useState('All');
  const [matrixCycleFilter, setMatrixCycleFilter] = useState('All');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');

  // Computes the filtered grid of active licensing tokens
  const activeMatrixData = useMemo(() => {
    return posLicenses.filter((lic: POSLicense) => {
      // Must match text search (vendor or key or plan)
      const search = matrixSearchQuery.toLowerCase();
      const matchesText = 
        lic.vendorName.toLowerCase().includes(search) ||
        (lic.planName || '').toLowerCase().includes(search) ||
        lic.licenseKey.toLowerCase().includes(search) ||
        lic.id.toLowerCase().includes(search);

      const matchesCollection = matrixCollectionFilter === 'All' || lic.collectionTag === matrixCollectionFilter;
      const matchesPlan = matrixPlanFilter === 'All' || lic.planName === matrixPlanFilter;
      const matchesCycle = matrixCycleFilter === 'All' || lic.billingCycle === matrixCycleFilter;

      return matchesText && matchesCollection && matchesPlan && matchesCycle;
    });
  }, [posLicenses, matrixCollectionFilter, matrixPlanFilter, matrixCycleFilter, matrixSearchQuery]);

  // Total summary of current filtered Matrix
  const matrixStatsSummary = useMemo(() => {
    let totalValue = 0;
    let activeCount = 0;
    let expiredCount = 0;

    activeMatrixData.forEach((lic: POSLicense) => {
      if (lic.status === 'Active') activeCount++;
      if (lic.status === 'Expired') expiredCount++;
      
      // Calculate normalized monthly value of active licenses for ARR calculation
      let value = lic.tokenPrice || 49;
      if (lic.billingCycle === 'Quarterly') {
        value = Math.round(value / 3);
      } else if (lic.billingCycle === 'Yearly') {
        value = Math.round(value / 12);
      }
      totalValue += value;
    });

    return {
      monthlyValue: totalValue,
      arr: totalValue * 12,
      activeCount,
      expiredCount,
      totalCount: activeMatrixData.length
    };
  }, [activeMatrixData]);


  // ==========================================================================
  // TAB 4: RPN ROUTING LINKER STATE & HANDLERS
  // ==========================================================================
  const [linkerVendorId, setLinkerVendorId] = useState('');
  const [linkerRpnId, setLinkerRpnId] = useState('');
  const [linkerProtocol, setLinkerProtocol] = useState('TLS 1.3 / ECDHE-RSA');
  const [linkerLatencyLimit, setLinkerLatencyLimit] = useState('25ms');
  const [linkerProcessState, setLinkerProcessState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [linkerSuccessMessage, setLinkerSuccessMessage] = useState('');

  // Populate first unlinked or any vendor as linker defaults
  React.useEffect(() => {
    if (vendors.length > 0 && !linkerVendorId) {
      setLinkerVendorId(vendors[0].id);
    }
    if (rpnAgents.length > 0 && !linkerRpnId) {
      setLinkerRpnId(rpnAgents[0].id);
    }
  }, [vendors, rpnAgents]);

  const handleLinkRPN = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === linkerVendorId);
    const rpn = rpnAgents.find(r => r.id === linkerRpnId);

    if (!vendor) {
      alert('Error: Please select a valid merchant.');
      return;
    }

    setLinkerProcessState('processing');

    setTimeout(() => {
      // 1. Update Vendor in context state
      setVendors((prevVendors: Vendor[]) => 
        prevVendors.map((v: Vendor) => {
          if (v.id === linkerVendorId) {
            return {
              ...v,
              linkedRpnId: linkerRpnId || undefined,
              linkedRpnName: rpn ? rpn.name : undefined
            };
          }
          return v;
        })
      );

      // 2. Update RPNAgents list in context state
      setRpnAgents((prevRpn: RPNAgent[]) => 
        prevRpn.map((r: RPNAgent) => {
          // If this is the newly linked node, add vendor ID
          if (linkerRpnId && r.id === linkerRpnId) {
            const currentList = r.linkedVendorIds || [];
            if (!currentList.includes(linkerVendorId)) {
              return { ...r, linkedVendorIds: [...currentList, linkerVendorId] };
            }
          }
          // If this was linked previously, remove vendor ID
          if (r.id !== linkerRpnId && r.linkedVendorIds?.includes(linkerVendorId)) {
            return { ...r, linkedVendorIds: r.linkedVendorIds.filter(id => id !== linkerVendorId) };
          }
          return r;
        })
      );

      // 3. Log & Notify
      if (addLogAndNotify) {
        addLogAndNotify(
          currentAdmin?.name || 'Admin',
          'LINK_RPN_VENDOR',
          `${vendor.name} • ${rpn ? rpn.name : 'Unassigned'}`,
          'Success',
          'success',
          'Network Ingress Route Established',
          rpn 
            ? `Secured cryptographic tunnel established with ${rpn.name} using ${linkerProtocol} routing under ${linkerLatencyLimit} threshold.`
            : `Secured tunnel purged for merchant ${vendor.name}.`
        );
      }

      setLinkerSuccessMessage(`Successfully routed ${vendor.name} to ${rpn ? rpn.name : 'Unassigned node'}!`);
      setLinkerProcessState('success');

      setTimeout(() => {
        setLinkerProcessState('idle');
        setLinkerSuccessMessage('');
      }, 3000);

    }, 1500);
  };

  const handleUnlinkVendor = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    const oldRpnId = vendor.linkedRpnId;

    // 1. Clear Vendor linked RPN
    setVendors((prevVendors: Vendor[]) => 
      prevVendors.map((v: Vendor) => {
        if (v.id === vendorId) {
          return {
            ...v,
            linkedRpnId: undefined,
            linkedRpnName: undefined
          };
        }
        return v;
      })
    );

    // 2. Clear from RPNAgent lists
    if (oldRpnId) {
      setRpnAgents((prevRpn: RPNAgent[]) => 
        prevRpn.map((r: RPNAgent) => {
          if (r.id === oldRpnId) {
            return {
              ...r,
              linkedVendorIds: (r.linkedVendorIds || []).filter(id => id !== vendorId)
            };
          }
          return r;
        })
      );
    }

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'UNLINK_RPN_VENDOR',
        `${vendor.name}`,
        'Warning',
        'warning',
        'Network Tunnel Severed',
        `The secure ingress routing tunnel for ${vendor.name} has been disconnected manually.`
      );
    }
  };

  // Map of RPN nodes with their associated merchants compiled
  const rpnRoutingData = useMemo(() => {
    return rpnAgents.map((agent: RPNAgent) => {
      const merchants = vendors.filter((v: Vendor) => v.linkedRpnId === agent.id);
      return {
        ...agent,
        merchants
      };
    });
  }, [rpnAgents, vendors]);


  return (
    <div id="pos_license_manager_container" className="space-y-6">
      
      {/* 1. HEADER SECTION */}
      <div id="pos_licensing_header" className="flex flex-col md:flex-row md:items-center md:justify-between border-b-4 border-[#1A1A1A] pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-[#FF5A00]" />
            <h1 className="text-xl font-black font-sans text-[#1A1A1A] uppercase tracking-wider">Enterprise SGN Licensing Hub</h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">seiGEN COMMERCE INFRASTRUCTURE • LICENSE ROTATION & INGRESS ROUTING</p>
        </div>

        {/* TOP TAB SWITCHER PANEL */}
        <div className="flex border-2 border-[#1A1A1A] bg-[#EAEAE8] p-0.5 gap-0.5 shrink-0">
          <button
            id="tab_trigger_licenses"
            onClick={() => setActiveTab('licenses')}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'licenses' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            1. Terminal Keys
          </button>
          <button
            id="tab_trigger_activation_bridge"
            onClick={() => setActiveTab('activation-bridge')}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'activation-bridge' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            2. POS Activation Bridge
          </button>
          <button
            id="tab_trigger_generator"
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'generator' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            2. Token Generator
          </button>
          <button
            id="tab_trigger_matrix"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'matrix' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            3. Slabs Matrix
          </button>
          <button
            id="tab_trigger_linker"
            onClick={() => setActiveTab('rpn-linker')}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'rpn-linker' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            4. RPN Linker
          </button>
        </div>
      </div>


      {/* ==========================================================================
         A. VIEW: TAB 1 - CLASSIC TERMINAL LICENSES TABLE
         ========================================================================== */}
      {activeTab === 'licenses' && (
        <div id="subview_licenses_table" className="space-y-6 animate-fade-in">
          
          {/* HARDWARE OVERVIEW METRICS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 font-mono text-xs shadow-sm">
              <div className="text-[#FF5A00] uppercase text-[9px] font-bold">PRODUCTION LICENSES</div>
              <div className="text-2xl font-black text-[#1A1A1A] mt-1 font-sans">
                {posLicenses.filter((l: POSLicense) => !l.id.includes('DEMO')).length}
              </div>
              <div className="text-[9px] text-gray-500 mt-1 uppercase">
                Active: {posLicenses.filter((l: POSLicense) => !l.id.includes('DEMO') && l.status === 'Active').length} Cloud
              </div>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 font-mono text-xs shadow-sm">
              <div className="text-orange-600 uppercase text-[9px] font-bold">DEMO LICENSES</div>
              <div className="text-2xl font-black text-[#1A1A1A] mt-1 font-sans">
                {posLicenses.filter((l: POSLicense) => l.id.includes('DEMO')).length}
              </div>
              <div className="text-[9px] text-gray-500 mt-1 uppercase">
                Active: {posLicenses.filter((l: POSLicense) => l.id.includes('DEMO') && l.status === 'Active').length} Local
              </div>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 font-mono text-xs shadow-sm">
              <div className="text-emerald-600 uppercase text-[9px] font-bold">ACTIVE PROD KEYS</div>
              <div className="text-2xl font-black text-emerald-600 mt-1 font-sans">
                {posLicenses.filter((l: POSLicense) => !l.id.includes('DEMO') && l.status === 'Active').length}
              </div>
              <div className="text-[9px] text-gray-500 mt-1 uppercase">Rotational cycle live</div>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 font-mono text-xs shadow-sm">
              <div className="text-amber-600 uppercase text-[9px] font-bold">SUSPENDED PROD</div>
              <div className="text-2xl font-black text-amber-600 mt-1 font-sans">
                {posLicenses.filter((l: POSLicense) => !l.id.includes('DEMO') && l.status === 'Suspended').length}
              </div>
              <div className="text-[9px] text-gray-500 mt-1 uppercase">Access frozen</div>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 font-mono text-xs shadow-sm col-span-2 lg:col-span-1">
              <div className="text-red-600 uppercase text-[9px] font-bold">EXPIRED / REVOKED PROD</div>
              <div className="text-2xl font-black text-red-600 mt-1 font-sans">
                {posLicenses.filter((l: POSLicense) => !l.id.includes('DEMO') && (l.status === 'Expired' || l.status === 'Deactivated')).length}
              </div>
              <div className="text-[9px] text-gray-500 mt-1 uppercase">Purged or out of date</div>
            </div>
          </div>

          {/* FILTER AND SEARCH UTILITY */}
          <div className="bg-[#EAEAE8] border border-[#D1D1CF] p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
              <span className="text-gray-500 uppercase text-[10px] block py-1 font-bold shrink-0">Search Keys:</span>
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="SEARCH VENDOR, PLAN NAME, KEY OR TERMINAL ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] py-2 pl-9 pr-4 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 uppercase text-[10px] font-bold">TPM Status:</span>
                <div className="inline-flex border border-[#D1D1CF] bg-white">
                  {['All', 'Active', 'Suspended', 'Deactivated', 'Expired'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase transition-all cursor-pointer ${
                        filterStatus === status 
                          ? 'bg-[#1A1A1A] text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn_issue_license_trigger"
                onClick={handleOpenDrawer}
                className="flex items-center justify-center space-x-1.5 bg-[#FF5A00] hover:bg-[#1A1A1A] text-white text-[10px] font-sans font-black py-2 px-3 uppercase tracking-wider transition-all duration-150 rounded-none cursor-pointer border-2 border-transparent"
              >
                <Plus className="w-3 h-3 shrink-0" />
                <span>Issue Key</span>
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
            <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] flex justify-between items-center text-xs font-mono text-gray-500">
              <span className="uppercase text-[#1A1A1A] font-bold">CRYPTO REGISTRY DATA STREAM ({filteredLicenses.length} MATCHES)</span>
              <span className="flex items-center text-[10px] text-green-700 font-bold uppercase">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
                Node Controller Connected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-[#EAEAE8] border-b border-[#D1D1CF] text-gray-600 uppercase tracking-wider">
                    <th className="p-3">Vendor / Merchant</th>
                    <th className="p-3">Plan Class</th>
                    <th className="p-3">Cryptographic License Key</th>
                    <th className="p-3">Activation Date</th>
                    <th className="p-3">Expiry</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Operations Suite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1CF]">
                  {filteredLicenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400 uppercase font-bold text-xs bg-gray-50">
                        NO HARDWARE GATEWAY RECORDS BINDING THESE FILTERS
                      </td>
                    </tr>
                  ) : (
                    filteredLicenses.map((lic: POSLicense) => {
                      const linkedVendorObj = vendors.find(v => v.name === lic.vendorName);
                      return (
                        <tr key={lic.id} className="hover:bg-[#F9F9F8] transition-colors">
                          <td className="p-3 align-middle">
                            <div className="space-y-0.5">
                              <div className="font-sans font-bold text-sm text-[#1A1A1A]">{lic.vendorName}</div>
                              <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-1.5">
                                <span className="font-bold bg-[#1A1A1A] text-white px-1 py-0.2 text-[8px] uppercase">{lic.id}</span>
                                <span>ID: {lic.terminalId}</span>
                                {lic.collectionTag && (
                                  <span className="bg-gray-200 text-gray-800 text-[8px] px-1 font-extrabold uppercase rounded-sm">
                                    {lic.collectionTag}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3 align-middle">
                            <div className="space-y-1">
                              <span className="bg-orange-50 border border-orange-200 text-[#FF5A00] font-bold px-1.5 py-0.5 text-[9px] uppercase">
                                {lic.planName || 'Starter POS'}
                              </span>
                              {lic.billingCycle && (
                                <span className="block text-[9px] text-gray-400 uppercase font-semibold">
                                  Term: {lic.billingCycle}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 align-middle">
                            <div className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 border border-dotted border-gray-300 px-2 py-1 inline-flex items-center space-x-1">
                              <Key className="w-3 h-3 text-[#FF5A00] shrink-0" />
                              <span>{lic.licenseKey}</span>
                            </div>
                          </td>

                          <td className="p-3 align-middle text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{lic.issuedAt}</span>
                            </div>
                          </td>

                          <td className="p-3 align-middle">
                            {lic.expiryDate ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-1 text-gray-700 font-bold">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{lic.expiryDate}</span>
                                </div>
                                {lic.status === 'Active' && (
                                  <span className="text-[9px] text-gray-400 block uppercase">
                                    ROTATION PENDING
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No expiry specified</span>
                            )}
                          </td>

                          <td className="p-3 align-middle">
                            <span className={`px-2 py-1 font-black text-[9px] uppercase inline-flex items-center border ${
                              lic.status === 'Active' ? 'bg-green-50 text-green-700 border-green-300' :
                              lic.status === 'Suspended' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                              lic.status === 'Deactivated' ? 'bg-red-50 text-red-700 border-red-300' :
                              lic.status === 'Expired' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                              'bg-yellow-50 text-yellow-700 border-yellow-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 mr-1.5 ${
                                lic.status === 'Active' ? 'bg-green-500' :
                                lic.status === 'Suspended' ? 'bg-amber-500' :
                                lic.status === 'Deactivated' ? 'bg-red-500' :
                                lic.status === 'Expired' ? 'bg-orange-500' :
                                'bg-yellow-500'
                              }`} />
                              {lic.status}
                            </span>
                          </td>

                          <td className="p-3 align-middle text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                title="Renew & Cycle Keys"
                                onClick={() => handleRenew(lic)}
                                disabled={lic.status === 'Deactivated'}
                                className={`p-1.5 border font-bold text-[10px] transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  lic.status === 'Deactivated' 
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                                    : 'border-green-600 hover:bg-green-50 text-green-700'
                                }`}
                              >
                                <RefreshCw className="w-3 h-3 shrink-0" />
                                <span className="ml-1 hidden xl:inline">Renew</span>
                              </button>

                              <button
                                title="Suspend Gateway"
                                onClick={() => handleSuspend(lic)}
                                disabled={lic.status === 'Suspended' || lic.status === 'Deactivated'}
                                className={`p-1.5 border font-bold text-[10px] transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  lic.status === 'Suspended' || lic.status === 'Deactivated'
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                    : 'border-amber-600 hover:bg-amber-50 text-amber-700'
                                }`}
                              >
                                <Ban className="w-3 h-3 shrink-0" />
                                <span className="ml-1 hidden xl:inline">Suspend</span>
                              </button>

                              <button
                                title="Deactivate Permanently"
                                onClick={() => handleDeactivate(lic)}
                                disabled={lic.status === 'Deactivated'}
                                className={`p-1.5 border font-bold text-[10px] transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  lic.status === 'Deactivated'
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                    : 'border-red-600 hover:bg-red-50 text-red-600'
                                }`}
                              >
                                <X className="w-3 h-3 shrink-0" />
                                <span className="ml-1 hidden xl:inline">Deactivate</span>
                              </button>

                              <button
                                title="Audit Timeline"
                                onClick={() => handleOpenHistory(lic)}
                                className="p-1.5 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-bold text-[10px] transition-colors inline-flex items-center justify-center cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5 shrink-0" />
                                <span className="ml-1 hidden xl:inline">History</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SPECS */}
          <div className="bg-[#1A1A1A] text-white border border-[#2A2A2A] p-4 font-mono text-[11px] space-y-2">
            <div className="flex items-center space-x-2 text-[#FF5A00] font-black uppercase">
              <Info className="w-4 h-4" />
              <span>seiGEN CRYPTO BINDING FRAMEWORK COMPLIANCE</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Terminal devices are authorized using continuous public-key rotation. Renewals re-align co-location cache vectors, suspensions hold inbound REST packages instantly, and deactivations purge decryption keys permanently from client TPM memory blocks.
            </p>
          </div>
        </div>
      )}


      {/* ==========================================================================
         POS ACTIVATION BRIDGE VIEW
         ========================================================================== */}
      {activeTab === 'activation-bridge' && (
        <div id="subview_activation_bridge" className="space-y-6 animate-fade-in">
          
          {/* Header block with actions */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase text-[#1A1A1A] tracking-wider">POS Activation Bridge Controller</h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">Dual-mode licensing authorization & cryptographic validation logs</p>
            </div>
            
            <button
              onClick={() => {
                const activeVendors = vendors.filter((v: Vendor) => v.status === 'Active');
                setActVendorId(activeVendors[0]?.id || (vendors[0]?.id || ''));
                const posPlans = plans.filter((p: Plan) => p.type === 'POS' || p.type === 'Hybrid');
                setActPlanId(posPlans[0]?.id || (plans[0]?.id || ''));
                setActStartDate(new Date().toISOString().split('T')[0]);
                
                const expDate = new Date();
                expDate.setFullYear(expDate.getFullYear() + 1);
                setActExpiryDate(expDate.toISOString().split('T')[0]);
                setActNotes('');
                setIsActivationDrawerOpen(true);
              }}
              className="flex items-center space-x-1.5 bg-[#FF5A00] hover:bg-[#1A1A1A] text-white text-[10px] font-sans font-black py-2.5 px-4 uppercase tracking-wider transition-all rounded-none cursor-pointer border-2 border-transparent"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Issue POS Activation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Table of Records: Span 2 Columns */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
                <div className="p-3 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#1A1A1A] uppercase tracking-wider text-xs">
                  Active POS Activation Registry
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="bg-[#1A1A1A] text-white uppercase text-[9px] border-b border-[#1A1A1A]">
                        <th className="p-2.5">License Ref</th>
                        <th className="p-2.5">Merchant Entity</th>
                        <th className="p-2.5">Parameters / Mode</th>
                        <th className="p-2.5">Expiration</th>
                        <th className="p-2.5">Compliance Status</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1D1CF]">
                      {activationRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-405 italic">
                            No POS activation bridge records registered.
                          </td>
                        </tr>
                      ) : (
                        activationRecords.map((record) => (
                          <tr key={record.licenseId} className="hover:bg-[#F9F9F8]">
                            <td className="p-2.5 font-bold align-middle">
                              <div>{record.licenseId}</div>
                              <div className="text-[9px] text-[#FF5A00] uppercase font-semibold mt-0.5">{record.planName}</div>
                            </td>
                            <td className="p-2.5 align-middle">
                              <div className="font-bold text-[#1A1A1A]">{record.vendorName}</div>
                              <div className="text-[9px] text-gray-400">ID: {record.vendorId}</div>
                            </td>
                            <td className="p-2.5 align-middle">
                              <div className="flex flex-wrap gap-1">
                                {record.licenseMode === 'demo' ? (
                                  <span className="bg-orange-50 border border-orange-200 text-[#FF5A00] font-black px-1.5 py-0.2 text-[8px] uppercase tracking-tight">
                                    DEMO / LOCAL ONLY
                                  </span>
                                ) : (
                                  <span className="bg-blue-50 border border-blue-200 text-blue-700 font-black px-1.5 py-0.2 text-[8px] uppercase tracking-tight">
                                    PRODUCTION / CLOUD
                                  </span>
                                )}
                                <span className="bg-stone-100 text-stone-700 border border-stone-200 text-[8px] px-1 py-0.2 font-semibold">
                                  T:{record.maxTerminals} • B:{record.maxBranches} • S:{record.maxStaff}
                                </span>
                              </div>
                            </td>
                            <td className="p-2.5 align-middle">
                              <div className="text-gray-700">{record.expiresAt}</div>
                              <div className="text-[9px] text-gray-400">Starts: {record.startsAt}</div>
                            </td>
                            <td className="p-2.5 align-middle">
                              <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase inline-flex items-center border ${
                                record.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                record.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                record.status === 'expired' ? 'bg-red-50 text-red-700 border-red-300' :
                                'bg-stone-50 text-stone-700 border-stone-300'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="p-2.5 align-middle text-right space-x-1">
                              {record.status !== 'suspended' && record.status !== 'revoked' && (
                                <button
                                  onClick={() => {
                                    updatePOSActivationStatus(record.licenseId, 'suspended');
                                    setActivationRecords(getPOSActivationRecords());
                                  }}
                                  className="text-amber-600 hover:text-amber-800 font-bold uppercase text-[9px] hover:underline"
                                  title="Suspend POS license state"
                                >
                                  Suspend
                                </button>
                              )}
                              {record.status !== 'revoked' && (
                                <button
                                  onClick={() => {
                                    updatePOSActivationStatus(record.licenseId, 'revoked');
                                    setActivationRecords(getPOSActivationRecords());
                                  }}
                                  className="text-red-600 hover:text-red-800 font-bold uppercase text-[9px] hover:underline"
                                  title="Revoke POS license authorization"
                                >
                                  Revoke
                                </button>
                              )}
                              {record.status !== 'expired' && record.status !== 'revoked' && (
                                <button
                                  onClick={() => {
                                    updatePOSActivationStatus(record.licenseId, 'expired');
                                    setActivationRecords(getPOSActivationRecords());
                                  }}
                                  className="text-red-750 hover:text-red-900 font-bold uppercase text-[9px] hover:underline"
                                  title="Mark POS license as expired"
                                >
                                  Expire
                                </button>
                              )}
                              {record.status !== 'active' && (
                                <button
                                  onClick={() => {
                                    updatePOSActivationStatus(record.licenseId, 'active');
                                    setActivationRecords(getPOSActivationRecords());
                                  }}
                                  className="text-emerald-600 hover:text-emerald-800 font-bold uppercase text-[9px] hover:underline"
                                  title="Reactivate POS license parameters"
                                >
                                  Reactivate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Validation Panel: Column 3 */}
            <div className="space-y-4">
              <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase border-b border-[#D1D1CF] pb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5A00]" />
                  Verify Vendor POS Access
                </h3>

                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] font-bold font-mono">Select Target Vendor</label>
                    <select
                      value={validateVendorId}
                      onChange={(e) => setValidateVendorId(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-mono rounded-none uppercase"
                    >
                      <option value="">-- Choose Vendor to Check --</option>
                      {vendors.map((v: Vendor) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleValidateAccess}
                    className="w-full bg-[#1A1A1A] hover:bg-[#FF5A00] text-white py-2 uppercase font-bold text-center tracking-wide transition-colors font-mono cursor-pointer rounded-none text-[10px]"
                  >
                    Validate Vendor POS Access
                  </button>
                </div>

                {/* Validation Results Display */}
                {validationResult && (
                  <div className="border border-[#D1D1CF] bg-gray-50 p-4 font-mono text-[10px] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#D1D1CF] pb-2">
                      <span className="font-bold text-gray-500 uppercase">ACCESS COMPLIANCE STATUS:</span>
                      <span className={`px-2 py-0.5 font-black uppercase text-[9px] inline-flex items-center border ${
                        validationResult.allowed 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}>
                        {validationResult.allowed ? 'ALLOWED' : 'BLOCKED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-400 uppercase text-[9px] block">REASON CODE</span>
                        <span className="font-bold text-[#1A1A1A]">{validationResult.reasonCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 uppercase text-[9px] block">LICENSE BIND ID</span>
                        <span className="font-bold text-[#1A1A1A]">{validationResult.license?.licenseId || 'N/A'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400 uppercase text-[9px] block">COMPLIANCE DIAGNOSTICS MESSAGE</span>
                        <span className="font-sans text-xs text-gray-700 leading-normal block mt-0.5">{validationResult.message}</span>
                      </div>
                      {validationResult.license && (
                        <>
                          <div>
                            <span className="text-gray-400 uppercase text-[9px] block">LICENSE MODE</span>
                            <span className="font-bold uppercase">{validationResult.license.licenseMode}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase text-[9px] block">STORAGE MODE</span>
                            <span className="font-bold uppercase">{validationResult.license.storageMode}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase text-[9px] block">EXPIRATION DATE</span>
                            <span className="font-bold">{validationResult.license.expiresAt}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}


      {/* ==========================================================================
         B. VIEW: TAB 2 - SUBSCRIPTION TERM LICENSE TOKEN GENERATOR
         ========================================================================== */}
      {activeTab === 'generator' && (
        <div id="subview_token_generator" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* LEFT FORM COLUMN (8 of 12 spans) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-6">
              
              <div className="border-b border-[#D1D1CF] pb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-5 h-5 text-[#FF5A00]" />
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A]">TOKEN GENERATOR CONSOLE</h2>
                    <p className="text-[10px] text-gray-500 font-mono">BETA SIGNING ALGORITHM ENFORCED</p>
                  </div>
                </div>
                <div className="bg-[#FF5A00]/10 text-[#FF5A00] font-mono px-2 py-0.5 text-[9px] font-bold uppercase">
                  SHA-256 ACTIVE
                </div>
              </div>

              {/* GENERATOR OPTIONS INPUTS */}
              <div className="space-y-4 font-mono text-xs">
                
                {/* MERCHANT VENDOR SELECT */}
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">1. Target Merchant Vendor</label>
                  <select
                    value={genVendorId}
                    onChange={(e) => setGenVendorId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                  >
                    {vendors.filter(v => v.status === 'Active').map((v: Vendor) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.id}) — ACTIVE MERCHANT
                      </option>
                    ))}
                    {vendors.filter(v => v.status !== 'Active').map((v: Vendor) => (
                      <option key={v.id} value={v.id} disabled>
                        {v.name} ({v.id}) — [{v.status}] (INELIGIBLE)
                      </option>
                    ))}
                  </select>
                </div>

                {/* PLANS pricing SLAB SELECT */}
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">2. Capacity Pricing Plan Slab</label>
                  <select
                    value={genPlanId}
                    onChange={(e) => setGenPlanId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                  >
                    {plans.map((p: Plan) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${p.price}/Mo [Terminals: {p.maxTerminals}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* TERM INTERVAL SELECTION */}
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">3. Subscription Cycle Term</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Monthly', label: 'Monthly Term', discount: 'Standard Rate' },
                      { id: 'Quarterly', label: 'Quarterly Pack', discount: '10% OFF' },
                      { id: 'Yearly', label: 'Annual Pass', discount: '20% OFF SAVINGS' }
                    ].map((term) => (
                      <button
                        key={term.id}
                        type="button"
                        onClick={() => setGenBillingCycle(term.id as any)}
                        className={`border-2 p-3 text-left transition-all relative cursor-pointer ${
                          genBillingCycle === term.id 
                            ? 'border-[#1A1A1A] bg-[#F4F4F1]' 
                            : 'border-gray-200 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="font-bold text-[#1A1A1A] text-xs uppercase">{term.label}</div>
                        <div className="text-[9px] font-semibold text-[#FF5A00] uppercase mt-1">{term.discount}</div>
                        {genBillingCycle === term.id && (
                          <span className="absolute right-2 top-2 bg-[#FF5A00] text-white p-0.5 text-[7px] font-black uppercase">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* COLLECTION TAGGING */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">4. Assign to Collections Cluster</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomTagSelected(!isCustomTagSelected)}
                      className="text-[#FF5A00] hover:underline text-[9px] font-extrabold uppercase"
                    >
                      {isCustomTagSelected ? 'Choose Existing Tag' : '+ Create Custom Tag'}
                    </button>
                  </div>

                  {isCustomTagSelected ? (
                    <div className="relative">
                      <Tag className="absolute left-2.5 top-2.5 w-4 h-4 text-[#FF5A00]" />
                      <input
                        type="text"
                        required
                        placeholder="ENTER NEW COLLECTION CLUSTER NAME..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        className="w-full bg-white border-2 border-[#1A1A1A] py-2 pl-9 pr-4 text-xs font-semibold uppercase placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <select
                      value={genCollectionTag}
                      onChange={(e) => setGenCollectionTag(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                    >
                      {uniqueCollections.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* NOTES */}
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">5. Technicians Notes & Details</label>
                  <textarea
                    rows={2}
                    value={genNotes}
                    onChange={(e) => setGenNotes(e.target.value)}
                    placeholder="E.g., Special co-location edge configuration, deployment by Vance..."
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

              </div>

              {/* GENERATE ACTION AREA */}
              <div className="pt-4 border-t border-[#D1D1CF] space-y-4">
                
                {/* Generation loader states */}
                {isGenerating ? (
                  <div className="bg-[#1A1A1A] text-[#FF5A00] p-4 font-mono text-center space-y-2 border-2 border-[#1A1A1A]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                    <div className="text-[10px] font-bold uppercase tracking-widest">CRYPTOGRAPHIC COMPILING CYCLE IN PROCESS</div>
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider">{generationStep}</div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartGenerateToken}
                    className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-3.5 px-4 font-sans font-black text-xs uppercase tracking-wider transition-all duration-150 rounded-none shadow-md cursor-pointer border-2 border-transparent active:translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>GENERATE CRYPTO TERM LICENSE KEY</span>
                  </button>
                )}

                {/* Success dialog output */}
                {generatedTokenResult && (
                  <div className="bg-[#F0FDF4] border-2 border-[#15803D] p-5 font-mono text-xs space-y-3 animate-fade-in">
                    <div className="flex items-center space-x-2 text-[#15803D] font-bold">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span className="uppercase text-sm">SECURITY ENVELOPE DIGITALLY SIGNED</span>
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      Ecosystem ledger reports: <strong>Active credential signed</strong> and registered under cluster index "<em>{isCustomTagSelected ? customTagInput : genCollectionTag}</em>" successfully!
                    </p>

                    <div className="flex items-center justify-between bg-white border border-[#D1D1CF] p-3 mt-2 rounded-none">
                      <span className="font-bold text-[#1A1A1A] text-sm select-all pr-2 tracking-wide font-mono">
                        {generatedTokenResult}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className={`px-3 py-1 text-[9px] font-extrabold uppercase transition-all flex items-center space-x-1 cursor-pointer ${
                          copiedToken ? 'bg-green-700 text-white' : 'bg-[#1A1A1A] hover:bg-[#FF5A00] text-white'
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedToken ? 'COPIED!' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* RIGHT COST CALCULATOR SIDE PANEL (5 of 12 spans) */}
          <div className="lg:col-span-5 space-y-6 font-mono text-xs">
            
            {/* PRICING BREAKDOWN CARD */}
            <div className="bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-6">
              
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4.5 h-4.5 text-[#FF5A00]" />
                  <span className="font-bold uppercase tracking-wider">LEDGER CALCULATOR</span>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>

              {/* STAT LINES */}
              <div className="space-y-4 text-[11px]">
                
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400 uppercase">Base Plan Price</span>
                  <span className="font-bold">${calculatedPricing.basePrice}.00 / Mo</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400 uppercase">Term Multiplier</span>
                  <span className="font-bold">x {calculatedPricing.months} Month(s)</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400 uppercase">Slab Subtotal</span>
                  <span className="font-bold">${calculatedPricing.subtotal}.00</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2 text-orange-400">
                  <span className="uppercase">Discount ({calculatedPricing.discountRate * 100}%)</span>
                  <span className="font-bold">- ${calculatedPricing.discountAmt.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b border-white/10 pb-4 pt-2 text-white">
                  <span className="uppercase font-bold text-xs">Net Term Cost</span>
                  <span className="font-black text-lg text-[#FF5A00] font-sans">
                    ${calculatedPricing.finalPrice.toLocaleString()}.00
                  </span>
                </div>

              </div>

              {/* METRIC ANALYSIS */}
              <div className="bg-[#2D2D2D] border-l-4 border-[#FF5A00] p-4 text-[10px] text-gray-300 leading-relaxed space-y-1">
                <span className="text-white font-bold block uppercase mb-1">METRIC ANALYSIS DETAILS:</span>
                <div>• ARR Contribution: ${(calculatedPricing.finalPrice / calculatedPricing.months * 12).toLocaleString()}.00/Yr</div>
                <div>• Margin Contribution: +94.2% Operational Margin</div>
                <div>• Automatic Renewal Grace Period: 15-Day TTL Lock</div>
              </div>

            </div>

            {/* LIVE DIGITAL TOKEN TOKEN MOCK PREVIEW */}
            <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-4">
              <span className="text-gray-500 uppercase text-[9px] font-bold block">LIVE GENERATED CRYPTO PREVIEW</span>
              
              <div className="bg-[#F4F4F1] border-2 border-dashed border-[#D1D1CF] p-4 flex flex-col justify-between h-40 relative overflow-hidden select-none">
                
                {/* Background matrix style watermark */}
                <div className="absolute right-[-10px] bottom-[-20px] text-gray-200/50 text-[100px] font-black tracking-tighter select-none font-sans uppercase">
                  SGN
                </div>

                <div className="flex justify-between items-start z-10">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">seiGEN COMMERCE SECURE PROTOCOL</span>
                    <span className="text-xs text-[#1A1A1A] font-extrabold uppercase font-sans">
                      {vendors.find(v => v.id === genVendorId)?.name || 'Merchant Loading...'}
                    </span>
                  </div>
                  <div className="bg-[#FF5A00] text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-widest">
                    {genBillingCycle}
                  </div>
                </div>

                <div className="z-10 font-bold text-[#1A1A1A] tracking-wider text-[11px] bg-white border border-[#D1D1CF] p-2 inline-block font-mono">
                  {liveTokenPreview}
                </div>

                <div className="flex justify-between items-center z-10 text-[9px] text-gray-400">
                  <span>CAPACITY: {plans.find(p => p.id === genPlanId)?.maxTerminals || 'N/A'} DEVICES</span>
                  <span>ISSUER: {currentAdmin?.name || 'SYSTEM'}</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}


      {/* ==========================================================================
         C. VIEW: TAB 3 - ACTIVE LICENSES GROUPED BY VENDOR MATRIX WITH FILTERS
         ========================================================================== */}
      {activeTab === 'matrix' && (
        <div id="subview_slabs_matrix" className="space-y-6 animate-fade-in">
          
          {/* STATS DECK */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-white border-2 border-[#1A1A1A] p-4 text-[#1A1A1A]">
              <span className="text-gray-400 uppercase text-[9px] font-bold">TOTAL COMMITTED MONTHLY REV</span>
              <div className="text-2xl font-black mt-1 font-sans text-emerald-600">
                ${matrixStatsSummary.monthlyValue.toLocaleString()}.00
              </div>
              <span className="text-[8px] text-gray-400 uppercase">Normalized term values</span>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-4 text-[#1A1A1A]">
              <span className="text-gray-400 uppercase text-[9px] font-bold">TOTAL ARR CONTRIBUTION</span>
              <div className="text-2xl font-black mt-1 font-sans text-emerald-600">
                ${matrixStatsSummary.arr.toLocaleString()}.00
              </div>
              <span className="text-[8px] text-gray-400 uppercase">Annualized projection rate</span>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-4 text-[#1A1A1A]">
              <span className="text-gray-400 uppercase text-[9px] font-bold">ACTIVE DEPLOYED ENVELOPE</span>
              <div className="text-2xl font-black mt-1 font-sans">
                {matrixStatsSummary.activeCount} / {matrixStatsSummary.totalCount}
              </div>
              <span className="text-[8px] text-gray-400 uppercase">Tokens currently active</span>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-4 text-[#1A1A1A]">
              <span className="text-gray-400 uppercase text-[9px] font-bold">SUSPENDED OR EXPIRED</span>
              <div className="text-2xl font-black mt-1 font-sans text-amber-600">
                {activeMatrixData.filter(lic => lic.status !== 'Active').length}
              </div>
              <span className="text-[8px] text-gray-400 uppercase">Operational cycles paused</span>
            </div>
          </div>

          {/* FILTERING MATRIX CONTROLS PANEL */}
          <div className="bg-[#EAEAE8] border border-[#D1D1CF] p-4 font-mono text-xs grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <div className="md:col-span-4 space-y-1">
              <span className="text-gray-500 uppercase text-[9px] font-bold">Search Licenses:</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="SEARCH VENDOR OR TOKEN KEY..."
                  value={matrixSearchQuery}
                  onChange={(e) => setMatrixSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] py-1.5 pl-9 pr-4 text-xs font-semibold uppercase focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-1">
              <span className="text-gray-500 uppercase text-[9px] font-bold">Filter Collections Cluster:</span>
              <select
                value={matrixCollectionFilter}
                onChange={(e) => setMatrixCollectionFilter(e.target.value)}
                className="w-full bg-white border border-[#D1D1CF] p-2 text-xs font-semibold uppercase focus:outline-none"
              >
                <option value="All">All Collections ({posLicenses.length})</option>
                {uniqueCollections.map((colName) => (
                  <option key={colName} value={colName}>
                    {colName} ({posLicenses.filter(lic => lic.collectionTag === colName).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <span className="text-gray-500 uppercase text-[9px] font-bold">Filter Plan Slabs:</span>
              <select
                value={matrixPlanFilter}
                onChange={(e) => setMatrixPlanFilter(e.target.value)}
                className="w-full bg-white border border-[#D1D1CF] p-2 text-xs font-semibold uppercase focus:outline-none"
              >
                <option value="All">All Plans</option>
                <option value="Starter POS">Starter POS</option>
                <option value="Growth POS">Growth POS</option>
                <option value="Multi-Branch POS">Multi-Branch POS</option>
                <option value="Enterprise Commerce">Enterprise Commerce</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <span className="text-gray-500 uppercase text-[9px] font-bold">Filter Cycles:</span>
              <select
                value={matrixCycleFilter}
                onChange={(e) => setMatrixCycleFilter(e.target.value)}
                className="w-full bg-white border border-[#D1D1CF] p-2 text-xs font-semibold uppercase focus:outline-none"
              >
                <option value="All">All Cycles</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

          </div>

          {/* ACTIVE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMatrixData.length === 0 ? (
              <div className="col-span-full bg-white border-2 border-dashed border-[#D1D1CF] p-12 text-center font-mono text-xs text-gray-400 uppercase font-black">
                NO ACTIVE BINDINGS MATCH THE SELECTED MATRIX FILTERS
              </div>
            ) : (
              activeMatrixData.map((lic: POSLicense) => {
                const linkedVendor = vendors.find(v => v.name === lic.vendorName);
                return (
                  <div 
                    key={lic.id} 
                    className={`bg-white border-2 shadow-sm font-mono text-xs flex flex-col justify-between hover:scale-[1.01] transition-transform ${
                      lic.status === 'Active' ? 'border-[#1A1A1A]' : 'border-[#D1D1CF] opacity-75'
                    }`}
                  >
                    
                    {/* Card Header */}
                    <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#FF5A00] font-black uppercase tracking-wider block">
                          {lic.planName || 'Standard POS'}
                        </span>
                        <h3 className="text-sm font-black text-[#1A1A1A] uppercase font-sans tracking-wide">
                          {lic.vendorName}
                        </h3>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                        lic.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {lic.status}
                      </span>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 space-y-3.5 flex-1">
                      
                      {/* Cryptographic Key Box */}
                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-400 uppercase font-bold block">Digital Signature Token</span>
                        <div className="bg-gray-50 border border-dotted border-gray-300 p-2 font-mono text-[10px] font-bold text-gray-700 flex items-center justify-between select-all">
                          <span>{lic.licenseKey}</span>
                          <Key className="w-3.5 h-3.5 text-[#FF5A00]" />
                        </div>
                      </div>

                      {/* Detail specs */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                        <div className="space-y-0.5">
                          <span className="text-gray-400 uppercase block text-[8px]">Billing Term</span>
                          <span className="font-bold text-[#1A1A1A] uppercase block">
                            {lic.billingCycle || 'Yearly'} Cycle
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400 uppercase block text-[8px]">Term Net Price</span>
                          <span className="font-bold text-emerald-700 block">
                            ${lic.tokenPrice ? lic.tokenPrice.toLocaleString() : '1,238'}.00
                          </span>
                        </div>
                        <div className="space-y-0.5 mt-1.5">
                          <span className="text-gray-400 uppercase block text-[8px]">Expiration</span>
                          <span className="font-bold text-gray-600 block flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {lic.expiryDate || '2027-01-15'}
                          </span>
                        </div>
                        <div className="space-y-0.5 mt-1.5">
                          <span className="text-gray-400 uppercase block text-[8px]">Linked RPN Ingress</span>
                          <span className="font-bold text-blue-700 block uppercase truncate">
                            {linkedVendor?.linkedRpnName ? (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Network className="w-3 h-3" />
                                {linkedVendor.linkedRpnName}
                              </span>
                            ) : 'Unassigned route'}
                          </span>
                        </div>
                      </div>

                      {/* Collection Tags */}
                      {lic.collectionTag && (
                        <div className="pt-2 border-t border-gray-100 flex items-center space-x-1">
                          <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-[9px] text-gray-500 font-extrabold uppercase">
                            CLUSTER: {lic.collectionTag}
                          </span>
                        </div>
                      )}

                    </div>

                    {/* Card Actions */}
                    <div className="p-4 border-t border-[#D1D1CF] bg-[#F9F9F8] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenHistory(lic)}
                        className="text-[10px] uppercase font-bold text-gray-500 hover:text-black hover:underline cursor-pointer"
                      >
                        Audit History
                      </button>

                      {lic.status === 'Active' ? (
                        <button
                          onClick={() => handleSuspend(lic)}
                          className="bg-[#1A1A1A] hover:bg-[#FF5A00] text-white py-1 px-3 text-[10px] uppercase font-black tracking-wide rounded-none cursor-pointer"
                        >
                          Suspend Token
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRenew(lic)}
                          className="bg-green-700 hover:bg-[#1A1A1A] text-white py-1 px-3 text-[10px] uppercase font-black tracking-wide rounded-none cursor-pointer"
                        >
                          Re-Activate
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}


      {/* ==========================================================================
         D. VIEW: TAB 4 - RPN VENDOR INGRESS ROUTING LINKER
         ========================================================================== */}
      {activeTab === 'rpn-linker' && (
        <div id="subview_rpn_linker" className="space-y-6 animate-fade-in">
          
          {/* NET DIAGRAM AND EXPLANATORY HEADER */}
          <div className="bg-[#1A1A1A] border-4 border-[#1A1A1A] p-5 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden font-mono text-xs">
            {/* Subtle mesh background design */}
            <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-[#FF5A00]/10 skew-x-12 translate-x-10" />
            
            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="flex items-center space-x-2 text-[#FF5A00] font-bold text-[10px] uppercase tracking-widest">
                <span className="w-2 h-2 bg-[#FF5A00] rounded-full animate-pulse" />
                <span>seiGEN ROUTING PROTOCOLS</span>
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wide">
                RELAY PROCESSING NODE (RPN) GATEWAY CONTROLLER
              </h2>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Relay Processing Nodes operate co-location databases across world edge locations to synchronize transaction databases under sub-10ms lag. Assigning merchants to explicit RPN agents directs telemetry lanes, isolates ledger queries, and ensures hardware fault compliance.
              </p>
            </div>

            <div className="shrink-0 flex space-x-4 bg-[#2D2D2D] p-3 border border-white/10 z-10 text-[10px]">
              <div className="space-y-1">
                <span className="text-gray-400 block uppercase text-[8px]">TOTAL ACTIVE NODES</span>
                <span className="font-extrabold text-white block text-sm">{rpnAgents.filter(r => r.connectionStatus !== 'Offline').length} / {rpnAgents.length}</span>
              </div>
              <div className="border-l border-white/10 pl-4 space-y-1">
                <span className="text-gray-400 block uppercase text-[8px]">TOTAL TUNNEL THREADS</span>
                <span className="font-extrabold text-[#FF5A00] block text-sm">
                  {vendors.filter(v => v.linkedRpnId).length} MERCHANT LINKS
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT DUAL COLUMN (8 of 12 spans) - LISTS OF ACTIVE RPN AGENT SHIELDS */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
                
                {/* Panel Header */}
                <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] flex justify-between items-center text-xs font-mono text-gray-500">
                  <span className="uppercase text-[#1A1A1A] font-bold">CO-LOCATION RPN ROUTING NODE STATUS</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 uppercase">
                    ONLINE ROUTER DAEMONS
                  </span>
                </div>

                {/* Nodes list */}
                <div className="divide-y divide-[#D1D1CF] font-mono text-xs">
                  {rpnRoutingData.map((node) => (
                    <div key={node.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-all">
                      
                      {/* Name / Region */}
                      <div className="space-y-1.5 max-w-sm">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-[#1A1A1A] text-sm">{node.name}</span>
                          <span className="bg-gray-100 text-gray-500 text-[8px] px-1 font-bold">{node.id}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center space-x-2">
                          <span>REGION: {node.region}</span>
                          <span>•</span>
                          <span>RATE: {node.throughput}</span>
                        </div>
                      </div>

                      {/* Linked merchants */}
                      <div className="flex-1 px-0 md:px-6 space-y-1">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block">
                          Currently Linked Tunnel Routes ({node.merchants.length}):
                        </span>
                        {node.merchants.length === 0 ? (
                          <span className="text-gray-400 italic text-[10px]">No active merchants mapped</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {node.merchants.map((merchant: Vendor) => (
                              <span 
                                key={merchant.id} 
                                className="bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-sm inline-flex items-center space-x-1"
                              >
                                <span>{merchant.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkVendor(merchant.id)}
                                  className="text-red-500 hover:text-red-700 ml-1 font-black"
                                  title="Sever Secure Tunnel Route"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Status / Active Sessions count */}
                      <div className="text-right shrink-0 space-y-1">
                        <div className="flex items-center justify-end space-x-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            node.connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' :
                            node.connectionStatus === 'Standby' ? 'bg-amber-400' : 'bg-red-500'
                          }`} />
                          <span className="font-bold uppercase text-[10px]">{node.connectionStatus}</span>
                        </div>
                        <div className="text-[9px] text-gray-400 uppercase">
                          {node.activeSessions.toLocaleString()} ACTIVE SESSIONS
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

              {/* ACTIVE PHYSICAL TUNNEL ANIMATION MAPPING LAYOUT */}
              <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-4 font-mono text-xs">
                <span className="text-gray-400 uppercase text-[9px] font-bold block">ACTIVE ROUTING LANES FLOW VISUALIZATION</span>
                
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 divide-y divide-gray-100">
                  {vendors.filter(v => v.linkedRpnId).length === 0 ? (
                    <div className="text-center p-8 text-gray-400 italic">No operational network tunnels active. Use the form on the right to link a merchant.</div>
                  ) : (
                    vendors.filter(v => v.linkedRpnId).map((v: Vendor) => {
                      const linkedRpn = rpnAgents.find(r => r.id === v.linkedRpnId);
                      return (
                        <div key={v.id} className="pt-3 pb-1 flex items-center justify-between text-[11px] hover:bg-gray-50/50">
                          <div className="flex items-center space-x-2 shrink-0 w-1/3">
                            <Building className="w-3.5 h-3.5 text-[#FF5A00]" />
                            <span className="font-black text-[#1A1A1A] truncate">{v.name}</span>
                          </div>

                          {/* Visual dotted connection animation block */}
                          <div className="flex-1 flex items-center justify-center px-4 relative">
                            <div className="w-full border-t border-dashed border-blue-300 relative">
                              <span className="absolute top-[-8px] left-1/2 -translate-x-1/2 bg-blue-100 text-blue-700 border border-blue-300 font-bold px-1.5 py-0.2 text-[7px] uppercase tracking-widest rounded-full animate-pulse">
                                SECURE TLS 1.3
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 justify-end w-1/3 text-right">
                            <span className="font-black text-blue-700">{linkedRpn?.name || 'Frankfurt-Alpha'}</span>
                            <Network className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (4 of 12 spans) - ACTIONS TUNNEL LINKER FORM */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm font-mono text-xs space-y-6">
                
                <div className="border-b border-[#D1D1CF] pb-4">
                  <div className="flex items-center space-x-2">
                    <Link2 className="w-5 h-5 text-[#FF5A00]" />
                    <span className="font-bold uppercase tracking-wider text-[#1A1A1A]">MAP MERCHANT ROUTE</span>
                  </div>
                  <p className="text-[9px] text-gray-400 uppercase mt-0.5">ESTABLISH CRYPTO INGRESS TUNNEL</p>
                </div>

                <form onSubmit={handleLinkRPN} className="space-y-4">
                  
                  {/* SELECT MERCHANT */}
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">Select Active Merchant</label>
                    <select
                      value={linkerVendorId}
                      onChange={(e) => setLinkerVendorId(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-semibold uppercase focus:outline-none"
                    >
                      {vendors.map((v: Vendor) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.id}) [{v.linkedRpnId ? 'ROUTED' : 'UNROUTED'}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SELECT RPN TARGET */}
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">Select Ingress Node Target</label>
                    <select
                      value={linkerRpnId}
                      onChange={(e) => setLinkerRpnId(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-semibold uppercase focus:outline-none"
                    >
                      <option value="">-- Clear Operational Node Route --</option>
                      {rpnAgents.map((r: RPNAgent) => (
                        <option key={r.id} value={r.id} disabled={r.connectionStatus === 'Offline'}>
                          {r.name} ({r.id}) — {r.connectionStatus}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SELECT PROTOCOL */}
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">Tunnel Encryption Suite</label>
                    <select
                      value={linkerProtocol}
                      onChange={(e) => setLinkerProtocol(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-semibold uppercase focus:outline-none"
                    >
                      <option value="TLS 1.3 / ECDHE-RSA">TLS 1.3 / ECDHE-RSA (Standard)</option>
                      <option value="SHA256 Encrypted Packet Tunnel">SHA256 / AES-256 Symmetric</option>
                      <option value="AES-256 SSH Socket Tunnel">SSH Port Forwarding</option>
                      <option value="Quantum Resistant Kyber VPN">Kyber PQC VPN (Enterprise)</option>
                    </select>
                  </div>

                  {/* LATENCY TARGET THRESHOLD */}
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">SLA Latency Constraint</label>
                    <select
                      value={linkerLatencyLimit}
                      onChange={(e) => setLinkerLatencyLimit(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-semibold uppercase focus:outline-none"
                    >
                      <option value="10ms">Sub-10ms Fast-path</option>
                      <option value="25ms">Sub-25ms Co-location Standard</option>
                      <option value="50ms">Sub-50ms Normal SLA</option>
                      <option value="100ms">Sub-100ms Fallback Core</option>
                    </select>
                  </div>

                  {/* NOTICE */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-[10px] text-blue-800 leading-relaxed">
                    Establishing links configures routing queues and generates co-location cache indices. Traffic is isolated to this selected node.
                  </div>

                  {/* SUBMIT BUTTON */}
                  {linkerProcessState === 'processing' ? (
                    <div className="bg-[#1A1A1A] text-[#FF5A00] p-3 text-center text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5A00]" />
                      <span>TUNNEL CRYPTO NEGOTIATION...</span>
                    </div>
                  ) : linkerProcessState === 'success' ? (
                    <div className="bg-green-700 text-white p-3 text-center text-[10px] font-bold uppercase flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4 text-white" />
                      <span>ROUTE COMMITTED</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-2.5 uppercase font-bold text-center tracking-wider transition-colors rounded-none cursor-pointer mt-2"
                    >
                      Establish Ingress Link
                    </button>
                  )}

                </form>

              </div>
            </div>

          </div>

        </div>
      )}


      {/* ==========================================================================
         POS ACTIVATION BRIDGE DRAWER
         ========================================================================== */}
      {isActivationDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-end z-50 font-mono text-xs">
          <div className="absolute inset-0" onClick={() => setIsActivationDrawerOpen(false)} />
          
          <div className="bg-white border-l-4 border-[#1A1A1A] w-full max-w-md h-full relative z-10 flex flex-col justify-between shadow-2xl p-6 animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-[#FF5A00]" />
                  <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">ISSUE POS ACTIVATION BRIDGE</h2>
                </div>
                <button 
                  onClick={() => setIsActivationDrawerOpen(false)} 
                  className="text-gray-400 hover:text-black border border-transparent hover:border-black p-1 transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleActivationSubmit} className="space-y-4 mt-6">
                
                {/* Vendor select */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Select Vendor Merchant</label>
                  <select
                    required
                    value={actVendorId}
                    onChange={(e) => setActVendorId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                  >
                    <option value="" disabled>-- Choose Registered Vendor --</option>
                    {vendors.map((v: Vendor) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.id}) [{v.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plan select */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Billing Plan Slabs</label>
                  <select
                    required
                    value={actPlanId}
                    onChange={(e) => setActPlanId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                  >
                    <option value="" disabled>-- Choose Connected Plan --</option>
                    {plans.map((p: Plan) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* License Mode Selector */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">License Mode</label>
                  <select
                    required
                    value={actLicenseMode}
                    onChange={(e) => setActLicenseMode(e.target.value as any)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase font-bold"
                  >
                    <option value="production">PRODUCTION / CLOUD</option>
                    <option value="demo">DEMO / LOCAL ONLY</option>
                  </select>
                </div>

                {/* Storage Mode Selector */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Storage Mode</label>
                  <select
                    required
                    disabled
                    value={actStorageMode}
                    className="w-full bg-[#EAEAE8]/60 border border-[#D1D1CF] p-2.5 text-xs text-gray-500 rounded-none cursor-not-allowed uppercase font-semibold"
                  >
                    <option value="cloud">CLOUD INSTANCE</option>
                    <option value="localOnly">LOCAL ONLY (STORAGE MODE DIRECTORY)</option>
                  </select>
                  <p className="text-[9px] text-gray-400">
                    {actLicenseMode === 'demo' 
                      ? '※ Demo licenses are strictly restricted to localOnly storage mode.' 
                      : '※ Production licenses are strictly routed via cloud storage mode.'}
                  </p>
                </div>

                {/* Start Date and Expiry Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">Start Date</label>
                    <input
                      type="date"
                      required
                      value={actStartDate}
                      onChange={(e) => setActStartDate(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none rounded-none font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={actExpiryDate}
                      onChange={(e) => setActExpiryDate(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none rounded-none font-semibold"
                    />
                  </div>
                </div>

                {/* Custom Capacity Limits Grid */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 border border-[#D1D1CF]">
                  <div className="text-[9px] font-bold text-gray-700 uppercase col-span-2 border-b border-[#D1D1CF] pb-1">
                    Dynamic Threshold Resource Allocations
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[8px] block font-bold">Max Branches</label>
                    <input
                      type="text"
                      required
                      value={actMaxBranches}
                      onChange={(e) => setActMaxBranches(e.target.value)}
                      className="w-full bg-white border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[8px] block font-bold">Max Terminals</label>
                    <input
                      type="text"
                      required
                      value={actMaxTerminals}
                      onChange={(e) => setActMaxTerminals(e.target.value)}
                      className="w-full bg-white border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[8px] block font-bold">Max Staff</label>
                    <input
                      type="text"
                      required
                      value={actMaxStaff}
                      onChange={(e) => setActMaxStaff(e.target.value)}
                      className="w-full bg-white border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[8px] block font-bold">Max Products</label>
                    <input
                      type="text"
                      required
                      value={actMaxProducts}
                      onChange={(e) => setActMaxProducts(e.target.value)}
                      className="w-full bg-white border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Provisioning Notes */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Provisioning Notes</label>
                  <textarea
                    rows={2}
                    value={actNotes}
                    onChange={(e) => setActNotes(e.target.value)}
                    placeholder="Describe specific TPM bonding requests..."
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div className="bg-orange-50 border-l-4 border-[#FF5A00] p-3 text-[10px] text-orange-850 leading-relaxed font-sans">
                  <strong>ACTIVATION BRIDGE REGISTRY:</strong> This registers a mock authorization record on the validation stack.
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-3 uppercase font-bold text-center tracking-wider transition-colors rounded-none cursor-pointer mt-2"
                >
                  Confirm and Authorize Activation
                </button>
              </form>
            </div>

            <button
              onClick={() => setIsActivationDrawerOpen(false)}
              className="w-full bg-white border border-[#D1D1CF] text-gray-700 py-2.5 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-colors rounded-none cursor-pointer mt-4"
            >
              Cancel Operation
            </button>
          </div>
        </div>
      )}


      {/* ==========================================================================
         E. MODAL/DRAWER DIALOGS COMPONENT SECTION
         ========================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-end z-50 font-mono text-xs">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          
          <div className="bg-white border-l-4 border-[#1A1A1A] w-full max-w-md h-full relative z-10 flex flex-col justify-between shadow-2xl p-6 animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-[#FF5A00]" />
                  <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">ISSUE POS TERMINAL KEY</h2>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)} 
                  className="text-gray-400 hover:text-black border border-transparent hover:border-black p-1 transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleIssueSubmit} className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Select Vendor Merchant</label>
                  <select
                    required
                    value={formVendorId}
                    onChange={(e) => setFormVendorId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                  >
                    <option value="" disabled>-- Choose Registered Vendor --</option>
                    {vendors.map((v: Vendor) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.id}) [{v.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Billing / Slabs Plan</label>
                  <select
                    required
                    value={formPlanId}
                    onChange={(e) => setFormPlanId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                  >
                    <option value="" disabled>-- Choose Connected Plan --</option>
                    {plans.map((p: Plan) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price}/{p.interval === 'Monthly' ? 'Mo' : 'Yr'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Provisioning Notes</label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Describe specific TPM bonding requests..."
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div className="bg-orange-50 border-l-4 border-[#FF5A00] p-3 text-[10px] text-orange-800 leading-relaxed">
                  <strong>SYSTEM NOTICE:</strong> Submitting issues and signs a cryptographic hash key. This binds one terminal capacity unit inside the transaction registry.
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-3 uppercase font-bold text-center tracking-wider transition-colors rounded-none cursor-pointer mt-4"
                >
                  Confirm and Authorize Key
                </button>
              </form>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-full bg-white border border-[#D1D1CF] text-gray-700 py-2.5 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-colors rounded-none cursor-pointer"
            >
              Cancel Operation
            </button>
          </div>
        </div>
      )}


      {/* AUDIT TIMELINE HISTORY MODAL */}
      {isHistoryOpen && selectedLicense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 font-mono text-xs animate-fade-in">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-lg p-6 relative rounded-none shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            
            <button 
              onClick={() => {
                setIsHistoryOpen(false);
                setSelectedLicense(null);
              }} 
              className="absolute top-4 right-4 text-gray-500 hover:text-black hover:border border-black p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-3">
              <History className="w-5 h-5 text-[#FF5A00]" />
              <div>
                <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">AUDIT TIMELINE REGISTRY</h2>
                <span className="text-[10px] text-gray-400 uppercase">License: {selectedLicense.id} ({selectedLicense.terminalId})</span>
              </div>
            </div>

            <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-3 space-y-1 text-[11px]">
              <div><strong>Merchant Vendor:</strong> {selectedLicense.vendorName}</div>
              <div><strong>Active Cryptographic Key:</strong> {selectedLicense.licenseKey}</div>
              <div><strong>Slab Plan Model:</strong> {selectedLicense.planName || 'Starter POS'}</div>
              <div><strong>Expiration Signature:</strong> {selectedLicense.expiryDate || 'N/A'}</div>
              {selectedLicense.collectionTag && (
                <div><strong>Collections Cluster:</strong> {selectedLicense.collectionTag}</div>
              )}
              {selectedLicense.notes && (
                <div className="mt-2 text-gray-600 border-t border-gray-200 pt-1">
                  <strong>Notes:</strong> {selectedLicense.notes}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">CHRONOLOGICAL PROTOCOL STREAM</span>
              
              {filteredAuditTimeline.length === 0 ? (
                <div className="border border-dashed border-[#D1D1CF] p-6 text-center text-gray-400 uppercase font-semibold text-[10px]">
                  NO SPECIFIC AUDIT ENTRIES LOGGED FOR THIS LICENSE ROUTE YET.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:bottom-0 before:top-2 before:left-3 before:w-0.5 before:bg-[#D1D1CF]">
                  {filteredAuditTimeline.map((log: any) => (
                    <div key={log.id} className="relative pl-7 space-y-0.5">
                      <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#FF5A00] shadow-sm transform -translate-x-1/2"></span>
                      
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="bg-[#1A1A1A] text-white px-1.5 font-bold uppercase text-[8px]">{log.id}</span>
                      </div>
                      
                      <div className="font-bold text-[#1A1A1A] uppercase tracking-wide">
                        {log.action.replace(/_/g, ' ')}
                      </div>
                      
                      <div className="text-gray-600 text-[11px] leading-relaxed">
                        Actor <strong>{log.actor}</strong> committed target route <em>"{log.target}"</em> with status <span className="text-green-700 font-semibold">{log.status}</span>.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsHistoryOpen(false);
                  setSelectedLicense(null);
                }}
                className="w-full bg-[#1A1A1A] text-white py-2.5 uppercase font-bold text-center tracking-wide hover:bg-[#FF5A00] transition-colors rounded-none cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
