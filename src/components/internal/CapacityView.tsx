import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../../App';
import { Vendor, Plan, POSLicense } from '../../types';
import { 
  Cpu, 
  Layers, 
  Coins, 
  TrendingUp, 
  Calendar, 
  Plus, 
  RotateCcw, 
  Check, 
  X, 
  ArrowRight, 
  Search, 
  Building, 
  Sliders, 
  ShoppingBag, 
  Clock, 
  BarChart3,
  AlertTriangle,
  History,
  ShieldCheck,
  User,
  Activity,
  AlertCircle
} from 'lucide-react';

interface CommercialAddon {
  id: string;
  name: string;
  price: number;
  metric: string;
  soldCount: number;
  status: 'Active' | 'Inactive';
}

const DEFAULT_COMM_ADDONS: CommercialAddon[] = [
  { id: 'ADD-BRANCH', name: 'Extra Branch Slot', price: 15, metric: 'Branch Node', soldCount: 14, status: 'Active' },
  { id: 'ADD-TERMINAL', name: 'Extra Terminal Bind', price: 10, metric: 'POS Terminal', soldCount: 38, status: 'Active' },
  { id: 'ADD-WAREHOUSE', name: 'Extra Warehouse Sync', price: 30, metric: 'Fulfillment Node', soldCount: 6, status: 'Active' },
  { id: 'ADD-DELIVERY', name: 'Extra Delivery Rider', price: 5, metric: 'Rider Profile', soldCount: 22, status: 'Active' },
  { id: 'ADD-STORAGE', name: 'Extra Cloud Storage', price: 10, metric: '100GB Database Storage', soldCount: 18, status: 'Active' },
  { id: 'ADD-STAFF', name: 'Extra Operator Seat', price: 8, metric: 'Staff Clearance Profile', soldCount: 42, status: 'Active' },
  { id: 'ADD-SMS', name: 'SMS Notify Bundle', price: 5, metric: '500 transactional SMS alerts', soldCount: 15, status: 'Active' },
  { id: 'ADD-WHATSAPP', name: 'WhatsApp Tunnel Bundle', price: 20, metric: '2000 messaging API queries', soldCount: 8, status: 'Active' },
  { id: 'ADD-API', name: 'Developer API Sandbox', price: 50, metric: 'Webhook Routing Portal', soldCount: 5, status: 'Active' }
];

interface BusinessModule {
  code: string;
  name: string;
  price: number;
  status: 'Active' | 'Inactive';
  description: string;
  activatedCount: number;
}

const DEFAULT_COMM_MODULES: BusinessModule[] = [
  { code: 'ITRED-POS', name: 'iTredPOS', price: 49, status: 'Active', description: 'Enterprise core point-of-sale terminal node operations.', activatedCount: 142 },
  { code: 'VND-DISC', name: 'Vendor Discovery', price: 29, status: 'Active', description: 'Merchant onboarding directories and platform profiles search.', activatedCount: 98 },
  { code: 'IDELIVER', name: 'iDeliver', price: 39, status: 'Active', description: 'Fulfillment dispatcher and rider tracking gateway integration.', activatedCount: 34 },
  { code: 'CASHPLAN', name: 'CashPlan', price: 59, status: 'Inactive', description: 'Corporate treasury cash forecasting and cashflow analytics.', activatedCount: 0 },
  { code: 'POOLWISE', name: 'PoolWise', price: 79, status: 'Inactive', description: 'Cross-vendor cooperative stock sharing and inventory pooling.', activatedCount: 0 },
  { code: 'EXEC-BI', name: 'Executive BI', price: 99, status: 'Active', description: 'Predictive management dashboards and AI visual analytics.', activatedCount: 28 },
  { code: 'CRM', name: 'CRM & Loyalty', price: 39, status: 'Active', description: 'Customer profiles, rewards ledger, and points campaign engine.', activatedCount: 65 },
  { code: 'AI-ASSIST', name: 'AI Assistant', price: 49, status: 'Active', description: 'Natural language chat query operations for core inventories.', activatedCount: 42 },
  { code: 'PROCUREMENT', name: 'Procurement', price: 69, status: 'Inactive', description: 'Automated purchasing order templates and vendor quotation logs.', activatedCount: 0 },
  { code: 'CONSIGNMENT', name: 'Consignment', price: 89, status: 'Inactive', description: 'Third-party stock consignment tracking and revenue sharing.', activatedCount: 0 },
  { code: 'FIELDSALES', name: 'Field Sales', price: 49, status: 'Inactive', description: 'Simulated field sales terminal with offline-first local cache.', activatedCount: 0 },
  { code: 'ASSET-MGMT', name: 'Asset Management', price: 39, status: 'Inactive', description: 'Hardware terminal tracking and serial registration databases.', activatedCount: 0 },
  { code: 'PAYROLL', name: 'Payroll & HR', price: 59, status: 'Inactive', description: 'Timecard logging, operators commissions, and payroll processing.', activatedCount: 0 },
  { code: 'ACCT-CONN', name: 'Accounting Connector', price: 29, status: 'Inactive', description: 'Double-entry ledger auto-sync to external bookkeeping.', activatedCount: 0 },
  { code: 'API-ACCESS', name: 'API Access Gateway', price: 99, status: 'Active', description: 'Uplink webhook routing and raw read/write access tunnels.', activatedCount: 15 }
];

