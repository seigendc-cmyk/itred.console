import React, { useState } from 'react';
import { 
  FolderTree, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ChevronRight,
  Shield,
  Server,
  Layers,
  Database
} from 'lucide-react';
import { SCIMenuFeature, SCIStaffRole, SCIStaffDesk } from '../../internal/staffTypes';

interface MenuFeaturesViewProps {
  menuFeatures: SCIMenuFeature[];
  onUpdateMenuFeatures: (features: SCIMenuFeature[]) => void;
  staffRoles: SCIStaffRole[];
  staffDesks: SCIStaffDesk[];
  currentAdmin: any;
}

export default function MenuFeaturesView({
  menuFeatures,
  onUpdateMenuFeatures,
  staffRoles,
  staffDesks,
  currentAdmin
}: MenuFeaturesViewProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  // Form Fields
  const [featureId, setFeatureId] = useState('');
  const [label, setLabel] = useState('');
  const [parentId, setParentId] = useState('');
  const [path, setPath] = useState('');
  const [category, setCategory] = useState<SCIMenuFeature['category']>('dashboard');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SCIMenuFeature['status']>('active');

  const categories: SCIMenuFeature['category'][] = [
    'dashboard', 'business', 'commercial', 'licensing', 'internal_admin', 'operations', 'platform'
  ];

  // Core features locked from deletion
  const SYSTEM_LOCKED_FEATURES = [
    'dashboard', 'vendors', 'plans_pricing', 'pos_licensing', 'app_licensing',
    'staff_management', 'role_creator', 'desk_creator', 'menu_features',
    'settings', 'audit_logs'
  ];

  const handleOpenCreate = () => {
    setEditingFeatureId(null);
    setFeatureId('');
    setLabel('');
    setParentId('');
    setPath('');
    setCategory('dashboard');
    setDescription('');
    setStatus('active');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (feat: SCIMenuFeature) => {
    setEditingFeatureId(feat.featureId);
    setFeatureId(feat.featureId);
    setLabel(feat.label);
    setParentId(feat.parentId || '');
    setPath(feat.path || '');
    setCategory(feat.category);
    setDescription(feat.description);
    setStatus(feat.status);
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !featureId.trim()) return;

    const finalFeatureId = featureId.trim().toLowerCase().replace(/\s+/g, '_');

    const featureData: SCIMenuFeature = {
      featureId: finalFeatureId,
      label: label.trim(),
      parentId: parentId.trim() || undefined,
      path: path.trim() || undefined,
      category,
      description: description.trim(),
      status
    };

    if (editingFeatureId) {
      const updated = menuFeatures.map(f => f.featureId === editingFeatureId ? featureData : f);
      onUpdateMenuFeatures(updated);
    } else {
      if (menuFeatures.some(f => f.featureId === finalFeatureId)) {
        alert("A feature with this Key ID already exists in the system registry.");
        return;
      }
      onUpdateMenuFeatures([...menuFeatures, featureData]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    if (SYSTEM_LOCKED_FEATURES.includes(id)) {
      alert(`Access Denied: "${id}" is a system-critical core node and cannot be deleted.`);
      return;
    }
    if (confirm(`Are you sure you want to delete menu feature "${id}"? Roles and desks mapped to it will clear it.`)) {
      onUpdateMenuFeatures(menuFeatures.filter(f => f.featureId !== id));
    }
  };

  // Find where this feature is granted
  const getFeatureGrants = (featId: string) => {
    const roles = staffRoles.filter(r => r.menuFeatureIds.includes(featId)).map(r => r.roleName);
    const desks = staffDesks.filter(d => d.menuFeatureIds.includes(featId)).map(d => d.deskName);
    return { roles, desks };
  };

  // Group tree builder: separate roots and children
  const roots = menuFeatures.filter(f => !f.parentId);
  const children = menuFeatures.filter(f => f.parentId);

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase text-[#1A1A1A] tracking-wider">SCI Menu Capabilities Tree</h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Define app routes, categorize menu schemas, and inspect active permission assignments</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-2.5 px-4 text-[10px] font-sans font-black uppercase tracking-wider transition-all rounded-none cursor-pointer border-2 border-transparent"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Menu Feature</span>
        </button>
      </div>

      {/* Main categories listing */}
      <div className="space-y-6 font-mono text-xs text-[#1A1A1A]">
        {categories.map(cat => {
          const catFeatures = roots.filter(f => f.category === cat);
          if (catFeatures.length === 0) return null;

          return (
            <div key={cat} className="bg-white border-2 border-[#1A1A1A]">
              <div className="p-3 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#FF5A00] uppercase tracking-wider text-[10px]">
                {cat} Suite
              </div>
              
              <div className="divide-y divide-[#D1D1CF]">
                {catFeatures.map(feat => {
                  const subFeats = children.filter(c => c.parentId === feat.featureId);
                  const grants = getFeatureGrants(feat.featureId);
                  const isLocked = SYSTEM_LOCKED_FEATURES.includes(feat.featureId);

                  return (
                    <div key={feat.featureId} className="p-4 space-y-3 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-sans font-bold text-sm uppercase text-[#1A1A1A]">{feat.label}</span>
                            <span className="bg-gray-200 text-gray-800 px-1.5 py-0.2 text-[9px] uppercase font-bold">{feat.featureId}</span>
                            <span className={`px-1 text-[8px] uppercase border font-semibold ${
                              feat.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {feat.status}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-500 font-sans leading-relaxed">{feat.description}</p>
                          {feat.path && (
                            <div className="text-[10px] text-[#FF5A00] font-black uppercase">
                              Route: <span className="underline">{feat.path}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 shrink-0 self-end sm:self-start">
                          <button
                            onClick={() => handleOpenEdit(feat)}
                            className="text-[#1A1A1A] hover:text-[#FF5A00] font-bold uppercase text-[9px] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(feat.featureId)}
                            disabled={isLocked}
                            className={`font-bold uppercase text-[9px] ${isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800 hover:underline'}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Display grants where feature is active */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-2.5 border border-gray-200 text-[9px] uppercase">
                        <div>
                          <span className="text-gray-400 font-bold block mb-1">Granted to Roles:</span>
                          {grants.roles.length === 0 ? (
                            <span className="text-gray-400 italic font-sans normal-case">No roles assigned</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 font-sans">
                              {grants.roles.map(r => (
                                <span key={r} className="bg-stone-100 text-stone-700 px-1 py-0.2 border border-stone-250 font-bold">{r}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block mb-1">Granted to Desks:</span>
                          {grants.desks.length === 0 ? (
                            <span className="text-gray-400 italic font-sans normal-case">No desks assigned</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 font-sans">
                              {grants.desks.map(d => (
                                <span key={d} className="bg-blue-50 text-blue-700 px-1 py-0.2 border border-blue-200 font-bold">{d}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Render leaf child features */}
                      {subFeats.length > 0 && (
                        <div className="pl-6 border-l-2 border-dashed border-[#D1D1CF] space-y-3 pt-2">
                          {subFeats.map(child => {
                            const childGrants = getFeatureGrants(child.featureId);
                            const isChildLocked = SYSTEM_LOCKED_FEATURES.includes(child.featureId);

                            return (
                              <div key={child.featureId} className="bg-[#FAF9F6] border border-gray-200 p-3 space-y-2 hover:border-[#1A1A1A] transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1.5">
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-sans font-bold text-[#1A1A1A]">{child.label}</span>
                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 text-[8px] font-bold">{child.featureId}</span>
                                  </div>
                                  <div className="flex space-x-2 text-[9px] uppercase font-bold">
                                    <button onClick={() => handleOpenEdit(child)} className="text-[#1A1A1A] hover:text-[#FF5A00] hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(child.featureId)} disabled={isChildLocked} className={isChildLocked ? 'text-gray-300 cursor-not-allowed' : 'text-red-655 hover:text-red-800 hover:underline'}>Delete</button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 font-sans pl-5">{child.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-5 text-[8px] uppercase">
                                  <div>
                                    <span className="text-gray-400 font-bold block">Granted to Roles:</span>
                                    {childGrants.roles.length === 0 ? (
                                      <span className="text-gray-400 italic font-sans normal-case">No roles</span>
                                    ) : (
                                      <div className="flex flex-wrap gap-1 font-sans">{childGrants.roles.map(r => <span key={r} className="bg-stone-100 text-stone-700 px-1 border border-stone-200">{r}</span>)}</div>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-gray-400 font-bold block">Granted to Desks:</span>
                                    {childGrants.desks.length === 0 ? (
                                      <span className="text-gray-400 italic font-sans normal-case">No desks</span>
                                    ) : (
                                      <div className="flex flex-wrap gap-1 font-sans">{childGrants.desks.map(d => <span key={d} className="bg-blue-50 text-blue-700 px-1 border border-blue-200">{d}</span>)}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==========================================================================
         FEATURE CREATOR DRAWER
         ========================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-end z-50 font-mono text-xs text-[#1A1A1A]">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="bg-white border-l-4 border-[#1A1A1A] w-full max-w-md h-full relative z-10 flex flex-col justify-between shadow-2xl p-6 animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
                <div className="flex items-center space-x-2">
                  <FolderTree className="w-5 h-5 text-[#FF5A00]" />
                  <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">
                    {editingFeatureId ? 'MODIFY CAPABILITY FEATURE' : 'INITIALIZE CAPABILITY FEATURE'}
                  </h2>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-black font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Unique Feature ID Key</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingFeatureId}
                    placeholder="e.g. core_telemetry"
                    value={featureId}
                    onChange={(e) => setFeatureId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none uppercase"
                  />
                  {!editingFeatureId && (
                    <span className="text-[8px] text-gray-400 block font-sans">Lowercases, underscores only.</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Display Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Telemetry Router"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Suite Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none rounded-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()} Suite</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Parent Node Feature (Optional)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none rounded-none"
                  >
                    <option value="">-- Set as Root Node --</option>
                    {menuFeatures.filter(f => !f.parentId && f.featureId !== editingFeatureId).map(f => (
                      <option key={f.featureId} value={f.featureId}>[{f.category.toUpperCase()}] {f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Routing Path Trigger (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. /rpn"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none lowercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[9px] block font-bold">Capability Description</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Detail access permissions unlocked by this route..."
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
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none rounded-none font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5A00] hover:bg-[#1A1A1A] text-white py-3 uppercase font-bold text-center tracking-wider transition-colors rounded-none mt-4 cursor-pointer"
                >
                  Commit Feature Specs
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
