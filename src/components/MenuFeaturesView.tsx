import React, { useState } from 'react';
import { 
  FolderPlus, 
  Layers, 
  Trash2, 
  Edit2, 
  Plus, 
  HelpCircle, 
  Terminal, 
  FolderTree,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Sliders,
  Sparkles
} from 'lucide-react';
import { MenuFeature } from '../types';

interface MenuFeaturesViewProps {
  menuFeatures: MenuFeature[];
  onAddMenuFeature: (feature: MenuFeature) => void;
  onUpdateMenuFeature: (feature: MenuFeature) => void;
  onDeleteMenuFeature: (id: string) => void;
  currentAdmin: any;
}

export default function MenuFeaturesView({
  menuFeatures,
  onAddMenuFeature,
  onUpdateMenuFeature,
  onDeleteMenuFeature,
  currentAdmin
}: MenuFeaturesViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [id, setId] = useState('');
  const [label, setLabel] = useState('');
  const [parentId, setParentId] = useState('');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MenuFeature['category']>('General');

  // Filter Category State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Core menus that cannot be deleted to prevent locking out the system
  const SYSTEM_LOCKED_FEATURES = [
    'dashboard', 'vendors', 'plans', 'pos', 'apps', 
    'activations', 'rpn', 'finance', 'staff_roles', 'menu_features',
    'settings', 'notifications'
  ];

  const categories: MenuFeature['category'][] = ['General', 'Licensing', 'Operations', 'Security'];

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setId('');
    setLabel('');
    setParentId('');
    setPath('');
    setDescription('');
    setCategory('General');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (feat: MenuFeature) => {
    setEditingId(feat.id);
    setId(feat.id);
    setLabel(feat.label);
    setParentId(feat.parentId || '');
    setPath(feat.path || '');
    setDescription(feat.description || '');
    setCategory(feat.category);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !label.trim()) {
      alert('Feature Key ID and Title are required.');
      return;
    }

    const featureData: MenuFeature = {
      id: id.trim().toLowerCase().replace(/\s+/g, '_'),
      label: label.trim(),
      parentId: parentId.trim() || undefined,
      path: path.trim() || undefined,
      description: description.trim(),
      category
    };

    if (editingId) {
      onUpdateMenuFeature(featureData);
    } else {
      // Check for duplicate ID
      if (menuFeatures.some(f => f.id === featureData.id)) {
        alert('A feature with this Key ID already exists.');
        return;
      }
      onAddMenuFeature(featureData);
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDelete = (featId: string) => {
    if (SYSTEM_LOCKED_FEATURES.includes(featId)) {
      alert(`Access Denied: "${featId}" is a system-critical core node and cannot be deleted.`);
      return;
    }
    if (confirm(`Are you sure you want to delete the menu feature "${featId}"? This will immediately remove access for any desks assigned to it.`)) {
      onDeleteMenuFeature(featId);
    }
  };

  // Group by category, then find parent-child relationships
  const filteredFeatures = menuFeatures.filter(f => 
    selectedCategory === 'All' ? true : f.category === selectedCategory
  );

  // Separate parent and children nodes
  const rootNodes = filteredFeatures.filter(f => !f.parentId);
  const childNodes = filteredFeatures.filter(f => f.parentId);

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="bg-white border-4 border-[#1A1A1A] p-6 shadow-md relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[#FF5A00] text-[10px] font-mono font-bold uppercase tracking-widest">
              <FolderTree className="w-4 h-4" />
              <span>PLATFORM SPECIFICATION SCHEMAS</span>
            </div>
            <h1 className="text-xl font-bold uppercase text-[#1A1A1A] tracking-tight">
              Menu Features & Capabilities Registry
            </h1>
            <p className="text-xs text-gray-500 max-w-2xl font-sans leading-relaxed">
              Define hierarchical app menu routes, features, and capabilities. These schema definitions represent the "Menu Tree" from which system desks draw their dynamic operational access boundaries.
            </p>
          </div>
          <button
            onClick={handleOpenCreateForm}
            className="bg-[#1A1A1A] hover:bg-[#FF5A00] text-white py-2.5 px-4 uppercase font-bold text-xs tracking-wider transition-all rounded-none flex items-center justify-center space-x-2 shrink-0 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Menu Feature</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Config Form & Tree Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Category Filters & Directory list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border-2 border-[#1A1A1A] p-4">
            <h3 className="text-xs font-mono font-bold text-[#1a1a1a] uppercase tracking-wider mb-3 border-b pb-1.5 border-[#D1D1CF]">
              Feature Category Filter
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex justify-between items-center ${
                  selectedCategory === 'All' 
                    ? 'bg-[#1A1A1A] text-white font-bold' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <span>ALL CAPABILITIES</span>
                <span className="text-[10px] bg-gray-200 text-gray-800 px-1.5 rounded-none font-bold">
                  {menuFeatures.length}
                </span>
              </button>
              {categories.map(cat => {
                const count = menuFeatures.filter(f => f.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex justify-between items-center ${
                      selectedCategory === cat 
                        ? 'bg-[#1A1A1A] text-white font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <span>{cat} SUITE</span>
                    <span className="text-[10px] bg-gray-200 text-gray-800 px-1.5 rounded-none font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Modal/Section inside layout */}
          {isFormOpen && (
            <div className="bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] p-5 shadow-lg relative">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#2D2D2D]">
                <span className="text-xs font-mono text-[#FF5A00] font-bold uppercase tracking-wider">
                  {editingId ? 'Edit Capability Mode' : 'New Capability Protocol'}
                </span>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-white font-bold text-xs uppercase"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold block">UNIQUE FEATURE ID KEY</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingId}
                    placeholder="e.g. pos_refunds"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-gray-700 p-2 text-xs text-white focus:outline-none focus:border-[#FF5A00] placeholder-gray-500 rounded-none uppercase"
                  />
                  {!editingId && (
                    <span className="text-[8px] text-gray-500 block leading-tight">
                      System Key. Lowercase, underscores only.
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold block">DISPLAY TITLE LABEL</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POS Transaction Refunds"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-gray-700 p-2 text-xs text-white focus:outline-none focus:border-[#FF5A00] placeholder-gray-500 rounded-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold block">SUITE CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MenuFeature['category'])}
                    className="w-full bg-[#2D2D2D] border border-gray-700 p-2 text-xs text-white focus:outline-none focus:border-[#FF5A00] rounded-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat} Suite</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold block">PARENT FEATURE (OPTIONAL TREE BIND)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-gray-700 p-2 text-xs text-white focus:outline-none focus:border-[#FF5A00] rounded-none"
                  >
                    <option value="">-- Set as Root Node --</option>
                    {menuFeatures.filter(f => !f.parentId && f.id !== editingId).map(f => (
                      <option key={f.id} value={f.id}>
                        [{f.category.toUpperCase()}] {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold block">TAB PATH / ROUTE TRIGGER</label>
                  <input
                    type="text"
                    placeholder="e.g. dashboard (optional)"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-gray-700 p-2 text-xs text-white focus:outline-none focus:border-[#FF5A00] placeholder-gray-500 rounded-none lowercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase font-bold block">CAPABILITY DESCRIPTION</label>
                  <textarea
                    rows={2}
                    placeholder="Detail the operational capabilities unlocked by this menu route..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-gray-700 p-2 text-xs text-white focus:outline-none focus:border-[#FF5A00] placeholder-gray-500 rounded-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5A00] hover:bg-white hover:text-[#1A1A1A] text-white py-2 uppercase font-black text-xs tracking-wider transition-all rounded-none"
                >
                  {editingId ? 'COMMIT CAPABILITY MOD' : 'INITIALIZE CAPABILITY'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Columns: Menu Tree Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#D1D1CF]">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#FF5A00]" />
                <h2 className="text-sm font-mono font-black text-[#1A1A1A] uppercase tracking-wider">
                  Menu Tree Hierarchy & Capability Schema
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-orange-100 text-[#FF5A00] px-2 py-0.5 uppercase font-bold">
                Category: {selectedCategory}
              </span>
            </div>

            {rootNodes.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic text-xs font-mono uppercase">
                No matching root elements found for the selected category.
              </div>
            ) : (
              <div className="space-y-4">
                {rootNodes.map(root => {
                  const children = childNodes.filter(c => c.parentId === root.id);
                  const isLocked = SYSTEM_LOCKED_FEATURES.includes(root.id);

                  return (
                    <div key={root.id} className="border border-[#D1D1CF] p-4 bg-[#F9F9F7] hover:border-[#1A1A1A] transition-all relative">
                      {/* Top bar of Root Node */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold uppercase text-[#1A1A1A] flex items-center">
                              {root.label}
                            </span>
                            <span className="text-[9px] font-mono bg-[#1A1A1A] text-white px-1.5 py-0.2 uppercase">
                              {root.id}
                            </span>
                            <span className={`text-[8px] font-mono px-1 border uppercase font-bold ${
                              root.category === 'Security' ? 'bg-red-50 text-red-700 border-red-200' :
                              root.category === 'Operations' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              root.category === 'Licensing' ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {root.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-sans">{root.description || 'No description provided.'}</p>
                          {root.path && (
                            <div className="text-[10px] font-mono text-[#FF5A00] uppercase">
                              Route Bind: <span className="font-bold underline">{root.path}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditForm(root)}
                            className="p-1.5 border border-[#D1D1CF] hover:border-[#1A1A1A] bg-white text-gray-600 hover:text-black transition-colors"
                            title="Edit Node Schema"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(root.id)}
                            disabled={isLocked}
                            className={`p-1.5 border transition-colors ${
                              isLocked 
                                ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed' 
                                : 'border-[#D1D1CF] hover:border-red-600 hover:bg-red-50 text-gray-600 hover:text-red-600'
                            }`}
                            title={isLocked ? 'Core lock: Protected System Node' : 'Delete Node'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Children / Leaf Nodes Tree */}
                      {children.length > 0 && (
                        <div className="mt-4 pl-6 border-l-2 border-dashed border-[#D1D1CF] space-y-3 pt-2">
                          <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                            Child Nodes / Sub-Capabilities
                          </div>
                          {children.map(child => {
                            const isChildLocked = SYSTEM_LOCKED_FEATURES.includes(child.id);
                            return (
                              <div key={child.id} className="bg-white border border-[#D1D1CF] p-3 flex items-start justify-between hover:border-[#1A1A1A] transition-all">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1.5">
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-bold text-[#1A1A1A]">{child.label}</span>
                                    <span className="text-[8px] font-mono bg-gray-100 text-gray-600 px-1">
                                      {child.id}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 font-sans pl-5">
                                    {child.description || 'No description provided.'}
                                  </p>
                                  {child.path && (
                                    <div className="text-[9px] font-mono text-[#FF5A00] uppercase pl-5">
                                      Route Bind: <span className="font-bold underline">{child.path}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    onClick={() => handleOpenEditForm(child)}
                                    className="p-1 border border-[#D1D1CF] hover:border-[#1A1A1A] bg-white text-gray-600 hover:text-black transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(child.id)}
                                    disabled={isChildLocked}
                                    className={`p-1 border transition-colors ${
                                      isChildLocked 
                                        ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed' 
                                        : 'border-[#D1D1CF] hover:border-red-600 hover:bg-red-50 text-gray-600 hover:text-red-600'
                                    }`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
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
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