export default function CapacityView() {
  const { 
    vendors, 
    setVendors, 
    plans, 
    posLicenses, 
    setPosLicenses,
    activeStaffSession, 
    onAddWorkspaceAuditEvent, 
    onAddWorkspaceActivity,
    onAddWorkspaceNotification,
    workspaceAuditEvents,
    workflows,
    onAddWorkflow,
    onUpdateWorkflow
  } = useLifecycle();

  // Load custom commercial add-ons and business modules
  const [commAddons, setCommAddons] = useState<CommercialAddon[]>(() => {
    const raw = localStorage.getItem('sgn_comm_addons');
    if (!raw) return DEFAULT_COMM_ADDONS;
    try { return JSON.parse(raw); } catch { return DEFAULT_COMM_ADDONS; }
  });

  const saveCommAddons = (newAddons: CommercialAddon[]) => {
    setCommAddons(newAddons);
    localStorage.setItem('sgn_comm_addons', JSON.stringify(newAddons));
  };

  const [commModules, setCommModules] = useState<BusinessModule[]>(() => {
    const raw = localStorage.getItem('sgn_comm_modules');
    if (!raw) return DEFAULT_COMM_MODULES;
    try { return JSON.parse(raw); } catch { return DEFAULT_COMM_MODULES; }
  });

  const saveCommModules = (newModules: BusinessModule[]) => {
    setCommModules(newModules);
    localStorage.setItem('sgn_comm_modules', JSON.stringify(newModules));
  };

  // View Navigation Tab: 'dashboard' | 'subscriptions' | 'renewals' | 'upgrades' | 'capacity' | 'modules' | 'forecast'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscriptions' | 'renewals' | 'upgrades' | 'capacity' | 'modules' | 'forecast'>('dashboard');

  // Search queries & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Selected details
  const [selectedSubVendorId, setSelectedSubVendorId] = useState<string>(() => {
    return vendors[0]?.id || '';
  });

  const selectedSubVendor = useMemo(() => {
    return vendors.find(v => v.id === selectedSubVendorId) || null;
  }, [vendors, selectedSubVendorId]);

  // Upgrade fields
  const [upgradeVendorId, setUpgradeVendorId] = useState('');
  const [targetPlanId, setTargetPlanId] = useState('');

  // Modals visibility
  const [isCreateSubOpen, setIsCreateSubOpen] = useState(false);
  const [createSubVendorId, setCreateSubVendorId] = useState('');
  const [createSubPlanId, setCreateSubPlanId] = useState('');

  // 1. Dashboard KPI Calculations
  const metrics = useMemo(() => {
    // Sum plan pricing for active vendors + active capacity add-ons + active modules
    const activeVendors = vendors.filter(v => v.status === 'Active');
    const plansCost = activeVendors.reduce((acc, curr) => {
      const plan = plans.find(p => p.id === curr.assignedPlanId);
      return acc + (plan?.price || 0);
    }, 0);

    const addonsCost = commAddons.reduce((acc, curr) => {
      return acc + (curr.status === 'Active' ? curr.price * curr.soldCount : 0);
    }, 0);

    const modulesCost = commModules.reduce((acc, curr) => {
      return acc + (curr.status === 'Active' ? curr.price * curr.activatedCount : 0);
    }, 0);

    const mrr = plansCost + addonsCost + modulesCost;
    const activeSubs = activeVendors.length;

    // Expiring licenses (within 30 days)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringLicenses = posLicenses.filter((lic: any) => {
      const expDate = new Date(lic.expiryDate);
      return lic.status === 'Active' && expDate > new Date() && expDate <= thirtyDaysFromNow;
    }).length;

    // Demo conversions
    const demoConversions = workspaceAuditEvents.filter(e => e.action === 'VENDOR_DEMO_CONVERSION').length;

    // New vendors this month (mock / joinedDate in current month)
    const currentMonthStr = new Date().toISOString().split('-').slice(0,2).join('-');
    const newVendors = vendors.filter(v => v.joinedDate?.startsWith(currentMonthStr)).length;

    // Capacity add-ons sold
    const capacitySold = commAddons.reduce((acc, curr) => acc + curr.soldCount, 0);

    // Business Modules activated
    const modulesActivated = commModules.filter(m => m.status === 'Active').length;

    // Renewal Rate
    const renewalRate = 96.8;

    return { mrr, activeSubs, expiringLicenses, demoConversions, newVendors, capacitySold, modulesActivated, renewalRate };
  }, [vendors, plans, posLicenses, commAddons, commModules, workspaceAuditEvents]);

  // 2. Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return vendors.filter(v => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        v.id.toLowerCase().includes(q) || 
        v.name.toLowerCase().includes(q) || 
        (v.assignedPlanName && v.assignedPlanName.toLowerCase().includes(q));

      const matchPlan = filterPlan === 'all' || v.assignedPlanId === filterPlan;
      const matchStatus = filterStatus === 'all' || v.status === filterStatus;

      return matchSearch && matchPlan && matchStatus;
    });
  }, [vendors, searchQuery, filterPlan, filterStatus]);

  // 3. Renewals categories computed
  const renewals = useMemo(() => {
    const list = vendors.map(v => {
      const lic = posLicenses.find(l => l.vendorName === v.name);
      const expiry = lic ? new Date(lic.expiryDate) : null;
      const diffTime = expiry ? expiry.getTime() - Date.now() : 0;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return { vendor: v, license: lic, daysRemaining: diffDays };
    });

    const today = list.filter(item => item.daysRemaining === 0 && item.vendor.status === 'Active');
    const week = list.filter(item => item.daysRemaining > 0 && item.daysRemaining <= 7 && item.vendor.status === 'Active');
    const expired = list.filter(item => item.daysRemaining < 0 && item.vendor.status === 'Expired');
    const grace = list.filter(item => item.daysRemaining < 0 && item.vendor.status === 'Active'); // active but past expiry
    const cancelled = list.filter(item => item.vendor.status === 'Suspended' || item.vendor.status === 'Rejected');

    return { today, week, expired, grace, cancelled };
  }, [vendors, posLicenses]);

  // 4. Upgrade Preview
  const upgradePreview = useMemo(() => {
    if (!upgradeVendorId || !targetPlanId) return null;
    const vendor = vendors.find(v => v.id === upgradeVendorId);
    const targetPlan = plans.find(p => p.id === targetPlanId);
    if (!vendor || !targetPlan) return null;

    const currentPlan = plans.find(p => p.id === vendor.assignedPlanId);
    const deltaPrice = targetPlan.price - (currentPlan?.price || 0);

    return {
      currentCapacity: currentPlan ? `${currentPlan.maxBranches} branches / ${currentPlan.maxTerminals} terminals` : 'N/A',
      newCapacity: `${targetPlan.maxBranches} branches / ${targetPlan.maxTerminals} terminals`,
      deltaPrice
    };
  }, [upgradeVendorId, targetPlanId, vendors, plans]);

  // 5. Commercial Activity Feed computed from audit logs
  const commercialActivities = useMemo(() => {
    const comActions = [
      'PLAN_ASSIGN', 
      'VENDOR_DEMO_CONVERSION', 
      'POS_LICENSE_RENEW', 
      'POS_LICENSE_SUSPEND', 
      'POS_LICENSE_REVOKE',
      'ADDON_PURCHASE',
      'MODULE_ACTIVATE'
    ];
    return workspaceAuditEvents.filter(e => comActions.includes(e.action)).slice(0, 15);
  }, [workspaceAuditEvents]);

  // Operations triggers

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === createSubVendorId);
    const plan = plans.find(p => p.id === createSubPlanId);
    if (!vendor || !plan) return;

    // Update vendor subscription plan details
    const updated = vendors.map(v => {
      if (v.id === vendor.id) {
        return {
          ...v,
          assignedPlanId: plan.id,
          assignedPlanName: plan.name,
          status: 'Active' as const
        };
      }
      return v;
    });

    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    // Register active subscription workflow
    onAddWorkflow({
      workflowType: 'plan_assignment',
      title: `Plan Assign: ${vendor.name}`,
      description: `Subscription plan assigned to ${plan.name}.`,
      status: 'completed',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: vendor.id,
      targetType: 'subscription',
      currentStep: 3,
      totalSteps: 3
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'PLAN_ASSIGN',
      targetType: 'vendor',
      targetId: vendor.id,
      result: 'success',
      message: `Created active subscription to ${plan.name} for merchant ${vendor.name}.`
    });

    onAddWorkspaceNotification({
      title: 'Subscription Assigned',
      message: `Assigned ${plan.name} plan to merchant ${vendor.name}.`,
      type: 'info',
      priority: 'high',
      targetPath: '/capacity',
      workspaceId: 'commercial'
    });

    setIsCreateSubOpen(false);
    alert('Subscription assigned successfully.');
  };

  const handleRenewSubscription = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    const lic = posLicenses.find(l => l.vendorName === vendor.name);
    if (lic) {
      const parts = lic.expiryDate.split('-');
      const newYear = parseInt(parts[0]) + 1;
      const nextExpiry = `${newYear}-${parts[1]}-${parts[2]}`;

      const updatedLics = posLicenses.map(l => l.id === lic.id ? { ...l, expiryDate: nextExpiry, status: 'Active' as const } : l);
      setPosLicenses(updatedLics);
      localStorage.setItem('sgn_pos_licenses', JSON.stringify(updatedLics));
    }

    const updatedVendors = vendors.map(v => v.id === vendor.id ? { ...v, status: 'Active' as const } : v);
    setVendors(updatedVendors);
    localStorage.setItem('sgn_vendors', JSON.stringify(updatedVendors));

    // Approval workflow
    onAddWorkflow({
      workflowType: 'pos_license',
      title: `Renewal Approval: ${vendor.name}`,
      description: 'Subscription license renewed successfully.',
      status: 'completed',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: vendor.id,
      targetType: 'subscription',
      currentStep: 3,
      totalSteps: 3
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_RENEW',
      targetType: 'subscription',
      targetId: vendor.id,
      result: 'success',
      message: `Renewed annual subscription license code for merchant ${vendor.name}.`
    });

    onAddWorkspaceNotification({
      title: 'Renewal Completed',
      message: `Subscription renewal completed for ${vendor.name}.`,
      type: 'finance',
      priority: 'normal',
      targetPath: '/capacity',
      workspaceId: 'commercial'
    });

    alert('Subscription renewed successfully.');
  };

  const handleCancelSubscription = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    const updated = vendors.map(v => v.id === vendorId ? { ...v, status: 'Suspended' as const } : v);
    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_SUSPEND',
      targetType: 'subscription',
      targetId: vendorId,
      result: 'success',
      message: `Cancelled active subscription plan mapping for merchant ${vendor.name}.`
    });

    alert('Subscription cancelled.');
  };

  const handleUpgradeSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === upgradeVendorId);
    const targetPlan = plans.find(p => p.id === targetPlanId);
    if (!vendor || !targetPlan) return;

    const updated = vendors.map(v => {
      if (v.id === vendor.id) {
        return {
          ...v,
          assignedPlanId: targetPlan.id,
          assignedPlanName: targetPlan.name
        };
      }
      return v;
    });

    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    // Register active Upgrade workflow
    onAddWorkflow({
      workflowType: 'plan_assignment',
      title: `Upgrade: ${vendor.name}`,
      description: `Plan upgraded to ${targetPlan.name}.`,
      status: 'pending',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: vendor.id,
      targetType: 'upgrade',
      currentStep: 1,
      totalSteps: 2
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'PLAN_ASSIGN',
      targetType: 'vendor',
      targetId: vendor.id,
      result: 'success',
      message: `Upgraded subscription tier to ${targetPlan.name} for merchant ${vendor.name}.`
    });

    onAddWorkspaceNotification({
      title: 'Upgrade Initiated',
      message: `Upgrade to ${targetPlan.name} initiated for merchant ${vendor.name}.`,
      type: 'info',
      priority: 'high',
      targetPath: '/capacity',
      workspaceId: 'commercial'
    });

    alert('Upgrade proposal initiated. Verification pending.');
    setUpgradeVendorId('');
    setTargetPlanId('');
  };

  const handlePurchaseAddon = (addonId: string) => {
    const updated = commAddons.map(a => {
      if (a.id === addonId) {
        return { ...a, soldCount: a.soldCount + 1 };
      }
      return a;
    });
    saveCommAddons(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'ADDON_PURCHASE',
      targetType: 'addon',
      targetId: addonId,
      result: 'success',
      message: `Purchased capacity add-on tier: ${addonId}.`
    });

    onAddWorkspaceNotification({
      title: 'Capacity Purchased',
      message: `Purchased new capacity bundle addon: ${addonId}.`,
      type: 'finance',
      priority: 'normal',
      targetPath: '/capacity',
      workspaceId: 'commercial'
    });

    alert('Capacity add-on purchased successfully.');
  };

  const handleToggleModule = (module: BusinessModule) => {
    const nextStatus = module.status === 'Active' ? 'Inactive' : 'Active';
    const updated = commModules.map(m => m.code === module.code ? { ...m, status: nextStatus } : m);
    saveCommModules(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'MODULE_ACTIVATE',
      targetType: 'module',
      targetId: module.code,
      result: 'success',
      message: `Toggled business module "${module.name}" authorization state to ${nextStatus}.`
    });
  };

  return (
    <div className="space-y-6 select-none font-mono text-[#1A1A1A]">
      
      {/* Header Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#D1D1CF] pb-4">
        <div className="text-left">
          <h1 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] font-sans">
            Commercial operations Workspace
          </h1>
          <p className="text-[10px] text-gray-500 font-medium font-sans">
            Revenue tracking, subscription upgrades, renewals billing pipelines, and capacity marketplaces console.
          </p>
        </div>

        <div className="flex flex-wrap border-2 border-[#1A1A1A] bg-white text-[9px] font-black uppercase rounded-none">
          {(['dashboard', 'subscriptions', 'renewals', 'upgrades', 'capacity', 'modules', 'forecast'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 cursor-pointer transition-all border-r border-[#1A1A1A] last:border-none ${
                activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F4F4F1] text-gray-700 bg-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 1. COMMERCIAL EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* KPI 1 */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5A00]" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Monthly Recurring Revenue (MRR)</span>
              <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">\$${metrics.mrr.toLocaleString()}</span>
              <span className="text-[7px] text-gray-500 font-medium block">Total active billing tokens</span>
            </div>

            {/* KPI 2 */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Active Subscriptions</span>
              <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${metrics.activeSubs}</span>
              <span className="text-[7px] text-gray-500 font-medium block">Live verified merchants</span>
            </div>

            {/* KPI 3 */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Expiring Subscriptions (30d)</span>
              <span className="text-xl font-sans font-black text-red-650 block mt-1">${metrics.expiringLicenses}</span>
              <span className="text-[7px] text-gray-500 font-medium block">Awaiting payment renew</span>
            </div>

            {/* KPI 4 */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Demo Conversions</span>
              <span className="text-xl font-sans font-black text-gray-900 block mt-1">${metrics.demoConversions}</span>
              <span className="text-[7px] text-gray-500 font-medium block">Sandbox upgrades to paid</span>
            </div>

            {/* KPI 5 */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">New Vendors (This Month)</span>
              <span className="text-xl font-sans font-black text-gray-900 block mt-1">${metrics.newVendors}</span>
              <span className="text-[7px] text-gray-500 font-medium block">Recent registry arrivals</span>
            </div>

            {/* KPI 6 */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Capacity Add-ons Sold</span>
              <span className="text-xl font-sans font-black text-gray-900 block mt-1">${metrics.capacitySold}</span>
              <span className="text-[7px] text-gray-500 font-medium block">Extra terminal binds, etc.</span>
            </div>

            {/* KPI 7 */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Business Modules Active</span>
              <span className="text-xl font-sans font-black text-[#FF5A00] block mt-1">${metrics.modulesActivated}</span>
              <span className="text-[7px] text-gray-500 font-medium block">Activated marketplace apps</span>
            </div>

            {/* KPI 8 */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Renewal Rate</span>
              <span className="text-xl font-sans font-black text-emerald-800 block mt-1">${metrics.renewalRate}%</span>
              <span className="text-[7px] text-gray-500 font-medium block">Contract retention average</span>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Commercial timeline feed */}
            <div className="lg:col-span-2 bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
              <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
                <span>Commercial telemetry timeline</span>
              </div>
              <div className="relative border-l border-[#D1D1CF] pl-4 ml-2 space-y-4 text-left font-sans">
                {commercialActivities.length === 0 ? (
                  <div className="text-[9px] text-gray-400 italic uppercase font-mono font-bold">No commercial operations logged in telemetry database.</div>
                ) : (
                  commercialActivities.map(e => (
                    <div key={e.auditId} className="relative">
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 bg-white border-[#FF5A00] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-full" />
                      </div>
                      <div className="text-[9px]">
                        <div className="font-mono font-black uppercase tracking-wider text-gray-800 flex justify-between">
                          <span>{e.action}</span>
                          <span className="text-[7.5px] text-gray-400 font-normal">[{new Date(e.createdAt).toLocaleTimeString()}]</span>
                        </div>
                        <div className="text-gray-500 font-medium text-[8px] leading-relaxed mt-0.5 font-sans normal-case">{e.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick configuration links / cards */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
              <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
                <span>Billing System Integrations</span>
              </div>
              <p className="text-[10px] text-gray-500 normal-case font-sans font-medium">
                The billing ledger syncing triggers automatic webhooks on subscription expiration. Secure billing bridges are active in sandbox local clearance.
              </p>
              <div className="space-y-2 pt-2 text-[9px] font-black uppercase">
                <button onClick={() => setActiveTab('subscriptions')} className="w-full bg-[#F4F4F1] hover:bg-stone-200 border border-stone-250 p-2.5 flex justify-between cursor-pointer rounded-none text-left">
                  <span>Subscription Registry</span>
                  <span>&rarr;</span>
                </button>
                <button onClick={() => setActiveTab('upgrades')} className="w-full bg-[#F4F4F1] hover:bg-stone-200 border border-stone-250 p-2.5 flex justify-between cursor-pointer rounded-none text-left">
                  <span>Proposal migration center</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. SUBSCRIPTION MANAGER */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4 text-left">
          
          {/* Sub registry Search / Filters */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subscription ID, vendor, plan..."
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 pl-9 text-xs focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase tracking-wider"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-white border-2 border-[#1A1A1A] p-1.5 text-[9px] font-black focus:outline-none uppercase cursor-pointer rounded-none"
              >
                <option value="all">All Plans</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border-2 border-[#1A1A1A] p-1.5 text-[9px] font-black focus:outline-none uppercase cursor-pointer rounded-none"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Sub table layout */}
          <div className="bg-white border-2 border-[#1A1A1A] overflow-hidden">
            
            <div className="bg-[#FAF9F6] border-b border-[#1A1A1A] p-2.5 flex justify-between items-center text-[9px] font-black uppercase text-gray-500">
              <span>Subscription database registry</span>
              <button
                onClick={() => {
                  setCreateSubVendorId(vendors[0]?.id || '');
                  setCreateSubPlanId(plans[0]?.id || 'PLN-POS-STARTER');
                  setIsCreateSubOpen(true);
                }}
                className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
              >
                Create Subscription
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[9px] font-mono">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#1A1A1A] uppercase font-bold text-[8px] tracking-wider text-gray-500">
                    <th className="p-3 border-r border-gray-200">Subscription ID</th>
                    <th className="p-3 border-r border-gray-200">Vendor</th>
                    <th className="p-3 border-r border-gray-200">Current Plan</th>
                    <th className="p-3 border-r border-gray-200">Billing Cycle</th>
                    <th className="p-3 border-r border-gray-200">Renewal Date</th>
                    <th className="p-3 border-r border-gray-200">Amount</th>
                    <th className="p-3 border-r border-gray-200">Storage</th>
                    <th className="p-3 border-r border-gray-200">License</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map(v => {
                    const plan = plans.find(p => p.id === v.assignedPlanId);
                    const lic = posLicenses.find(l => l.vendorName === v.name);
                    const isSelected = selectedSubVendorId === v.id;

                    let badge = 'bg-stone-100 text-stone-800 border-stone-300';
                    if (v.status === 'Active') badge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                    else if (v.status === 'Suspended') badge = 'bg-red-50 text-red-800 border-red-300';

                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedSubVendorId(v.id)}
                        className={`border-b border-gray-150 hover:bg-[#FAF9F6] transition-colors cursor-pointer ${
                          isSelected ? 'bg-orange-50/40 font-bold' : ''
                        }`}
                      >
                        <td className="p-3 border-r border-gray-200 font-bold text-gray-450">SUB-{v.id}</td>
                        <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{v.name}</td>
                        <td className="p-3 border-r border-gray-200 font-sans text-[#FF5A00] font-bold uppercase text-[8px]">{v.assignedPlanName || 'No Plan'}</td>
                        <td className="p-3 border-r border-gray-200 uppercase text-[8px]">{plan?.interval || 'Monthly'}</td>
                        <td className="p-3 border-r border-gray-200 font-mono text-gray-650">{lic?.expiryDate || '—'}</td>
                        <td className="p-3 border-r border-gray-200 font-mono font-bold text-gray-800">\\$${plan?.price || 0}</td>
                        <td className="p-3 border-r border-gray-200 text-gray-500 uppercase text-[8px]">{v.storageMode || 'localOnly'}</td>
                        <td className="p-3 border-r border-gray-200 text-[8px] max-w-[100px] truncate">{v.licenseKey || '—'}</td>
                        <td className="p-3">
                          <span className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${badge}`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Inline Action Controls below Table */}
          {selectedSubVendor && (
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
              <div className="border-b border-gray-250 pb-2 text-[10px] font-black uppercase text-gray-800">
                Active operations controls: SUB-{selectedSubVendor.id} ({selectedSubVendor.name})
              </div>
              <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase">
                <button type="button" onClick={() => handleRenewSubscription(selectedSubVendor.id)} className="bg-[#FF5A00] text-white hover:bg-[#1A1A1A] px-3.5 py-2 cursor-pointer rounded-none">Renew subscription</button>
                <button type="button" onClick={() => handleCancelSubscription(selectedSubVendor.id)} className="bg-white border border-[#1A1A1A] hover:bg-red-650 hover:text-white px-3.5 py-2 cursor-pointer rounded-none">Cancel plan</button>
                <button type="button" onClick={() => {
                  setUpgradeVendorId(selectedSubVendor.id);
                  setTargetPlanId(plans[0]?.id || '');
                  setActiveTab('upgrades');
                }} className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-3.5 py-2 cursor-pointer rounded-none">Upgrade / Migration</button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. RENEWAL CENTRE */}
      {activeTab === 'renewals' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Today */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
              <div className="border-b border-red-500 pb-2 flex justify-between items-center text-[10px] font-black uppercase text-red-600">
                <span>Renew Today</span>
                <span className="bg-red-50 px-1.5 border border-red-300">{renewals.today.length}</span>
              </div>

              <div className="space-y-3">
                {renewals.today.map(item => (
                  <div key={item.vendor.id} className="bg-stone-50 border border-stone-200 p-3 flex justify-between items-center rounded-none text-[9px]">
                    <div>
                      <div className="font-sans font-black text-gray-900 uppercase">{item.vendor.name}</div>
                      <div className="text-gray-400 text-[8px] uppercase mt-0.5">{item.vendor.assignedPlanName}</div>
                    </div>
                    <button type="button" onClick={() => handleRenewSubscription(item.vendor.id)} className="bg-[#FF5A00] text-white px-2 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer">Renew</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: This Week */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
              <div className="border-b border-yellow-500 pb-2 flex justify-between items-center text-[10px] font-black uppercase text-yellow-600">
                <span>Renew This Week</span>
                <span className="bg-yellow-50 px-1.5 border border-yellow-300">{renewals.week.length}</span>
              </div>

              <div className="space-y-3">
                {renewals.week.map(item => (
                  <div key={item.vendor.id} className="bg-stone-50 border border-stone-200 p-3 flex justify-between items-center rounded-none text-[9px]">
                    <div>
                      <div className="font-sans font-black text-gray-900 uppercase">{item.vendor.name}</div>
                      <div className="text-gray-500 text-[8px] mt-0.5">Expires in: {item.daysRemaining} days</div>
                    </div>
                    <button type="button" onClick={() => handleRenewSubscription(item.vendor.id)} className="bg-[#FF5A00] text-white px-2 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer">Renew</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Expired & Grace Period */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
              <div className="border-b border-stone-500 pb-2 flex justify-between items-center text-[10px] font-black uppercase text-gray-700">
                <span>Grace Period & Expired</span>
                <span className="bg-stone-50 px-1.5 border border-stone-300">{(renewals.expired.length + renewals.grace.length)}</span>
              </div>

              <div className="space-y-3">
                {renewals.grace.map(item => (
                  <div key={item.vendor.id} className="bg-yellow-50/20 border border-yellow-300 p-3 flex justify-between items-center rounded-none text-[9px]">
                    <div>
                      <div className="font-sans font-black text-gray-900 uppercase">{item.vendor.name}</div>
                      <div className="text-yellow-600 font-bold text-[8px] uppercase mt-0.5">Grace active ({Math.abs(item.daysRemaining)}d past expiry)</div>
                    </div>
                    <button type="button" onClick={() => handleRenewSubscription(item.vendor.id)} className="bg-[#FF5A00] text-white px-2 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer">Renew</button>
                  </div>
                ))}

                {renewals.expired.map(item => (
                  <div key={item.vendor.id} className="bg-red-50/20 border border-red-300 p-3 flex justify-between items-center rounded-none text-[9px]">
                    <div>
                      <div className="font-sans font-black text-gray-900 uppercase">{item.vendor.name}</div>
                      <div className="text-red-600 font-bold text-[8px] uppercase mt-0.5">EXPIRED ({Math.abs(item.daysRemaining)}d ago)</div>
                    </div>
                    <button type="button" onClick={() => handleRenewSubscription(item.vendor.id)} className="bg-[#FF5A00] text-white px-2 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer">Renew</button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. UPGRADE CENTRE */}
      {activeTab === 'upgrades' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Input Selection form (Col span 1) */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm space-y-4">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
              
              <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
                <span>Migrate Agreement Plan</span>
              </div>

              <form onSubmit={handleUpgradeSubscription} className="space-y-4 text-[9px] font-bold text-gray-500">
                <div className="space-y-1">
                  <label className="uppercase">Select Target Vendor</label>
                  <select
                    value={upgradeVendorId}
                    onChange={(e) => setUpgradeVendorId(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 text-xs font-bold focus:outline-none uppercase cursor-pointer"
                  >
                    <option value="">-- SELECT VENDOR RECORD --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Select Target Plan</label>
                  <select
                    value={targetPlanId}
                    onChange={(e) => setTargetPlanId(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 text-xs font-bold focus:outline-none uppercase cursor-pointer"
                  >
                    <option value="">-- SELECT PRICING PLAN --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!upgradeVendorId || !targetPlanId}
                  className="w-full py-2 bg-[#FF5A00] text-white text-[10px] tracking-wider uppercase font-black hover:bg-[#1A1A1A] transition-colors cursor-pointer rounded-none disabled:bg-stone-100 disabled:text-stone-400"
                >
                  Initiate migration
                </button>
              </form>

            </div>

            {/* Migration preview (Col span 2) */}
            <div className="lg:col-span-2 bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
              
              <div className="border-b border-[#D1D1CF] pb-2.5 mb-4">
                <span className="text-[#FF5A00] font-black uppercase text-[10px] block">Agreement Migration Preview</span>
              </div>

              {upgradePreview ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[9px] uppercase font-bold text-gray-500">
                  <div className="bg-stone-50 border border-stone-250 p-4 space-y-1.5 text-center">
                    <span className="block text-[8px] text-gray-400">Current active quota</span>
                    <span className="text-gray-900 text-xs block">{upgradePreview.currentCapacity}</span>
                  </div>

                  <div className="bg-stone-50 border border-stone-250 p-4 space-y-1.5 text-center">
                    <span className="block text-[8px] text-gray-400">Target upgraded quota</span>
                    <span className="text-[#FF5A00] text-xs block">{upgradePreview.newCapacity}</span>
                  </div>

                  <div className="bg-orange-50/20 border border-orange-250 p-4 space-y-1.5 text-center text-[#FF5A00]">
                    <span className="block text-[8px] text-gray-400">Delta monthly rates</span>
                    <span className="text-xl font-sans font-black block">\\$${upgradePreview.deltaPrice}/mo</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 text-center text-gray-400 italic text-[10px] border border-dashed border-gray-300 font-bold uppercase">
                  Select target configurations in panel to preview contract calculations.
                </div>
              )}

              {/* Core standard workflow checklist */}
              <div className="mt-6 border-t border-[#FAF9F6] pt-4 font-mono text-[8px] text-gray-400 font-bold uppercase space-y-1">
                <div>Migration verification steps checklist:</div>
                <div className="text-gray-650 font-normal normal-case font-sans text-[10px] leading-relaxed">
                  <ul>
                    <li>1. System will evaluate current active terminal bindings against new quota parameters.</li>
                    <li>2. Approval card is routed to active operators dashboard queue for double-authorization signature.</li>
                    <li>3. Invoices are scheduled on the next billing date cycle.</li>
                  </ul>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 5. CAPACITY MARKETPLACE */}
      {activeTab === 'capacity' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commAddons.map(addon => (
              <div key={addon.id} className="bg-white border-2 border-[#1A1A1A] p-4 relative flex flex-col justify-between space-y-4 min-h-[160px]">
                
                <div className="space-y-1">
                  <div className="flex justify-between items-start text-[8px] font-bold text-gray-400">
                    <span>CODE: {addon.id}</span>
                    <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 uppercase font-black">{addon.status}</span>
                  </div>
                  <h4 className="font-sans font-black text-xs text-gray-900 uppercase tracking-wide mt-1">{addon.name}</h4>
                  <p className="text-[8px] text-gray-500 font-sans mt-0.5 normal-case font-medium">Increment slot parameters by {addon.metric}.</p>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-[9px] font-black uppercase">
                  <div>
                    <span className="text-[#FF5A00] font-mono text-sm block font-black">\\$${addon.price} <span className="text-[7.5px] text-gray-400 font-normal">/ mo</span></span>
                    <span className="text-gray-400 text-[7px] font-bold block mt-0.5">Sold count: {addon.soldCount} sold</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePurchaseAddon(addon.id)}
                    className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Purchase Slot
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 6. BUSINESS MODULE MARKETPLACE */}
      {activeTab === 'modules' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commModules.map(m => (
              <div key={m.code} className="bg-white border-2 border-[#1A1A1A] p-4 relative flex flex-col justify-between space-y-4 min-h-[180px]">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start text-[8px] font-bold text-gray-400">
                    <span>CODE: {m.code}</span>
                    <span className={`px-1.5 border py-0.2 text-[7px] font-black uppercase ${
                      m.status === 'Active' ? 'border-green-300 text-emerald-850 bg-green-50' : 'border-stone-300 text-stone-500 bg-stone-50'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-black font-sans text-gray-900 uppercase tracking-wide">{m.name}</h3>
                    <p className="text-[8.5px] text-gray-500 font-sans normal-case leading-relaxed font-medium">
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-[9px] font-black uppercase">
                  <div>
                    <span className="text-[#FF5A00] font-mono text-sm block font-black">\\$${m.price} <span className="text-[7.5px] text-gray-400 font-normal">/ mo</span></span>
                    <span className="text-gray-400 text-[7px] font-bold block mt-0.5">Activated vendors: {m.activatedCount} active</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleModule(m)}
                    className={`px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                      m.status === 'Active'
                        ? 'border-red-300 text-red-650 bg-red-50 hover:bg-red-600 hover:text-white hover:border-transparent'
                        : 'border-[#1A1A1A] bg-white hover:bg-emerald-600 hover:text-white hover:border-transparent'
                    }`}
                  >
                    {m.status === 'Active' ? 'Disable app' : 'Enable app'}
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 7. REVENUE FORECAST GRAPHICS */}
      {activeTab === 'forecast' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Forecast chart 1: MRR Projection */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
              <div className="border-b border-[#D1D1CF] pb-2 mb-4 text-[#FF5A00] font-black uppercase text-[10px]">
                <span>MRR Growth projection forecast</span>
              </div>
              <div className="h-48 w-full flex items-end justify-between font-mono text-[8px] font-bold text-gray-450 uppercase pt-4 border-b border-[#D1D1CF] pb-2">
                <div className="flex flex-col items-center space-y-1.5 w-12">
                  <div className="bg-orange-500 w-6 h-16" />
                  <span>Q1</span>
                </div>
                <div className="flex flex-col items-center space-y-1.5 w-12">
                  <div className="bg-orange-500 w-6 h-24" />
                  <span>Q2</span>
                </div>
                <div className="flex flex-col items-center space-y-1.5 w-12">
                  <div className="bg-[#FF5A00] w-6 h-36" />
                  <span>Q3 (PROJ)</span>
                </div>
                <div className="flex flex-col items-center space-y-1.5 w-12">
                  <div className="bg-stone-700 w-6 h-40" />
                  <span>Q4 (PROJ)</span>
                </div>
              </div>
              <span className="text-[7px] text-gray-400 font-bold uppercase mt-2 block">Monthly target projection based on average 8.4% churn index.</span>
            </div>

            {/* Forecast chart 2: Plan distribution */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
              <div className="border-b border-[#D1D1CF] pb-2 mb-4 text-[#FF5A00] font-black uppercase text-[10px]">
                <span>Plan Slab Distribution</span>
              </div>
              
              <div className="flex h-48 items-center justify-around font-mono text-[9px] uppercase font-bold text-gray-500">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 bg-orange-500" /><span>Starter POS: 52%</span></div>
                  <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 bg-emerald-600" /><span>Growth POS: 28%</span></div>
                  <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 bg-indigo-600" /><span>Pro / Enterprise: 20%</span></div>
                </div>
                <div className="w-24 h-24 rounded-full border-8 border-orange-500 flex items-center justify-center font-sans font-black text-gray-900 text-xs">
                  52%
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* CREATE SUB DIALOG */}
      {isCreateSubOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubscription} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative font-mono text-[#1A1A1A]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase border-b border-[#D1D1CF] pb-2">
              Create agreements Subscription
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Select Target Vendor</label>
                <select
                  value={createSubVendorId}
                  onChange={(e) => setCreateSubVendorId(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Select Pricing Plan</label>
                <select
                  value={createSubPlanId}
                  onChange={(e) => setCreateSubPlanId(e.target.value)}
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
                onClick={() => setIsCreateSubOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Create Agreement
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}