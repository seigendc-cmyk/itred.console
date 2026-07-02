import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Settings, 
  Check, 
  User 
} from 'lucide-react';
import { 
  SCIStaffDesk, 
  SCIInternalStaff, 
  SCIMenuFeature 
} from '../../internal/staffTypes';

interface StaffDeskCreatorViewProps {
  staffDesks: SCIStaffDesk[];
  onUpdateStaffDesks: (desks: SCIStaffDesk[]) => void;
  internalStaff: SCIInternalStaff[];
  menuFeatures: SCIMenuFeature[];
  currentAdmin: any;
}

export default function StaffDeskCreatorView({
  staffDesks,
  onUpdateStaffDesks,
  internalStaff,
  menuFeatures,
  currentAdmin
}: StaffDeskCreatorViewProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDeskId, setEditingDeskId] = useState<string | null>(null);

  // Form Fields
  const [deskId, setDeskId] = useState('');
  const [deskName, setDeskName] = useState('');
  const [deskCode, setDeskCode] = useState('');
  const [description, setDescription] = useState('');
  const [menuFeatureIds, setMenuFeatureIds] = useState<string[]>([]);
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [dashboardType, setDashboardType] = useState<SCIStaffDesk['dashboardType']>('executive');
  const [status, setStatus] = useState<SCIStaffDesk['status']>('active');

  const handleOpenCreate = () => {
    setEditingDeskId(null);
    setDeskId('');
    setDeskName('');
    setDeskCode(`DESK-${Math.floor(100 + Math.random() * 900)}`);
    setDescription('');
    setMenuFeatureIds([]);
    setAssignedStaffIds([]);
    setDashboardType('operations');
    setStatus('active');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (desk: SCIStaffDesk) => {
    setEditingDeskId(desk.deskId);
    setDeskId(desk.deskId);
    setDeskName(desk.deskName);
    setDeskCode(desk.deskCode);
    setDescription(desk.description);
    setMenuFeatureIds(desk.menuFeatureIds);
    setAssignedStaffIds(desk.assignedStaffIds);
    setDashboardType(desk.dashboardType);
    setStatus(desk.status);
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deskName.trim() || !deskCode.trim() || !deskId.trim()) return;

    const finalDeskId = deskId.trim().toLowerCase().replace(/\s+/g, '_');

    if (editingDeskId) {
      const updated = staffDesks.map(d => 
        d.deskId === editingDeskId 
          ? { 
              ...d, 
              deskName, 
              deskCode: deskCode.trim().toUpperCase(), 
              description, 
              menuFeatureIds, 
              assignedStaffIds, 
              dashboardType, 
              status,
              updatedAt: new Date().toISOString()
            } 
          : d
      );
      onUpdateStaffDesks(updated);
    } else {
      if (staffDesks.some(d => d.deskId === finalDeskId)) {
        alert("A desk console with this ID key is already registered.");
        return;
      }

      const newDesk: SCIStaffDesk = {
        deskId: finalDeskId,
        deskName,
        deskCode: deskCode.trim().toUpperCase(),
        description,
        menuFeatureIds,
        assignedStaffIds,
        dashboardType,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdateStaffDesks([...staffDesks, newDesk]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    if (id === 'desk_sysadmin') {
      alert("Error: Core administrative desk 'desk_sysadmin' is protected.");
      return;
    }
    if (confirm("Are you sure you want to delete this desk node? Staff routed to this desk will clear bindings.")) {
      onUpdateStaffDesks(staffDesks.filter(d => d.deskId !== id));
    }
  };

  const handleToggleFeature = (featId: string) => {
    if (menuFeatureIds.includes(featId)) {
      setMenuFeatureIds(menuFeatureIds.filter(id => id !== featId));
    } else {
      setMenuFeatureIds([...menuFeatureIds, featId]);
    }
  };

  const handleToggleStaff = (staffId: string) => {
    if (assignedStaffIds.includes(staffId)) {
      setAssignedStaffIds(assignedStaffIds.filter(id => id !== staffId));
    } else {
      setAssignedStaffIds([...assignedStaffIds, staffId]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase text-[#1A1A1A] tracking-wider">SCI Staff Desks Creator</h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Provision physical consoles, set terminal code maps, and bind allowed menu trees</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-2.5 px-4 text-[10px] font-sans font-black uppercase tracking-wider transition-all rounded-none cursor-pointer border-2 border-transparent"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Staff Desk</span>
        </button>
      </div>

      {/* Grid of Desks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs text-[#1A1A1A]">
        {staffDesks.map((desk) => (
          <div key={desk.deskId} className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col justify-between space-y-4 hover:border-[#FF5A00] transition-colors">
            <div className="space-y-3">
              <div className="flex justify-between items-start border-b border-gray-150 pb-2">
                <div>
                  <h3 className="text-sm font-sans font-black uppercase text-[#1A1A1A]">{desk.deskName}</h3>
                  <span className="text-[9px] text-[#FF5A00] font-black uppercase tracking-widest">{desk.deskCode}</span>
                </div>
                <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase border ${
                  desk.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {desk.status}
                </span>
              </div>

              <p className="text-xs text-gray-500 font-sans leading-relaxed min-h-[40px]">
                {desk.description || 'No description provided.'}
              </p>

              {/* Mapped stats */}
              <div className="bg-gray-50 p-2.5 border border-[#D1D1CF] space-y-1.5 text-[9px] uppercase font-bold text-gray-600">
                <div className="flex justify-between">
                  <span>Dashboard Type:</span>
                  <span className="text-gray-800">{desk.dashboardType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desk Terminal ID:</span>
                  <span className="text-gray-800 lowercase">{desk.deskId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Menu Paths Allowed:</span>
                  <span className="text-[#FF5A00]">{desk.menuFeatureIds.length} Mapped</span>
                </div>
              </div>

              {/* Bound staff */}
              <div className="space-y-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Bound Operators:</span>
                <div className="flex flex-wrap gap-1 font-sans">
                  {desk.assignedStaffIds.length === 0 ? (
                    <span className="text-[10px] text-gray-400 italic">No operators bound</span>
                  ) : (
                    desk.assignedStaffIds.map(stId => {
                      const name = internalStaff.find(s => s.staffId === stId)?.fullName || stId;
                      return (
                        <span key={stId} className="bg-orange-50 text-[#FF5A00] border border-orange-100 text-[8px] px-1 py-0.2 font-semibold">
                          {name}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-150">
              <button
                onClick={() => handleOpenEdit(desk)}
                className="text-[#1A1A1A] hover:text-[#FF5A00] uppercase text-[10px] font-bold hover:underline"
              >
                Modify
              </button>
              <button
                onClick={() => handleDelete(desk.deskId)}
                className="text-red-600 hover:text-red-800 uppercase text-[10px] font-bold hover:underline"
              >
                Purge
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ==========================================================================
         DESK REGISTRY DRAWER
         ========================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-end z-50 font-mono text-xs text-[#1A1A1A]">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="bg-white border-l-4 border-[#1A1A1A] w-full max-w-md h-full relative z-10 flex flex-col justify-between shadow-2xl p-6 animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-[#FF5A00]" />
                  <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">
                    {editingDeskId ? 'MODIFY STAFF DESK' : 'CREATE STAFF DESK'}
                  </h2>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-black font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Unique Desk ID Key</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingDeskId}
                    placeholder="e.g. desk_auditing"
                    value={deskId}
                    onChange={(e) => setDeskId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none uppercase"
                  />
                  {!editingDeskId && (
                    <span className="text-[8px] text-gray-400 block font-sans">Lowercases, underscores only.</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Desk Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditing Command Desk"
                    value={deskName}
                    onChange={(e) => setDeskName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Desk Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DESK-AUDIT"
                    value={deskCode}
                    onChange={(e) => setDeskCode(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Detail physical terminal location bounds..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Dashboard Layout Type</label>
                  <select
                    value={dashboardType}
                    onChange={(e) => setDashboardType(e.target.value as any)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none rounded-none font-bold"
                  >
                    <option value="executive">Executive Dashboard</option>
                    <option value="operations">Operations Dashboard</option>
                    <option value="sales">Sales Dashboard</option>
                    <option value="support">Support Dashboard</option>
                    <option value="admin">System Admin Dashboard</option>
                  </select>
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

                {/* Assigned Staff */}
                <div className="space-y-2 pt-2 border-t border-[#D1D1CF]">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Assign Staff Members</label>
                  <div className="max-h-[100px] overflow-y-auto border border-[#D1D1CF] p-2.5 bg-gray-50 space-y-1">
                    {internalStaff.map(staff => (
                      <label key={staff.staffId} className="flex items-center space-x-2 py-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={assignedStaffIds.includes(staff.staffId)}
                          onChange={() => handleToggleStaff(staff.staffId)}
                          className="text-[#FF5A00] focus:ring-[#FF5A00]"
                        />
                        <span className="text-[10px] font-bold uppercase">{staff.fullName} ({staff.staffId})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Menu Access Tree */}
                <div className="space-y-2 pt-2 border-t border-[#D1D1CF]">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Assign Allowed Features</label>
                  <div className="max-h-[140px] overflow-y-auto border border-[#D1D1CF] p-2.5 bg-gray-50 divide-y divide-gray-200">
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
                  Commit Desk Credentials
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
