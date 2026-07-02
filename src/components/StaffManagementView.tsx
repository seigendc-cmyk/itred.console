import React, { useState } from 'react';
import { 
  Users, 
  Terminal, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Check, 
  X, 
  ChevronRight, 
  Info, 
  Lock, 
  UserPlus, 
  Tv, 
  LayoutDashboard,
  Server,
  Activity,
  Layers
} from 'lucide-react';
import { StaffMember, StaffDesk, MenuFeature } from '../types';

interface StaffManagementViewProps {
  staffMembers: StaffMember[];
  onUpdateStaffMembers: (staff: StaffMember[]) => void;
  staffDesks: StaffDesk[];
  onUpdateStaffDesks: (desks: StaffDesk[]) => void;
  menuFeatures: MenuFeature[];
  currentAdmin: any;
}

export default function StaffManagementView({
  staffMembers,
  onUpdateStaffMembers,
  staffDesks,
  onUpdateStaffDesks,
  menuFeatures,
  currentAdmin
}: StaffManagementViewProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffMembers[0]?.id || '');
  
  // Drawer states
  const [isStaffDrawerOpen, setIsStaffDrawerOpen] = useState(false);
  const [isDeskDrawerOpen, setIsDeskDrawerOpen] = useState(false);

  // Editing states
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editingDeskId, setEditingDeskId] = useState<string | null>(null);

  // Staff Form Fields
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('POS Cashier');
  const [staffStatus, setStaffStatus] = useState<StaffMember['status']>('Active');
  const [staffDeskId, setStaffDeskId] = useState('');
  const [staffEmpAccess, setStaffEmpAccess] = useState(false);
  const [staffWelcome, setStaffWelcome] = useState('');

  // Desk Form Fields
  const [deskName, setDeskName] = useState('');
  const [deskStatus, setDeskStatus] = useState<StaffDesk['status']>('Active');
  const [deskIp, setDeskIp] = useState('10.0.1.10');
  const [deskLocation, setDeskLocation] = useState('HQ Floor 1');
  const [deskMenuAccess, setDeskMenuAccess] = useState<string[]>([]);

  // Inline Employee Creator Form Fields (for simulation inside selected staff view)
  const [inlineName, setInlineName] = useState('');
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineRole, setInlineRole] = useState('POS Cashier');
  const [inlineDeskId, setInlineDeskId] = useState(staffDesks[0]?.id || '');
  const [inlineEmpAccess, setInlineEmpAccess] = useState(false);
  const [inlineWelcome, setInlineWelcome] = useState('');

  const selectedStaff = staffMembers.find(s => s.id === selectedStaffId);
  const selectedDesk = staffDesks.find(d => d.id === selectedStaff?.deskId);

  // Form Handlers
  const handleOpenStaffCreate = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffRole('POS Cashier');
    setStaffStatus('Active');
    setStaffDeskId(staffDesks[0]?.id || '');
    setStaffEmpAccess(false);
    setStaffWelcome('');
    setIsStaffDrawerOpen(true);
  };

  const handleOpenStaffEdit = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setStaffName(staff.name);
    setStaffEmail(staff.email);
    setStaffRole(staff.role);
    setStaffStatus(staff.status);
    setStaffDeskId(staff.deskId);
    setStaffEmpAccess(staff.hasEmployeeCreationAccess);
    setStaffWelcome(staff.welcomeMessage || '');
    setIsStaffDrawerOpen(true);
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) return;

    if (editingStaffId) {
      const updated = staffMembers.map(s => 
        s.id === editingStaffId 
          ? { 
              ...s, 
              name: staffName, 
              email: staffEmail, 
              role: staffRole, 
              status: staffStatus, 
              deskId: staffDeskId, 
              hasEmployeeCreationAccess: staffEmpAccess,
              welcomeMessage: staffWelcome 
            } 
          : s
      );
      onUpdateStaffMembers(updated);
    } else {
      const newId = `STF-${Math.floor(100 + Math.random() * 900)}`;
      const newMember: StaffMember = {
        id: newId,
        name: staffName,
        email: staffEmail,
        role: staffRole,
        status: staffStatus,
        deskId: staffDeskId,
        hasEmployeeCreationAccess: staffEmpAccess,
        welcomeMessage: staffWelcome
      };
      onUpdateStaffMembers([...staffMembers, newMember]);
      if (!selectedStaffId) setSelectedStaffId(newId);
    }
    setIsStaffDrawerOpen(false);
  };

  const handleStaffDelete = (id: string) => {
    if (staffMembers.length <= 1) {
      alert("Error: You must keep at least one active administrator in the ledger.");
      return;
    }
    if (confirm("Are you sure you want to purge this staff member? This deletes their credentials registry.")) {
      const filtered = staffMembers.filter(s => s.id !== id);
      onUpdateStaffMembers(filtered);
      if (selectedStaffId === id) {
        setSelectedStaffId(filtered[0]?.id || '');
      }
    }
  };

  // Desk Handlers
  const handleOpenDeskCreate = () => {
    setEditingDeskId(null);
    setDeskName('');
    setDeskStatus('Active');
    setDeskIp(`10.0.1.${Math.floor(10 + Math.random() * 240)}`);
    setDeskLocation('HQ Suite B');
    setDeskMenuAccess(['dashboard']);
    setIsDeskDrawerOpen(true);
  };

  const handleOpenDeskEdit = (desk: StaffDesk) => {
    setEditingDeskId(desk.id);
    setDeskName(desk.name);
    setDeskStatus(desk.status);
    setDeskIp(desk.ipAddress);
    setDeskLocation(desk.location);
    setDeskMenuAccess(desk.menuAccessIds);
    setIsDeskDrawerOpen(true);
  };

  const handleDeskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deskName.trim()) return;

    if (editingDeskId) {
      const updated = staffDesks.map(d => 
        d.id === editingDeskId 
          ? { 
              ...d, 
              name: deskName, 
              status: deskStatus, 
              ipAddress: deskIp, 
              location: deskLocation, 
              menuAccessIds: deskMenuAccess 
            } 
          : d
      );
      onUpdateStaffDesks(updated);
    } else {
      const newId = `DESK-${Math.floor(100 + Math.random() * 900)}`;
      const newDesk: StaffDesk = {
        id: newId,
        name: deskName,
        status: deskStatus,
        ipAddress: deskIp,
        location: deskLocation,
        menuAccessIds: deskMenuAccess
      };
      onUpdateStaffDesks([...staffDesks, newDesk]);
    }
    setIsDeskDrawerOpen(false);
  };

  const handleDeskDelete = (id: string) => {
    if (staffDesks.length <= 1) {
      alert("Error: You must keep at least one routing desk configuration.");
      return;
    }
    if (staffMembers.some(s => s.deskId === id)) {
      alert("Error: Cannot delete desk. There are staff members actively bound to this desk node.");
      return;
    }
    if (confirm("Are you sure you want to delete this desk node? All mapped IP gateways will clear.")) {
      onUpdateStaffDesks(staffDesks.filter(d => d.id !== id));
    }
  };

  const handleToggleMenuAccess = (featId: string) => {
    if (deskMenuAccess.includes(featId)) {
      setDeskMenuAccess(deskMenuAccess.filter(id => id !== featId));
    } else {
      setDeskMenuAccess([...deskMenuAccess, featId]);
    }
  };

  // Inline Employee Creator (Simulating employee creation privilege)
  const handleInlineCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim() || !inlineEmail.trim()) return;

    const newId = `STF-${Math.floor(100 + Math.random() * 900)}`;
    const newMember: StaffMember = {
      id: newId,
      name: inlineName,
      email: inlineEmail,
      role: inlineRole,
      status: 'Active',
      deskId: inlineDeskId,
      hasEmployeeCreationAccess: inlineEmpAccess,
      welcomeMessage: inlineWelcome || `Welcome employee ${inlineName} configured by ${selectedStaff?.name}.`
    };

    onUpdateStaffMembers([...staffMembers, newMember]);
    
    // Clear form
    setInlineName('');
    setInlineEmail('');
    setInlineRole('POS Cashier');
    setInlineEmpAccess(false);
    setInlineWelcome('');
    
    alert(`Success: "${inlineName}" registered successfully as a new employee by ${selectedStaff?.name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white border-4 border-[#1A1A1A] p-6 shadow-md relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[#FF5A00] text-[10px] font-mono font-bold uppercase tracking-widest">
              <Users className="w-4 h-4" />
              <span>IDENTITY GATEWAY & ROLE CONTROL</span>
            </div>
            <h1 className="text-xl font-bold uppercase text-[#1A1A1A] tracking-tight">
              Staff Desks & Credentials Ledger
            </h1>
            <p className="text-xs text-gray-500 max-w-2xl font-sans leading-relaxed">
              Provision administrative staff profiles, configure hardware desks, and assign menu access tree lists. Select employees to preview their workspace permissions.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleOpenStaffCreate}
              className="bg-[#1A1A1A] hover:bg-[#FF5A00] text-white py-2.5 px-4 uppercase font-bold text-xs tracking-wider transition-all rounded-none flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Staff Member</span>
            </button>
            <button
              onClick={handleOpenDeskCreate}
              className="bg-white border border-[#D1D1CF] hover:border-[#1A1A1A] text-gray-700 py-2.5 px-4 uppercase font-bold text-xs tracking-wider transition-all rounded-none flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Server className="w-4 h-4" />
              <span>Create Desk Node</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid split: Lists & Console Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Lists */}
        <div className="lg:col-span-1 space-y-6">
          {/* Staff Members List */}
          <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
            <div className="p-3 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#1A1A1A] uppercase tracking-wider text-xs flex justify-between items-center font-mono">
              <span>Staff Ledger ({staffMembers.length})</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y divide-[#D1D1CF] max-h-[300px] overflow-y-auto font-mono text-xs">
              {staffMembers.map(member => {
                const isSelected = member.id === selectedStaffId;
                return (
                  <div 
                    key={member.id} 
                    onClick={() => setSelectedStaffId(member.id)}
                    className={`p-3 cursor-pointer flex justify-between items-center transition-all ${
                      isSelected ? 'bg-orange-50/35 border-l-4 border-l-[#FF5A00] font-bold' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div>
                      <div className="text-[#1A1A1A] uppercase">{member.name}</div>
                      <div className="text-[10px] text-gray-400 font-sans">{member.role} • {member.email}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenStaffEdit(member)}
                        className="text-gray-500 hover:text-black"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStaffDelete(member.id)}
                        className="text-gray-400 hover:text-red-650"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desks List */}
          <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
            <div className="p-3 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#1A1A1A] uppercase tracking-wider text-xs flex justify-between items-center font-mono">
              <span>Desks Nodes ({staffDesks.length})</span>
              <Server className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y divide-[#D1D1CF] max-h-[300px] overflow-y-auto font-mono text-xs">
              {staffDesks.map(desk => (
                <div 
                  key={desk.id} 
                  className="p-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <div className="text-[#1A1A1A] uppercase font-bold">{desk.name}</div>
                    <div className="text-[10px] text-gray-400">ID: {desk.id} • IP: {desk.ipAddress} • {desk.location}</div>
                    <div className="text-[9px] text-[#FF5A00] uppercase font-bold mt-0.5">
                      Tree Paths: {desk.menuAccessIds.length} Mapped
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleOpenDeskEdit(desk)}
                      className="text-gray-500 hover:text-black"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeskDelete(desk.id)}
                      className="text-gray-400 hover:text-red-650"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Workspace Simulator */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStaff ? (
            <div className="bg-white border-4 border-[#1A1A1A] shadow-md p-6 space-y-6">
              
              {/* Simulator Header */}
              <div className="border-b border-[#D1D1CF] pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[#FF5A00] text-[9px] font-mono font-bold uppercase tracking-widest">
                    <Tv className="w-4 h-4 animate-pulse" />
                    <span>Workspace Simulator Node</span>
                  </div>
                  <h2 className="text-lg font-sans font-black text-[#1A1A1A] uppercase tracking-tight">
                    {selectedStaff.name} ({selectedStaff.id})
                  </h2>
                  <p className="text-xs text-gray-500 font-mono">ROLE CLEARANCE: {selectedStaff.role.toUpperCase()}</p>
                </div>
                
                <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                  selectedStaff.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                  selectedStaff.status === 'Standby' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {selectedStaff.status}
                </span>
              </div>

              {/* Mapped Desk node parameters */}
              <div className="bg-gray-50 border border-[#D1D1CF] p-4 font-mono text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 text-[10px] font-bold text-gray-400 border-b pb-1 uppercase">
                  BOUND PHYSICAL DESK ACCESS PROFILE
                </div>
                {selectedDesk ? (
                  <>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Desk Console ID</span>
                      <div className="font-bold text-gray-800">{selectedDesk.name} ({selectedDesk.id})</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">IP Address Router</span>
                      <div className="font-bold text-gray-800">{selectedDesk.ipAddress}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Terminal Location</span>
                      <div className="font-bold text-gray-800">{selectedDesk.location}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Clearance Status</span>
                      <div className="font-bold text-green-600 uppercase">{selectedDesk.status}</div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 text-red-600 italic">
                    ⚠ Warning: No physical desk bind found. Employee cannot clear session routes.
                  </div>
                )}
              </div>

              {/* 1. Dynamic Dashboard Preview */}
              <div className="bg-[#1A1A1A] text-white p-5 border border-stone-850 relative">
                <div className="absolute top-0 right-0 p-2 text-[#FF5A00]">
                  <LayoutDashboard className="w-6.5 h-6.5 opacity-20" />
                </div>
                <div className="text-[9px] font-mono text-[#FF5A00] font-bold uppercase tracking-wider">
                  Live Dashboard Preview
                </div>
                <h3 className="text-sm font-sans font-bold mt-1 text-white">
                  {selectedStaff.welcomeMessage || `Welcome back, ${selectedStaff.name}.`}
                </h3>
                <p className="text-[11px] text-gray-400 mt-2 font-mono">
                  Clearance Level: {selectedStaff.role} • Desk Gate: {selectedDesk?.name || 'Unbound'}
                </p>
              </div>

              {/* 2. Menu Access Tree allowed */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#1A1A1A] uppercase border-b border-[#D1D1CF] pb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#FF5A00]" />
                  Active Menu Tree Access
                </h4>
                {selectedDesk && selectedDesk.menuAccessIds.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {menuFeatures.filter(f => selectedDesk.menuAccessIds.includes(f.id)).map(feat => (
                      <div key={feat.id} className="p-2 border border-gray-200 bg-gray-50 flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-[#1A1A1A]">{feat.label}</div>
                          <div className="text-[9px] text-gray-400 uppercase font-semibold">id: {feat.id}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-red-300 text-red-700 bg-red-50 text-xs italic font-mono text-center">
                    ⚠ Warning: No menu permissions configured on desk. Employee locked out of all console paths.
                  </div>
                )}
              </div>

              {/* 3. Inline Employee Creator Panel */}
              <div className="border-t border-[#D1D1CF] pt-6 space-y-4">
                <h4 className="text-xs font-mono font-bold text-[#1A1A1A] uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF5A00]" />
                  Delegated Employee Registry Panel
                </h4>
                
                {selectedStaff.hasEmployeeCreationAccess ? (
                  <form onSubmit={handleInlineCreateEmployee} className="bg-orange-50/15 border-2 border-[#FF5A00]/20 p-5 space-y-4 font-mono text-xs">
                    <div className="text-[10px] text-orange-950 font-bold border-b border-[#FF5A00]/25 pb-1 flex justify-between items-center">
                      <span>SIGN NEW WORKER REGISTER</span>
                      <span className="text-[#FF5A00] uppercase text-[9px] font-black">Authorized: {selectedStaff.role}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase">Employee Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Elena Rostova"
                          value={inlineName}
                          onChange={(e) => setInlineName(e.target.value)}
                          className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase">Employee Email</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. elena@itred.seigen"
                          value={inlineEmail}
                          onChange={(e) => setInlineEmail(e.target.value)}
                          className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase">Role Duty</label>
                        <select
                          value={inlineRole}
                          onChange={(e) => setInlineRole(e.target.value)}
                          className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                        >
                          <option value="POS Cashier">POS Cashier</option>
                          <option value="Store Manager">Store Manager</option>
                          <option value="Compliance Auditor">Compliance Auditor</option>
                          <option value="Operations Assistant">Operations Assistant</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase">Assigned Desk Console</label>
                        <select
                          value={inlineDeskId}
                          onChange={(e) => setInlineDeskId(e.target.value)}
                          className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                        >
                          {staffDesks.map(desk => (
                            <option key={desk.id} value={desk.id}>
                              {desk.name} ({desk.id})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 flex items-center space-x-2 pt-1.5 select-none">
                        <input
                          type="checkbox"
                          id="inline_emp_access"
                          checked={inlineEmpAccess}
                          onChange={(e) => setInlineEmpAccess(e.target.checked)}
                          className="text-[#FF5A00] focus:ring-[#FF5A00]"
                        />
                        <label htmlFor="inline_emp_access" className="text-[10px] text-gray-700 uppercase font-bold cursor-pointer">
                          Grant Employee Creation Privileges (Recursive Clearance)
                        </label>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase">Welcome Message</label>
                        <input
                          type="text"
                          placeholder="e.g. Console terminal ready. Compliance audits active."
                          value={inlineWelcome}
                          onChange={(e) => setInlineWelcome(e.target.value)}
                          className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1A1A1A] hover:bg-[#FF5A00] text-white p-2.5 uppercase font-bold tracking-wider transition-colors text-[10px] cursor-pointer"
                    >
                      Register Employee Node
                    </button>
                  </form>
                ) : (
                  <div className="border border-stone-200 bg-stone-50 p-4 font-mono text-[11px] text-stone-500 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-stone-400 shrink-0 animate-pulse" />
                    <span>Employee creation keys locked for this security clearance level.</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border-2 border-[#1A1A1A] p-12 text-center text-gray-400 italic text-xs font-mono uppercase">
              No staff member selected. Select an employee from the ledger list to mount their workspace.
            </div>
          )}
        </div>

      </div>

      {/* ==========================================================================
         STAFF DRAWER
         ========================================================================== */}
      {isStaffDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-end z-50 font-mono text-xs">
          <div className="absolute inset-0" onClick={() => setIsStaffDrawerOpen(false)} />
          <div className="bg-white border-l-4 border-[#1A1A1A] w-full max-w-md h-full relative z-10 flex flex-col justify-between shadow-2xl p-6 animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#FF5A00]" />
                  <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">
                    {editingStaffId ? 'MODIFY STAFF MEMBER' : 'INITIALIZE STAFF MEMBER'}
                  </h2>
                </div>
                <button onClick={() => setIsStaffDrawerOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStaffSubmit} className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Vance"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vance@itred.seigen"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Role Duty</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  >
                    <option value="Lead SysOp">Lead SysOp</option>
                    <option value="Security Architect">Security Architect</option>
                    <option value="Operations Assistant">Operations Assistant</option>
                    <option value="POS Cashier">POS Cashier</option>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Compliance Auditor">Compliance Auditor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Access Status</label>
                  <select
                    value={staffStatus}
                    onChange={(e) => setStaffStatus(e.target.value as any)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Standby">Standby</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Assigned Physical Desk</label>
                  <select
                    value={staffDeskId}
                    onChange={(e) => setStaffDeskId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none"
                  >
                    {staffDesks.map(desk => (
                      <option key={desk.id} value={desk.id}>
                        {desk.name} ({desk.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-1.5 select-none">
                  <input
                    type="checkbox"
                    id="staff_emp_access"
                    checked={staffEmpAccess}
                    onChange={(e) => setStaffEmpAccess(e.target.checked)}
                    className="text-[#FF5A00] focus:ring-[#FF5A00]"
                  />
                  <label htmlFor="staff_emp_access" className="text-[10px] text-gray-700 uppercase font-bold cursor-pointer">
                    Grant Employee Creation Access
                  </label>
                </div>

                <div className="space-y-1 pt-1.5">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Welcome Message Override</label>
                  <input
                    type="text"
                    placeholder="Custom dashboard greeting greeting..."
                    value={staffWelcome}
                    onChange={(e) => setStaffWelcome(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-3 uppercase font-bold text-center tracking-wider transition-colors rounded-none mt-4 cursor-pointer"
                >
                  Commit Credentials
                </button>
              </form>
            </div>
            <button
              onClick={() => setIsStaffDrawerOpen(false)}
              className="w-full bg-white border border-[#D1D1CF] text-gray-700 py-2.5 uppercase font-bold text-center hover:bg-gray-100 transition-colors rounded-none cursor-pointer mt-4"
            >
              Cancel Operation
            </button>
          </div>
        </div>
      )}

      {/* ==========================================================================
         DESK DRAWER
         ========================================================================== */}
      {isDeskDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-end z-50 font-mono text-xs">
          <div className="absolute inset-0" onClick={() => setIsDeskDrawerOpen(false)} />
          <div className="bg-white border-l-4 border-[#1A1A1A] w-full max-w-md h-full relative z-10 flex flex-col justify-between shadow-2xl p-6 animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-[#FF5A00]" />
                  <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">
                    {editingDeskId ? 'MODIFY DESK GATEWAY' : 'INITIALIZE DESK GATEWAY'}
                  </h2>
                </div>
                <button onClick={() => setIsDeskDrawerOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeskSubmit} className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Desk Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales Desk Cashier 4"
                    value={deskName}
                    onChange={(e) => setDeskName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Gateway IP Address</label>
                  <input
                    type="text"
                    required
                    value={deskIp}
                    onChange={(e) => setDeskIp(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Location</label>
                  <input
                    type="text"
                    required
                    value={deskLocation}
                    onChange={(e) => setDeskLocation(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Operational Status</label>
                  <select
                    value={deskStatus}
                    onChange={(e) => setDeskStatus(e.target.value as any)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Locked">Locked</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Tree Menu Feature Checklist */}
                <div className="space-y-2 pt-2 border-t border-gray-150">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Grant Access Menu Tree Paths</label>
                  <div className="space-y-1 max-h-[220px] overflow-y-auto border border-[#D1D1CF] bg-gray-50 p-2.5 divide-y divide-gray-200">
                    {menuFeatures.map(feat => {
                      const isChecked = deskMenuAccess.includes(feat.id);
                      return (
                        <label 
                          key={feat.id}
                          className="flex items-center space-x-2 py-1.5 cursor-pointer select-none text-[10px] uppercase font-bold"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleMenuAccess(feat.id)}
                            className="text-[#FF5A00] focus:ring-[#FF5A00] shrink-0"
                          />
                          <span className="text-[#1A1A1A]">{feat.label} <span className="text-[8px] text-gray-400 lowercase font-normal">({feat.id})</span></span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-3 uppercase font-bold text-center tracking-wider transition-colors rounded-none mt-4 cursor-pointer"
                >
                  Commit Desk Gateway
                </button>
              </form>
            </div>
            <button
              onClick={() => setIsDeskDrawerOpen(false)}
              className="w-full bg-white border border-[#D1D1CF] text-gray-700 py-2.5 uppercase font-bold text-center hover:bg-gray-100 transition-colors rounded-none cursor-pointer mt-4"
            >
              Cancel Operation
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
