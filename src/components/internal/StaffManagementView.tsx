import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  X, 
  Settings,
  Server,
  Layers,
  ArrowDown
} from 'lucide-react';
import { 
  SCIInternalStaff, 
  SCIStaffRole, 
  SCIStaffDesk, 
  SCIStaffSession,
  SCIMenuFeature
} from '../../internal/staffTypes';

interface StaffManagementViewProps {
  internalStaff: SCIInternalStaff[];
  onUpdateInternalStaff: (staff: SCIInternalStaff[]) => void;
  staffRoles: SCIStaffRole[];
  staffDesks: SCIStaffDesk[];
  menuFeatures: SCIMenuFeature[];
  activeStaffSession: SCIStaffSession | null;
  onUpdateStaffSession: (session: SCIStaffSession | null) => void;
  currentStaffCanCreateEmployee: boolean;
  onSimulateSession: (staffId: string) => void;
}

export default function StaffManagementView({
  internalStaff,
  onUpdateInternalStaff,
  staffRoles,
  staffDesks,
  menuFeatures,
  activeStaffSession,
  onUpdateStaffSession,
  currentStaffCanCreateEmployee,
  onSimulateSession
}: StaffManagementViewProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(internalStaff[0]?.staffId || '');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [assignedDeskIds, setAssignedDeskIds] = useState<string[]>([]);
  const [defaultDeskId, setDefaultDeskId] = useState('');
  const [canCreateEmployee, setCanCreateEmployee] = useState(false);
  const [dashboardType, setDashboardType] = useState<SCIInternalStaff['dashboardType']>('executive');
  const [status, setStatus] = useState<SCIInternalStaff['status']>('active');

  const selectedStaff = internalStaff.find(s => s.staffId === selectedStaffId) || internalStaff[0];
  
  // Calculate permissions template parameters
  const role = selectedStaff ? staffRoles.find(r => r.roleId === selectedStaff.roleId) : null;
  const roleName = role ? role.roleName : 'None';
  const roleFeatureCount = role ? role.menuFeatureIds.length : 0;

  const defaultDesk = selectedStaff ? staffDesks.find(d => d.deskId === selectedStaff.defaultDeskId) : null;
  const deskFeatureCount = defaultDesk ? defaultDesk.menuFeatureIds.length : 0;

  // Union of features
  const effectiveFeatureIds = useMemo(() => {
    if (!selectedStaff) return [];
    const rFeats = role ? role.menuFeatureIds : [];
    const dFeats = defaultDesk ? defaultDesk.menuFeatureIds : [];
    return Array.from(new Set([...rFeats, ...dFeats]));
  }, [selectedStaff, role, defaultDesk]);

  const handleOpenCreate = () => {
    if (!currentStaffCanCreateEmployee) {
      alert("Access Denied: Your simulated session profile does not have employee creation clearance.");
      return;
    }
    setEditingStaffId(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setRoleId(staffRoles[0]?.roleId || '');
    setAssignedDeskIds([]);
    setDefaultDeskId('');
    setCanCreateEmployee(false);
    setDashboardType('executive');
    setStatus('active');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (staff: SCIInternalStaff) => {
    setEditingStaffId(staff.staffId);
    setFullName(staff.fullName);
    setEmail(staff.email);
    setPhone(staff.phone || '');
    setRoleId(staff.roleId);
    setAssignedDeskIds(staff.assignedDeskIds);
    setDefaultDeskId(staff.defaultDeskId || '');
    setCanCreateEmployee(staff.canCreateEmployee);
    setDashboardType(staff.dashboardType);
    setStatus(staff.status);
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    if (editingStaffId) {
      const updated = internalStaff.map(s => 
        s.staffId === editingStaffId 
          ? { 
              ...s, 
              fullName, 
              email, 
              phone: phone || undefined, 
              roleId, 
              assignedDeskIds, 
              defaultDeskId: defaultDeskId || undefined, 
              canCreateEmployee, 
              dashboardType, 
              status,
              updatedAt: new Date().toISOString()
            } 
          : s
      );
      onUpdateInternalStaff(updated);
    } else {
      const newId = `staff_${Math.floor(100 + Math.random() * 900)}`;
      const newMember: SCIInternalStaff = {
        staffId: newId,
        fullName,
        email,
        phone: phone || undefined,
        roleId,
        assignedDeskIds,
        defaultDeskId: defaultDeskId || undefined,
        canCreateEmployee,
        dashboardType,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdateInternalStaff([...internalStaff, newMember]);
      setSelectedStaffId(newId);
    }
    setIsDrawerOpen(false);
  };

  const handleToggleStatus = (staffId: string) => {
    const updated = internalStaff.map(s => {
      if (s.staffId === staffId) {
        const nextStatus: SCIInternalStaff['status'] = s.status === 'active' ? 'suspended' : 'active';
        return { ...s, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    onUpdateInternalStaff(updated);
  };

  const handleDelete = (staffId: string) => {
    if (staffId === 'staff_sysadmin') {
      alert("Error: The core system administrator node is protected and cannot be deleted.");
      return;
    }
    if (confirm("Are you sure you want to delete this staff member profile?")) {
      const filtered = internalStaff.filter(s => s.staffId !== staffId);
      onUpdateInternalStaff(filtered);
      if (selectedStaffId === staffId) {
        setSelectedStaffId(filtered[0]?.staffId || '');
      }
    }
  };

  const handleToggleAssignedDesk = (deskId: string) => {
    if (assignedDeskIds.includes(deskId)) {
      setAssignedDeskIds(assignedDeskIds.filter(id => id !== deskId));
      if (defaultDeskId === deskId) setDefaultDeskId('');
    } else {
      setAssignedDeskIds([...assignedDeskIds, deskId]);
      if (!defaultDeskId) setDefaultDeskId(deskId);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation Banner */}
      <div className="bg-[#1A1A1A] text-white p-4 border-2 border-[#1A1A1A] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
        <div>
          <div className="text-[10px] text-[#FF5A00] font-black uppercase tracking-wider">
            Live Administrative Session Simulation
          </div>
          <div className="text-white mt-1">
            Simulated Operator: <strong className="text-orange-400 font-bold">{activeStaffSession?.fullName || 'None'}</strong> • 
            Clearance ID: <span className="underline">{activeStaffSession?.roleId || 'None'}</span> • 
            Employee Creation: <span className={currentStaffCanCreateEmployee ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
              {currentStaffCanCreateEmployee ? 'AUTHORIZED' : 'BLOCKED'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Switch Session Profile:</span>
          <select
            value={activeStaffSession?.staffId || ''}
            onChange={(e) => onSimulateSession(e.target.value)}
            className="bg-[#2D2D2D] border border-gray-700 p-1.5 text-xs text-white focus:outline-none rounded-none uppercase font-bold"
          >
            {internalStaff.map(s => (
              <option key={s.staffId} value={s.staffId}>
                {s.fullName} ({s.staffId}) [{s.status}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Action Header */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase text-[#1A1A1A] tracking-wider">SCI Staff Credentials Registry</h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Manage administrative logins, security clearances, and workspace permissions</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          disabled={!currentStaffCanCreateEmployee}
          className={`flex items-center space-x-1.5 py-2.5 px-4 text-[10px] font-sans font-black uppercase tracking-wider transition-all rounded-none cursor-pointer border-2 ${
            currentStaffCanCreateEmployee 
              ? 'bg-[#FF5A00] hover:bg-[#1A1A1A] text-white border-transparent'
              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title={!currentStaffCanCreateEmployee ? 'Requires employee creation clearance.' : 'Provision new staff'}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision Staff Member</span>
        </button>
      </div>

      {/* Table grid layout */}
      <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[11px] text-[#1A1A1A]">
            <thead>
              <tr className="bg-[#1A1A1A] text-white uppercase text-[9px] border-b border-[#1A1A1A]">
                <th className="p-3">Staff Details</th>
                <th className="p-3">Role Clearance</th>
                <th className="p-3">Assigned Desks</th>
                <th className="p-3">Permissions</th>
                <th className="p-3">Dashboard</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1D1CF]">
              {internalStaff.map((staff) => {
                const isSelected = staff.staffId === selectedStaffId;
                const rName = staffRoles.find(r => r.roleId === staff.roleId)?.roleName || staff.roleId;
                return (
                  <tr 
                    key={staff.staffId} 
                    onClick={() => setSelectedStaffId(staff.staffId)}
                    className={`hover:bg-[#F9F9F8] cursor-pointer transition-all ${
                      isSelected ? 'bg-orange-50/40 font-bold border-l-4 border-l-[#FF5A00]' : ''
                    }`}
                  >
                    <td className="p-3 font-sans">
                      <div className="font-bold text-[#1A1A1A]">{staff.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{staff.email}</div>
                      {staff.phone && <div className="text-[9px] text-gray-400 font-mono">{staff.phone}</div>}
                    </td>
                    
                    <td className="p-3 uppercase align-middle">
                      <span className="bg-stone-100 text-stone-700 border border-stone-200 text-[9px] px-1.5 py-0.5 font-bold">
                        {rName}
                      </span>
                    </td>

                    <td className="p-3 align-middle font-sans">
                      <div className="flex flex-wrap gap-1">
                        {staff.assignedDeskIds.length === 0 ? (
                          <span className="text-gray-400 italic text-[10px]">No assigned desks</span>
                        ) : (
                          staff.assignedDeskIds.map(deskId => {
                            const name = staffDesks.find(d => d.deskId === deskId)?.deskName || deskId;
                            return (
                              <span key={deskId} className="bg-blue-50 text-blue-800 border border-blue-200 text-[8px] px-1.5 py-0.2 uppercase font-mono font-semibold">
                                {name}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>

                    <td className="p-3 align-middle">
                      <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase inline-flex items-center border ${
                        staff.canCreateEmployee 
                          ? 'bg-orange-50 text-[#FF5A00] border-orange-200' 
                          : 'bg-stone-50 text-stone-500 border-stone-250'
                      }`}>
                        {staff.canCreateEmployee ? 'Can Create Employee' : 'Standard Access'}
                      </span>
                    </td>

                    <td className="p-3 align-middle uppercase font-bold text-[9px]">
                      {staff.dashboardType}
                    </td>

                    <td className="p-3 align-middle">
                      <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase inline-flex items-center border ${
                        staff.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        staff.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-300' :
                        'bg-stone-50 text-stone-700 border-stone-300'
                      }`}>
                        {staff.status}
                      </span>
                    </td>

                    <td className="p-3 align-middle text-right space-x-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        className="text-[#1A1A1A] hover:text-[#FF5A00] font-bold uppercase text-[9px] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(staff.staffId)}
                        className="text-amber-600 hover:text-amber-800 font-bold uppercase text-[9px] hover:underline"
                      >
                        {staff.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(staff.staffId)}
                        className="text-red-600 hover:text-red-800 font-bold uppercase text-[9px] hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Permission Flowchart and Workspace details for selected staff */}
      {selectedStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 font-mono text-xs">
          
          {/* Left Panel: Profile specs and Flowchart (1 of 3 columns) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm space-y-4">
              <div className="p-2 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#1A1A1A] uppercase tracking-wider text-xs">
                Selected Profile Details
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400 uppercase text-[9px]">Employee Name</span>
                  <div className="font-bold text-sm font-sans">{selectedStaff.fullName}</div>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[9px]">Clearence Role Type</span>
                  <div className="font-bold text-gray-800 uppercase">{roleName} ({selectedStaff.roleId})</div>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[9px]">Active Default Desk</span>
                  <div className="font-bold text-gray-800">{defaultDesk ? defaultDesk.deskName : 'No Bound Desk'}</div>
                </div>
                <div>
                  <span className="text-gray-400 uppercase text-[9px]">Dynamic Dashboard Layout</span>
                  <div className="font-bold text-[#FF5A00] uppercase">{selectedStaff.dashboardType} Dashboard</div>
                </div>
              </div>
            </div>

            {/* Visual flowchart diagram: Role -> Desk -> Staff */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm space-y-3">
              <div className="p-2 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#1A1A1A] uppercase tracking-wider text-[10px]">
                Visual Permission Summary
              </div>
              
              <div className="flex flex-col items-center space-y-1 pb-2">
                {/* Role layer node */}
                <div className="w-full bg-[#1A1A1A] text-white border border-[#1A1A1A] p-2.5 text-center">
                  <div className="text-[8px] text-gray-400 uppercase">1. Role Base Layer</div>
                  <div className="font-bold font-sans uppercase truncate text-xs">{roleName}</div>
                  <div className="text-[8px] text-[#FF5A00] font-black mt-0.5">{roleFeatureCount} template features</div>
                </div>

                {/* Arrow */}
                <div className="text-gray-400 font-bold text-xs py-0.5">↓</div>

                {/* Desk layer node */}
                <div className="w-full bg-white border border-[#1A1A1A] p-2.5 text-center">
                  <div className="text-[8px] text-gray-400 uppercase">2. Desk Gateway Layer</div>
                  <div className="font-bold font-sans uppercase truncate text-xs">{defaultDesk ? defaultDesk.deskName : 'Unbound'}</div>
                  <div className="text-[8px] text-gray-500 font-bold mt-0.5">{deskFeatureCount} console features</div>
                </div>

                {/* Arrow */}
                <div className="text-gray-400 font-bold text-xs py-0.5">↓</div>

                {/* Staff Union layer node */}
                <div className="w-full bg-orange-50 border-2 border-[#FF5A00] p-2.5 text-center relative overflow-hidden">
                  <div className="text-[8px] text-[#FF5A00] font-black uppercase">3. Effective Staff Clearance</div>
                  <div className="font-bold font-sans uppercase text-[#1A1A1A] truncate text-xs">{selectedStaff.fullName}</div>
                  <div className="text-[9px] text-[#FF5A00] font-black mt-0.5">
                    {effectiveFeatureIds.length} Combined Menu Paths
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Effective Menu Permissions list (2 of 3 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm space-y-4">
              <div className="p-2 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#1A1A1A] uppercase tracking-wider text-xs flex justify-between">
                <span>Effective Combined Menu Permissions</span>
                <span className="text-[#FF5A00] font-black">{effectiveFeatureIds.length} Active Paths</span>
              </div>

              {effectiveFeatureIds.length === 0 ? (
                <div className="p-12 border border-dashed border-red-300 bg-red-50 text-red-700 italic text-center font-sans">
                  ⚠ Warning: This staff member has no effective menu paths granted and is locked out of the application console.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {menuFeatures.filter(f => effectiveFeatureIds.includes(f.featureId)).map(feat => (
                    <div key={feat.featureId} className="p-3 border border-gray-200 bg-gray-50 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#FF5A00] shrink-0" />
                      <div>
                        <div className="font-bold text-[#1A1A1A] font-sans">{feat.label}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5 uppercase">Category: {feat.category} • ID: {feat.featureId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ==========================================================================
         STAFF DETAILS DRAWER
         ========================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-end z-50 font-mono text-xs text-[#1A1A1A]">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="bg-white border-l-4 border-[#1A1A1A] w-full max-w-md h-full relative z-10 flex flex-col justify-between shadow-2xl p-6 animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-[#FF5A00]" />
                  <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">
                    {editingStaffId ? 'MODIFY STAFF MEMBER' : 'PROVISION STAFF MEMBER'}
                  </h2>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vance@seigencommerce.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +27 11 000 1123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Role Clearance</label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none rounded-none"
                  >
                    {staffRoles.map(role => (
                      <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Dashboard Type Mappings</label>
                  <select
                    value={dashboardType}
                    onChange={(e) => setDashboardType(e.target.value as any)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none rounded-none"
                  >
                    <option value="executive">Executive</option>
                    <option value="operations">Operations</option>
                    <option value="sales">Sales</option>
                    <option value="support">Support</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none rounded-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* Desk Assignments */}
                <div className="space-y-2 pt-2 border-t border-[#D1D1CF]">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Assign Desks Consoles</label>
                  <div className="max-h-[120px] overflow-y-auto border border-[#D1D1CF] p-2.5 bg-gray-50 space-y-1">
                    {staffDesks.map(desk => {
                      const isAssigned = assignedDeskIds.includes(desk.deskId);
                      return (
                        <label key={desk.deskId} className="flex items-center space-x-2 py-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleToggleAssignedDesk(desk.deskId)}
                            className="text-[#FF5A00] focus:ring-[#FF5A00]"
                          />
                          <span className="text-[10px] uppercase font-bold">{desk.deskName} ({desk.deskId})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {assignedDeskIds.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[9px] block font-bold">Default Console Desk</label>
                    <select
                      value={defaultDeskId}
                      onChange={(e) => setDefaultDeskId(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none rounded-none"
                    >
                      <option value="">-- Choose Default --</option>
                      {assignedDeskIds.map(id => {
                        const name = staffDesks.find(d => d.deskId === id)?.deskName || id;
                        return <option key={id} value={id}>{name}</option>;
                      })}
                    </select>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2 select-none">
                  <input
                    type="checkbox"
                    id="can_create_emp_checkbox"
                    checked={canCreateEmployee}
                    onChange={(e) => setCanCreateEmployee(e.target.checked)}
                    className="text-[#FF5A00] focus:ring-[#FF5A00]"
                  />
                  <label htmlFor="can_create_emp_checkbox" className="text-[10px] text-gray-700 uppercase font-black cursor-pointer">
                    Grant Employee Creation Access (canCreateEmployee)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-3 uppercase font-bold text-center tracking-wider transition-colors rounded-none mt-4 cursor-pointer"
                >
                  Commit Staff Profile
                </button>
              </form>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
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
