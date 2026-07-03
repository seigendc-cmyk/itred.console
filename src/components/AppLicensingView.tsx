import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../App';
import { Cpu, Plus, Sparkles, Check, X, Edit, Sliders } from 'lucide-react';

interface BusinessModule {
  code: string;
  name: string;
  price: number;
  status: 'Active' | 'Inactive';
  description: string;
}

const DEFAULT_MODULES: BusinessModule[] = [
  { code: 'ITRED-POS', name: 'iTredPOS', price: 49, status: 'Active', description: 'Enterprise core point-of-sale terminal node operations.' },
  { code: 'VND-DISC', name: 'Vendor Discovery', price: 29, status: 'Active', description: 'Merchant onboarding directories and platform profiles search.' },
  { code: 'IDELIVER', name: 'iDeliver', price: 39, status: 'Active', description: 'Fulfillment dispatcher and rider tracking gateway integration.' },
  { code: 'CASHPLAN', name: 'CashPlan', price: 59, status: 'Inactive', description: 'Corporate treasury cash forecasting and cashflow analytics.' },
  { code: 'POOLWISE', name: 'PoolWise', price: 79, status: 'Inactive', description: 'Cross-vendor cooperative stock sharing and inventory pooling.' },
  { code: 'EXEC-BI', name: 'Executive BI', price: 99, status: 'Active', description: 'Predictive management dashboards and AI visual analytics.' },
  { code: 'AI-ASSIST', name: 'AI Assistant', price: 49, status: 'Active', description: 'Natural language chat query operations for core inventories.' },
  { code: 'CRM', name: 'CRM & Loyalty', price: 39, status: 'Active', description: 'Customer profiles, rewards ledger, and points campaign engine.' },
  { code: 'PROCUREMENT', name: 'Procurement', price: 69, status: 'Inactive', description: 'Automated purchasing order templates and vendor quotation logs.' },
  { code: 'CONSIGNMENT', name: 'Consignment', price: 89, status: 'Inactive', description: 'Third-party stock consignment tracking and revenue sharing.' },
  { code: 'FIELDSALES', name: 'Field Sales', price: 49, status: 'Inactive', description: 'Simulated field sales terminal with offline-first local cache.' },
  { code: 'ASSET-MGMT', name: 'Asset Management', price: 39, status: 'Inactive', description: 'Hardware terminal tracking and serial registration databases.' },
  { code: 'PAYROLL', name: 'Payroll & HR', price: 59, status: 'Inactive', description: 'Timecard logging, operators commissions, and payroll processing.' },
  { code: 'ACCT-CONN', name: 'Accounting Connector', price: 29, status: 'Inactive', description: 'Double-entry ledger auto-sync to external bookkeeping.' },
  { code: 'API-ACCESS', name: 'API Access Gateway', price: 99, status: 'Active', description: 'Uplink webhook routing and raw read/write access tunnels.' }
];

