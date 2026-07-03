import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../App';
import { Plan } from '../types';
import { 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Sliders, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Bookmark,
  Cpu,
  Coins,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  price: number;
  metric: string;
  status: 'Active' | 'Inactive';
}

const DEFAULT_ADDONS: AddOn[] = [
  { id: 'ADD-BRANCH', name: 'Extra Branch Slot', price: 15, metric: '+1 branch node clearance', status: 'Active' },
  { id: 'ADD-TERMINAL', name: 'Extra Terminal Bind', price: 10, metric: '+1 iTredPOS terminal signature', status: 'Active' },
  { id: 'ADD-WAREHOUSE', name: 'Extra Warehouse Sync', price: 30, metric: '+1 physical fulfillment sync node', status: 'Active' },
  { id: 'ADD-DELIVERY', name: 'Extra Delivery Rider', price: 5, metric: '+1 active delivery dispatch tracker', status: 'Active' },
  { id: 'ADD-STORAGE', name: 'Extra Cloud Storage', price: 10, metric: '100GB cloud database cluster storage', status: 'Active' },
  { id: 'ADD-SMS', name: 'SMS Notify Bundle', price: 5, metric: '500 transaction SMS alerts / month', status: 'Active' },
  { id: 'ADD-WHATSAPP', name: 'WhatsApp Tunnel Bundle', price: 20, metric: '2000 messaging API queries / month', status: 'Active' },
  { id: 'ADD-API', name: 'Developer API Sandbox', price: 50, metric: 'Full query-read webhook endpoint suite', status: 'Active' }
];

