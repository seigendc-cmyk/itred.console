import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Settings, 
  Check, 
  Lock 
} from 'lucide-react';
import { SCIStaffRole, SCIMenuFeature } from '../../internal/staffTypes';

interface StaffRoleCreatorViewProps {
  staffRoles: SCIStaffRole[];
  onUpdateStaffRoles: (roles: SCIStaffRole[]) => void;
  menuFeatures: SCIMenuFeature[];
  currentAdmin: any;
}

export default function StaffRoleCreatorView({
  staffRoles,
  onUpdateStaffRoles,
  menuFeatures,
  currentAdmin
}: StaffRoleCreatorViewProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Form Fields
  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [menuFeatureIds, setMenuFeatureIds] = useState<string[]>([]);
  const [canCreateEmployee, setCanCreateEmployee] = useState(false);
  const [canCreateRole, setCanCreateRole] = useState(false);
  const [canCreateDesk, setCanCreateDesk] = useState(false);
  const [canGrantMenuAccess, setCanGrantMenuAccess] = useState(false);
  const [status, setStatus] = useState<SCIStaffRole['status']>('active');

  const handleOpenCreate = () => {
    setEditingRoleId(null);
    setRoleId('');
    setRoleName('');
    setDescription('');
    setMenuFeatureIds([]);
    setCanCreateEmployee(false);
    setCanCreateRole(false);
    setCanCreateDesk(false);
    setCanGrantMenuAccess(false);
    setStatus('active');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (role: SCIStaffRole) => {
    setEditingRoleId(role.roleId);
    setRoleId(role.roleId);
    setRoleName(role.roleName);
    setDescription(role.description);
    setMenuFeatureIds(role.menuFeatureIds);
    setCanCreateEmployee(role.canCreateEmployee);
    setCanCreateRole(role.canCreateRole);
    setCanCreateDesk(role.canCreateDesk);
    setCanGrantMenuAccess(role.canGrantMenuAccess);
    setStatus(role.status);
    setIsDrawerOpen(true);
  };

  const handleCloneRole = (role: SCIStaffRole) => {
    const newId = `${role.roleId}_copy_${Math.floor(10 + Math.random() * 90)}`;
    const clonedRole: SCIStaffRole = {
      ...role,
      roleId: newId,
      roleName: `${role.roleName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onUpdateStaffRoles([...staffRoles, clonedRole]);
    handleOpenEdit(clonedRole);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleId.trim()) return;

    const finalRoleId = roleId.trim().toLowerCase().replace(/\s+/g, '_');

    if (editingRoleId) {
      const updated = staffRoles.map(r => 
        r.roleId === editingRoleId 
          ? { 
              ...r, 
              roleName, 
              description, 
              menuFeatureIds, 
              canCreateEmployee, 
              canCreateRole, 
              canCreateDesk, 
              canGrantMenuAccess, 
              status,
              updatedAt: new Date().toISOString()
            } 
          : r
      );
      onUpdateStaffRoles(updated);
    } else {
      // Check duplicate ID
      if (staffRoles.some(r => r.roleId === finalRoleId)) {
        alert("A role with this ID key already exists in the system registry.");
        return;
      }

      const newRole: SCIStaffRole = {
        roleId: finalRoleId,
        roleName,
        description,
        menuFeatureIds,
        canCreateEmployee,
        canCreateRole,
        canCreateDesk,
        canGrantMenuAccess,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdateStaffRoles([...staffRoles, newRole]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    if (id === 'role_sysadmin') {
      alert("Error: Core role 'role_sysadmin' is locked and cannot be deleted.");
      return;
    }
    if (confirm("Are you sure you want to delete this staff role? Profiles bound to this role will lose configuration.")) {
      onUpdateStaffRoles(staffRoles.filter(r => r.roleId !== id));
    }
  };

  const handleToggleFeature = (featId: string) => {
    if (menuFeatureIds.includes(featId)) {
      setMenuFeatureIds(menuFeatureIds.filter(id => id !== featId));
    } else {
      setMenuFeatureIds([...menuFeatureIds, featId]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase text-[#1A1A1A] tracking-wider">SCI Staff Roles Authority</h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Manage administrative roles, dynamic limits, and direct menu access templates</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-2.5 px-4 text-[10px] font-sans font-black uppercase tracking-wider transition-all rounded-none cursor-pointer border-2 border-transparent"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Staff Role</span>
        </button>
      </div>

      {/* Grid of Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs text-[#1A1A1A]">
        {staffRoles.map((role) => (
          <div key={role.roleId} className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col justify-between space-y-4 hover:border-[#FF5A00] transition-colors relative">
            <div className="space-y-3">
              <div className="flex justify-between items-start border-b border-gray-150 pb-2">
                <div>
                  <h3 className="text-sm font-sans font-black uppercase text-[#1A1A1A]">{role.roleName}</h3>
                  <span className="text-[9px] text-gray-400">ID: {role.roleId}</span>
                </div>
                <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase border ${
                  role.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {role.status}
                </span>
              </div>

              <p className="text-xs text-gray-500 font-sans leading-relaxed min-h-[40px]">
                {role.description || 'No description provided.'}
              </p>

              {/* Authority list parameters */}
              <div className="bg-gray-50 p-2.5 border border-[#D1D1CF] space-y-1.5 text-[9px] uppercase font-bold text-gray-600">
                <div className="flex justify-between">
                  <span>Create Employee:</span>
                  <span className={role.canCreateEmployee ? "text-orange-600" : "text-gray-400"}>
                    {role.canCreateEmployee ? 'Granted' : 'Blocked'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Create Role:</span>
                  <span className={role.canCreateRole ? "text-orange-600" : "text-gray-400"}>
                    {role.canCreateRole ? 'Granted' : 'Blocked'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Create Desk:</span>
                  <span className={role.canCreateDesk ? "text-orange-600" : "text-gray-400"}>
                    {role.canCreateDesk ? 'Granted' : 'Blocked'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Grant Menu Access:</span>
                  <span className={role.canGrantMenuAccess ? "text-orange-600" : "text-gray-400"}>
                    {role.canGrantMenuAccess ? 'Granted' : 'Blocked'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#FF5A00] font-black uppercase">
                Granted Features: {role.menuFeatureIds.length} Nodes Mapped
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-150">
              <button
                onClick={() => handleCloneRole(role)}
                className="text-blue-600 hover:text-blue-800 uppercase text-[10px] font-bold hover:underline"
              >
                Clone
              </button>
              <button
                onClick={() => handleOpenEdit(role)}
                className="text-[#1A1A1A] hover:text-[#FF5A00] uppercase text-[10px] font-bold hover:underline"
              >
                Modify
              </button>
              <button
                onClick={() => handleDelete(role.roleId)}
                className="text-red-600 hover:text-red-800 uppercase text-[10px] font-bold hover:underline"
              >
                Purge
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ==========================================================================
         ROLE REGISTRY DRAWER
         ========================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-end z-50 font-mono text-xs text-[#1A1A1A]">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="bg-white border-l-4 border-[#1A1A1A] w-full max-w-md h-full relative z-10 flex flex-col justify-between shadow-2xl p-6 animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-[#FF5A00]" />
                  <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">
                    {editingRoleId ? 'MODIFY STAFF ROLE' : 'CREATE STAFF ROLE'}
                  </h2>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-black font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Unique Role ID Key</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRoleId}
                    placeholder="e.g. role_compliance"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none uppercase"
                  />
                  {!editingRoleId && (
                    <span className="text-[8px] text-gray-400 block font-sans">Lowercases, underscores only.</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Role Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compliance Auditor"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe role responsibilities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none rounded-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* Toggles Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 border border-[#D1D1CF] select-none font-bold text-[9px] uppercase text-gray-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreateEmployee}
                      onChange={(e) => setCanCreateEmployee(e.target.checked)}
                      className="text-[#FF5A00] focus:ring-[#FF5A00]"
                    />
                    <span>Can Create Staff</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreateRole}
                      onChange={(e) => setCanCreateRole(e.target.checked)}
                      className="text-[#FF5A00] focus:ring-[#FF5A00]"
                    />
                    <span>Can Create Role</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreateDesk}
                      onChange={(e) => setCanCreateDesk(e.target.checked)}
                      className="text-[#FF5A00] focus:ring-[#FF5A00]"
                    />
                    <span>Can Create Desk</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canGrantMenuAccess}
                      onChange={(e) => setCanGrantMenuAccess(e.target.checked)}
                      className="text-[#FF5A00] focus:ring-[#FF5A00]"
                    />
                    <span>Can Grant Access</span>
                  </label>
                </div>

                {/* Menu Access Tree */}
                <div className="space-y-2 pt-2 border-t border-[#D1D1CF]">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Assign Allowed Features</label>
                  <div className="max-h-[160px] overflow-y-auto border border-[#D1D1CF] p-2.5 bg-gray-50 divide-y divide-gray-200">
                    {menuFeatures.map(feat => (
                      <label key={feat.featureId} className="flex items-center space-x-2 py-1.5 cursor-pointer text-[10px] font-bold uppercase">
                        <input
                          type="checkbox"
                          checked={menuFeatureIds.includes(feat.featureId)}
                          onChange={() => handleToggleFeature(feat.featureId)}
                          className="text-[#FF5A00] focus:ring-[#FF5A00]"
                        />
                        <span>{feat.label} <span className="text-[8px] text-gray-400 lowercase font-normal">({feat.featureId})</span></span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-3 uppercase font-bold text-center tracking-wider transition-colors rounded-none mt-4 cursor-pointer"
                >
                  Commit Role Specs
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