export default function AppLicensingView() {
  const { 
    activeStaffSession, 
    onAddWorkspaceAuditEvent, 
    onAddWorkspaceActivity 
  } = useLifecycle();

  const [modules, setModules] = useState<BusinessModule[]>(() => {
    const raw = localStorage.getItem('sci_business_modules');
    if (!raw) return DEFAULT_MODULES;
    try {
      return JSON.parse(raw) as BusinessModule[];
    } catch {
      return DEFAULT_MODULES;
    }
  });

  const saveModules = (newModules: BusinessModule[]) => {
    setModules(newModules);
    localStorage.setItem('sci_business_modules', JSON.stringify(newModules));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals / Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<BusinessModule | null>(null);

  const [formPrice, setFormPrice] = useState(0);
  const [formDesc, setFormDesc] = useState('');

  const handleEditModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;

    const updated = modules.map(m => {
      if (m.code === editingModule.code) {
        return {
          ...m,
          price: formPrice,
          description: formDesc
        };
      }
      return m;
    });

    saveModules(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'APP_LICENSE_EDIT',
      targetType: 'module',
      targetId: editingModule.code,
      result: 'success',
      message: `Updated pricing rates for business module "${editingModule.name}".`
    });

    setIsEditModalOpen(false);
    setEditingModule(null);
  };

  const handleToggleStatus = (module: BusinessModule) => {
    const nextStatus = module.status === 'Active' ? 'Inactive' : 'Active';
    const updated = modules.map(m => m.code === module.code ? { ...m, status: nextStatus } : m);
    saveModules(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'licensing_centre',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: nextStatus === 'Active' ? 'APP_LICENSE_ACTIVATE' : 'APP_LICENSE_DEACTIVATE',
      targetType: 'module',
      targetId: module.code,
      result: 'success',
      message: `Toggled business module "${module.name}" authorization to ${nextStatus}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'licensing_centre',
      type: 'license',
      severity: 'info',
      title: nextStatus === 'Active' ? 'App Module Enabled' : 'App Module Disabled',
      message: `App module "${module.name}" has been ${nextStatus.toLowerCase()}d.`,
      actorName: activeStaffSession?.fullName || 'System'
    });
  };

  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [modules, searchQuery, filterStatus]);

  return (
    <div className="space-y-6 select-none font-mono text-[#1A1A1A]">
      
      {/* Header and description */}
      <div className="border-b border-[#D1D1CF] pb-4 text-left">
        <h1 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] font-sans">
          Business Modules Marketplace
        </h1>
        <p className="text-[10px] text-gray-500 font-medium font-sans">
          Activate and manage additional business applications, local integrations, and supplemental plugin modules.
        </p>
      </div>

      {/* Intro box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <div className="bg-white border-2 border-[#1A1A1A] p-4 font-mono text-xs col-span-2">
          <div className="font-bold text-[#1A1A1A] uppercase mb-1">INTEGRATOR ENGINE KEYRING</div>
          <div className="text-gray-500 leading-relaxed font-sans normal-case text-[10px] font-medium">
            Plugins and applications connected to the <strong>seiGEN App Store</strong> utilize these tokens for secure communications. Inter-service permissions are verified against these license rows at each network cycle.
          </div>
        </div>
        <div className="bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] p-4 font-mono text-xs flex flex-col justify-between">
          <div className="flex items-center space-x-1.5 text-[#FF5A00] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTEGRATION SANDBOX</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-sans normal-case font-medium">
            All integrations default to sandbox rate-limiting (max 10 API requests/sec) until custom SLA plan clearance is granted.
          </p>
        </div>
      </div>

      {/* Toolbar Search & Filters */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row gap-3 text-left">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules, description..."
            className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase tracking-wider"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-gray-500 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border-2 border-[#1A1A1A] p-1.5 text-[9px] font-black focus:outline-none uppercase cursor-pointer rounded-none"
          >
            <option value="all">All Modules</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid list of marketplace modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filteredModules.map(m => (
          <div key={m.code} className="bg-white border-2 border-[#1A1A1A] p-4 relative flex flex-col justify-between space-y-4 min-h-[180px]">
            
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-mono text-gray-400 font-bold uppercase">{m.code}</span>
                <span className={`text-[7px] font-black px-1.5 border ${
                  m.status === 'Active' ? 'border-green-300 text-emerald-800 bg-emerald-50' : 'border-stone-300 text-stone-600 bg-stone-50'
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
              <span className="text-[#FF5A00] font-mono font-bold">$${m.price}/mo</span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingModule(m);
                    setFormPrice(m.price);
                    setFormDesc(m.description);
                    setIsEditModalOpen(true);
                  }}
                  className="text-stone-700 hover:text-black cursor-pointer underline font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(m)}
                  className={`cursor-pointer font-bold underline ${
                    m.status === 'Active' ? 'text-red-650 hover:text-red-700' : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                >
                  {m.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleEditModule} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase text-[#1A1A1A] border-b border-[#D1D1CF] pb-2">
              Configure Module Rates
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Module Name</label>
                <input
                  type="text"
                  disabled
                  value={editingModule?.name || ''}
                  className="w-full bg-gray-100 border border-[#D1D1CF] p-2 text-xs font-bold uppercase text-gray-500"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Monthly Rate (USD)</label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">SLA description</label>
                <textarea
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs h-16 font-bold uppercase resize-none leading-normal"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingModule(null);
                }}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Save configurations
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}