export default function PlansPricingView() {
  const { 
    plans, 
    setPlans, 
    posLicenses, 
    workflows, 
    vendors,
    activeStaffSession,
    onAddWorkspaceAuditEvent,
    onAddWorkspaceActivity
  } = useLifecycle();

  // Load add-ons from localStorage or default list
  const [addons, setAddons] = useState<AddOn[]>(() => {
    const raw = localStorage.getItem('sci_capacity_addons');
    if (!raw) return DEFAULT_ADDONS;
    try {
      return JSON.parse(raw) as AddOn[];
    } catch {
      return DEFAULT_ADDONS;
    }
  });

  const saveAddons = (newAddons: AddOn[]) => {
    setAddons(newAddons);
    localStorage.setItem('sci_capacity_addons', JSON.stringify(newAddons));
  };

  // Modals Visibility
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddOn | null>(null);

  // Form Fields - Plan
  const [planId, setPlanId] = useState('');
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(0);
  const [planType, setPlanType] = useState<'POS' | 'App' | 'Hybrid'>('POS');
  const [planInterval, setPlanInterval] = useState<'Monthly' | 'Annual'>('Monthly');
  const [planMaxBranches, setPlanMaxBranches] = useState('1');
  const [planMaxTerminals, setPlanMaxTerminals] = useState('1');
  const [planMaxStaff, setPlanMaxStaff] = useState('3');
  const [planMaxProducts, setPlanMaxProducts] = useState('500');
  const [planEnabledApps, setPlanEnabledApps] = useState<string>('Core POS, Basic Inventory');

  // Form Fields - AddOn
  const [addonId, setAddonId] = useState('');
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState(0);
  const [addonMetric, setAddonMetric] = useState('');

  // Licensing Dashboard KPI Counts
  const kpis = useMemo(() => {
    const activePOS = posLicenses.filter((lic: any) => lic.status === 'Active').length;
    const demoLicenses = posLicenses.filter((lic: any) => lic.planName === 'Vendor Demo').length;
    const suspended = posLicenses.filter((lic: any) => lic.status === 'Suspended').length;
    const expired = posLicenses.filter((lic: any) => lic.status === 'Expired').length;
    
    const pendingActions = workflows.filter((w: any) => 
      (w.workflowType === 'pos_license' || w.workflowType === 'plan_assignment') && 
      (w.status === 'pending' || w.status === 'submitted')
    ).length;

    const awaitingLicense = vendors.filter((v: any) => !v.licenseKey).length;

    return { activePOS, demoLicenses, suspended, expired, pendingActions, awaitingLicense };
  }, [posLicenses, workflows, vendors]);

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;

    const nextPlan: Plan = {
      id: planId || `PLN-POS-${Date.now()}`,
      name: planName,
      type: planType,
      price: planPrice,
      interval: planInterval,
      activeVendors: editingPlan ? editingPlan.activeVendors : 0,
      enabledApps: planEnabledApps.split(',').map(app => app.trim()),
      maxBranches: planMaxBranches,
      maxTerminals: planMaxTerminals,
      maxStaff: planMaxStaff,
      maxProducts: planMaxProducts,
      status: editingPlan ? editingPlan.status : 'Active'
    };

    let updatedPlans: Plan[];
    if (editingPlan) {
      updatedPlans = plans.map(p => p.id === editingPlan.id ? nextPlan : p);
    } else {
      updatedPlans = [...plans, nextPlan];
    }

    setPlans(updatedPlans);
    localStorage.setItem('sgn_plans', JSON.stringify(updatedPlans));

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: editingPlan ? 'PLAN_EDIT' : 'PLAN_CREATE',
      targetType: 'plan',
      targetId: nextPlan.id,
      result: 'success',
      message: `${editingPlan ? 'Updated' : 'Created'} pricing tier config "${planName}".`
    });

    onAddWorkspaceActivity({
      workspaceId: 'licensing_centre',
      type: 'license',
      severity: 'success',
      title: editingPlan ? 'Plan Configurations Edited' : 'New Plan Tier Seeded',
      message: `Pricing configuration "${planName}" was successfully compiled.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    setIsPlanModalOpen(false);
    setEditingPlan(null);
  };

  const handleTogglePlanStatus = (plan: Plan) => {
    const nextStatus = plan.status === 'Active' ? 'Inactive' : 'Active';
    const updated = plans.map(p => p.id === plan.id ? { ...p, status: nextStatus } : p);
    setPlans(updated);
    localStorage.setItem('sgn_plans', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: nextStatus === 'Active' ? 'PLAN_ACTIVATE' : 'PLAN_DEACTIVATE',
      targetType: 'plan',
      targetId: plan.id,
      result: 'success',
      message: `Toggled subscription plan "${plan.name}" status to ${nextStatus}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'licensing_centre',
      type: 'license',
      severity: 'info',
      title: nextStatus === 'Active' ? 'Pricing Plan Activated' : 'Pricing Plan Suspended',
      message: `Tier plan "${plan.name}" operations are now ${nextStatus.toLowerCase()}.`,
      actorName: activeStaffSession?.fullName || 'System'
    });
  };

  const handleAddonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonName) return;

    const nextAddon: AddOn = {
      id: addonId || `ADD-${Date.now()}`,
      name: addonName,
      price: addonPrice,
      metric: addonMetric || 'Capacity clearance increase',
      status: editingAddon ? editingAddon.status : 'Active'
    };

    let updatedAddons: AddOn[];
    if (editingAddon) {
      updatedAddons = addons.map(a => a.id === editingAddon.id ? nextAddon : a);
    } else {
      updatedAddons = [...addons, nextAddon];
    }

    saveAddons(updatedAddons);

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: editingAddon ? 'ADDON_EDIT' : 'ADDON_CREATE',
      targetType: 'addon',
      targetId: nextAddon.id,
      result: 'success',
      message: `${editingAddon ? 'Updated' : 'Created'} capacity add-on tier "${addonName}".`
    });

    setIsAddonModalOpen(false);
    setEditingAddon(null);
  };

  const handleToggleAddonStatus = (addon: AddOn) => {
    const nextStatus = addon.status === 'Active' ? 'Inactive' : 'Active';
    const updated = addons.map(a => a.id === addon.id ? { ...a, status: nextStatus } : a);
    saveAddons(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: nextStatus === 'Active' ? 'ADDON_ACTIVATE' : 'ADDON_DEACTIVATE',
      targetType: 'addon',
      targetId: addon.id,
      result: 'success',
      message: `Toggled capacity add-on "${addon.name}" status to ${nextStatus}.`
    });
  };

  return (
    <div className="space-y-6 select-none font-mono text-[#1A1A1A]">
      
      {/* Header title */}
      <div className="border-b border-[#D1D1CF] pb-4 text-left">
        <h1 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] font-sans">
          Licensing Centre Workspace
        </h1>
        <p className="text-[10px] text-gray-500 font-medium font-sans">
          Manage pricing schemas, capacity quotas, business application licenses, and cryptographic activation bindings.
        </p>
      </div>

      {/* LICENSING DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Active POS Keys</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.activePOS}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Licensed terminals</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-orange-400" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Demo Licenses</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.demoLicenses}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Sandbox environments</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Suspended Keys</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.suspended}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Temporary blocks</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Expired Licenses</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.expired}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Past binding terms</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5A00]" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Pending Actions</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.pendingActions}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Awaiting compliance</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Awaiting License</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">${kpis.awaitingLicense}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Vendors pending key</span>
        </div>
      </div>

      {/* PLAN MANAGER & CAPACITY MANAGER SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        
        {/* PLATFORM PLANS MANAGER (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
            
            <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-2.5">
              <div className="flex items-center space-x-2 text-[#FF5A00] font-black uppercase text-[10px]">
                <Layers className="w-4 h-4" />
                <span>Platform Subscription Plans</span>
              </div>
              <button
                onClick={() => {
                  setPlanId('');
                  setPlanName('');
                  setPlanPrice(49);
                  setPlanType('POS');
                  setPlanInterval('Monthly');
                  setPlanMaxBranches('1');
                  setPlanMaxTerminals('1');
                  setPlanMaxStaff('3');
                  setPlanMaxProducts('500');
                  setPlanEnabledApps('Core POS, Basic Inventory');
                  setEditingPlan(null);
                  setIsPlanModalOpen(true);
                }}
                className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white transition-all px-2.5 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer"
              >
                Create Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map(p => (
                <div key={p.id} className="border-2 border-[#1A1A1A] bg-white p-4 relative flex flex-col justify-between space-y-4 min-h-[220px]">
                  
                  {/* Title and pricing tag */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-sans font-black text-xs text-gray-900 uppercase tracking-wide">{p.name}</h4>
                      <span className={`text-[8px] font-black px-1.5 border ${
                        p.status === 'Active' ? 'border-green-300 text-emerald-800 bg-emerald-50' : 'border-stone-300 text-stone-600 bg-stone-50'
                      }`}>
                        {p.status || 'Active'}
                      </span>
                    </div>
                    <div className="text-[#FF5A00] font-black text-sm font-mono">$${p.price} <span className="text-[8px] text-gray-400 font-medium lowercase">/ ${p.interval || 'month'}</span></div>
                  </div>

                  {/* Limits Checklist */}
                  <div className="grid grid-cols-2 gap-2 text-[8px] font-bold text-gray-500 uppercase border-y border-stone-100 py-2">
                    <div>Branches: <span className="text-gray-800 font-black font-sans">{p.maxBranches}</span></div>
                    <div>Terminals: <span className="text-gray-800 font-black font-sans">{p.maxTerminals}</span></div>
                    <div>Staff: <span className="text-gray-800 font-black font-sans">{p.maxStaff}</span></div>
                    <div>Products: <span className="text-gray-800 font-black font-sans">{p.maxProducts}</span></div>
                  </div>

                  {/* Included Apps */}
                  <div className="space-y-1">
                    <span className="text-gray-400 block text-[7px] uppercase font-black">Included Modules:</span>
                    <div className="flex flex-wrap gap-1">
                      {p.enabledApps?.map(app => (
                        <span key={app} className="bg-stone-50 text-stone-600 border border-stone-200 px-1 py-0.2 text-[7px] font-bold uppercase">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions buttons footer */}
                  <div className="flex justify-between items-center border-t border-stone-100 pt-3">
                    <span className="text-[7px] text-gray-400 font-bold font-mono uppercase">VENDORS: {p.activeVendors || 0} active</span>
                    
                    <div className="flex space-x-1.5 text-[8px] font-black uppercase">
                      <button
                        onClick={() => {
                          setPlanId(p.id);
                          setPlanName(p.name);
                          setPlanPrice(p.price);
                          setPlanType(p.type);
                          setPlanInterval(p.interval || 'Monthly');
                          setPlanMaxBranches(p.maxBranches || '1');
                          setPlanMaxTerminals(p.maxTerminals || '1');
                          setPlanMaxStaff(p.maxStaff || '3');
                          setPlanMaxProducts(p.maxProducts || '500');
                          setPlanEnabledApps(p.enabledApps?.join(', ') || 'Core POS');
                          setEditingPlan(p);
                          setIsPlanModalOpen(true);
                        }}
                        className="text-stone-700 hover:text-black cursor-pointer underline font-bold"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleTogglePlanStatus(p)}
                        className={`cursor-pointer font-bold underline ${
                          p.status === 'Active' ? 'text-red-600 hover:text-red-700' : 'text-emerald-700 hover:text-emerald-800'
                        }`}
                      >
                        {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

        {/* CAPACITY LICENSING ADD-ONS (Col span 1) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
            
            <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-2.5">
              <div className="flex items-center space-x-2 text-[#FF5A00] font-black uppercase text-[10px]">
                <Cpu className="w-4 h-4 animate-pulse text-[#FF5A00]" />
                <span>Capacity Add-ons</span>
              </div>
              <button
                onClick={() => {
                  setAddonId('');
                  setAddonName('');
                  setAddonPrice(10);
                  setAddonMetric('');
                  setEditingAddon(null);
                  setIsAddonModalOpen(true);
                }}
                className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white transition-all px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
              >
                Add Option
              </button>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {addons.map(addon => (
                <div key={addon.id} className="bg-[#FAF9F6] border border-stone-250 p-3 flex justify-between items-start rounded-none">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] font-black text-gray-800 uppercase">{addon.name}</span>
                      <span className={`text-[6px] font-black px-1 border ${
                        addon.status === 'Active' ? 'border-green-300 text-emerald-850 bg-green-50' : 'border-stone-300 text-stone-500 bg-stone-50'
                      }`}>
                        {addon.status}
                      </span>
                    </div>
                    <span className="text-[7.5px] text-gray-500 block normal-case font-sans mt-0.5 leading-tight">{addon.metric}</span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[#FF5A00] font-black block text-[10px] font-mono">$${addon.price}/mo</span>
                    <div className="flex space-x-1.5 text-[7px] font-black uppercase justify-end pt-1">
                      <button
                        onClick={() => {
                          setAddonId(addon.id);
                          setAddonName(addon.name);
                          setAddonPrice(addon.price);
                          setAddonMetric(addon.metric);
                          setEditingAddon(addon);
                          setIsAddonModalOpen(true);
                        }}
                        className="text-stone-700 hover:text-black cursor-pointer underline font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleAddonStatus(addon)}
                        className={`cursor-pointer font-bold underline ${
                          addon.status === 'Active' ? 'text-red-500 hover:text-red-700' : 'text-emerald-700 hover:text-emerald-800'
                        }`}
                      >
                        {addon.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* MODALS */}

      {/* PLAN CREATE / EDIT MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handlePlanSubmit} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase text-[#1A1A1A] border-b border-[#D1D1CF] pb-2">
              {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Plan Reference ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingPlan}
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  placeholder="e.g. PLN-POS-STARTER"
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] text-xs font-bold uppercase disabled:bg-gray-100 disabled:text-gray-450"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Plan Type</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as any)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="POS">POS Terminal Only</option>
                    <option value="App">Business Modules Only</option>
                    <option value="Hybrid">Hybrid Bundle</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Billing Cycle</label>
                  <select
                    value={planInterval}
                    onChange={(e) => setPlanInterval(e.target.value as any)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1 col-span-1">
                  <label className="uppercase block truncate">Branches</label>
                  <input
                    type="text"
                    value={planMaxBranches}
                    onChange={(e) => setPlanMaxBranches(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="uppercase block truncate">Terminals</label>
                  <input
                    type="text"
                    value={planMaxTerminals}
                    onChange={(e) => setPlanMaxTerminals(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="uppercase block truncate">Staff</label>
                  <input
                    type="text"
                    value={planMaxStaff}
                    onChange={(e) => setPlanMaxStaff(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="uppercase block truncate">Products</label>
                  <input
                    type="text"
                    value={planMaxProducts}
                    onChange={(e) => setPlanMaxProducts(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[8px]">Enabled Modules (Comma separated)</label>
                <input
                  type="text"
                  value={planEnabledApps}
                  onChange={(e) => setPlanEnabledApps(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold uppercase font-mono"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Save Pricing Tier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADDON CREATE / EDIT MODAL */}
      {isAddonModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleAddonSubmit} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase text-[#1A1A1A] border-b border-[#D1D1CF] pb-2">
              {editingAddon ? 'Edit Capacity Add-on' : 'Create Capacity Add-on'}
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Add-on ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingAddon}
                  value={addonId}
                  onChange={(e) => setAddonId(e.target.value)}
                  placeholder="e.g. ADD-BRANCH"
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase disabled:bg-gray-100 disabled:text-gray-450"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Add-on Name</label>
                  <input
                    type="text"
                    required
                    value={addonName}
                    onChange={(e) => setAddonName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Monthly Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={addonPrice}
                    onChange={(e) => setAddonPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Metric description</label>
                <input
                  type="text"
                  required
                  value={addonMetric}
                  onChange={(e) => setAddonMetric(e.target.value)}
                  placeholder="e.g. +1 branch slot configuration"
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsAddonModalOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Save Add-on
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}