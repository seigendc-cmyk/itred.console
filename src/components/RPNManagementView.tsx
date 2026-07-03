import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../App';
import { RPNAgent, Vendor } from '../types';
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Check, 
  X, 
  Layers, 
  MapPin, 
  Calendar,
  AlertCircle,
  Plus,
  Briefcase,
  Search,
  User,
  Sliders,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

interface CommissionRecord {
  id: string;
  agentName: string;
  vendorName: string;
  commissionModel: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Withheld';
  dueDate: string;
  paidDate?: string;
}

const DEFAULT_COMMISSIONS: CommissionRecord[] = [
  { id: 'COM-001', agentName: 'Frankfurt-Alpha Agent', vendorName: 'AtomiCo QuickShop', commissionModel: 'Hybrid', amount: 350, status: 'Paid', dueDate: '2026-06-30', paidDate: '2026-06-28' },
  { id: 'COM-002', agentName: 'Virginia-Delta Agent', vendorName: 'Zephyr Fashion House', commissionModel: 'Per Vendor Commission', amount: 500, status: 'Approved', dueDate: '2026-07-15' },
  { id: 'COM-003', agentName: 'Frankfurt-Alpha Agent', vendorName: 'BioFuel Station S-8', commissionModel: 'Performance Bonus', amount: 1200, status: 'Pending', dueDate: '2026-07-31' },
  { id: 'COM-004', agentName: 'Virginia-Delta Agent', vendorName: 'Vanguard Outpost Ltd', commissionModel: 'Fixed Allowance', amount: 200, status: 'Withheld', dueDate: '2026-07-10' }
];

export default function RPNManagementView() {
  const { 
    rpnAgents, 
    setRpnAgents, 
    vendors, 
    setVendors, 
    activeStaffSession, 
    onAddWorkspaceAuditEvent, 
    onAddWorkspaceActivity,
    onAddWorkspaceNotification,
    workflows,
    onAddWorkflow,
    onUpdateWorkflow
  } = useLifecycle();

  // Active Tab: 'registry' | 'pipeline' | 'commissions'
  const [activeTab, setActiveTab] = useState<'registry' | 'pipeline' | 'commissions'>('registry');

  // Search and selector state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Selected agent for performance / vendor assignments
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => {
    return rpnAgents[0]?.id || '';
  });

  const selectedAgent = useMemo(() => {
    return rpnAgents.find(a => a.id === selectedAgentId) || null;
  }, [rpnAgents, selectedAgentId]);

  // Load / Save Commission records from local storage
  const [commissions, setCommissions] = useState<CommissionRecord[]>(() => {
    const raw = localStorage.getItem('sgn_rpn_commissions');
    if (!raw) return DEFAULT_COMMISSIONS;
    try { return JSON.parse(raw); } catch { return DEFAULT_COMMISSIONS; }
  });

  const saveCommissions = (newComms: CommissionRecord[]) => {
    setCommissions(newComms);
    localStorage.setItem('sgn_rpn_commissions', JSON.stringify(newComms));
  };

  // Modals / Drawer visibility
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLinkVendorOpen, setIsLinkVendorOpen] = useState(false);

  // Form Fields - Create / Edit Agent
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRegion, setFormRegion] = useState('Europe West');
  const [formAssignedArea, setFormAssignedArea] = useState('');
  const [formCommissionModel, setFormCommissionModel] = useState('Hybrid');
  const [formMonthlyTarget, setFormMonthlyTarget] = useState('10 Vendors');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'Connected' | 'Standby' | 'Offline'>('Connected');

  // Form Fields - Link Vendor
  const [linkVendorId, setLinkVendorId] = useState('');
  const [linkStage, setLinkStage] = useState('Prospect');

  // unique regions list
  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(rpnAgents.map(a => a.region)));
  }, [rpnAgents]);

  // RPN Dashboard KPIs
  const kpis = useMemo(() => {
    const activeAgents = rpnAgents.filter(a => a.connectionStatus === 'Connected').length;
    const suspendedAgents = rpnAgents.filter(a => a.connectionStatus === 'Offline').length;
    
    // vendors acquired this month (mock/actual)
    const currentMonthStr = new Date().toISOString().split('-').slice(0,2).join('-');
    const vendorsAcquiredThisMonth = vendors.filter(v => v.linkedRpnId && v.joinedDate?.startsWith(currentMonthStr)).length;

    const pendingLeads = vendors.filter(v => v.status === 'Pending Verification').length;
    const avgConversion = 82.5;
    const targetAcquisition = 50;

    // sum commissions due
    const commissionDue = commissions
      .filter(c => c.status === 'Approved' || c.status === 'Pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const regionsCovered = uniqueRegions.length;

    return { activeAgents, suspendedAgents, vendorsAcquiredThisMonth, pendingLeads, avgConversion, targetAcquisition, commissionDue, regionsCovered };
  }, [rpnAgents, vendors, commissions, uniqueRegions]);

  // Registry Search & Filters
  const filteredAgents = useMemo(() => {
    return rpnAgents.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        a.name.toLowerCase().includes(q) || 
        a.id.toLowerCase().includes(q) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.assignedArea && a.assignedArea.toLowerCase().includes(q)) ||
        (a.region && a.region.toLowerCase().includes(q));

      const matchRegion = filterRegion === 'all' || a.region === filterRegion;
      const matchStatus = filterStatus === 'all' || a.connectionStatus === filterStatus;

      return matchSearch && matchRegion && matchStatus;
    });
  }, [rpnAgents, searchQuery, filterRegion, filterStatus]);

  // Performance breakdown calculations for selected agent
  const performanceStats = useMemo(() => {
    if (!selectedAgent) return null;
    const agentVendors = vendors.filter(v => v.linkedRpnId === selectedAgent.id);

    const acquired = agentVendors.length;
    const approved = agentVendors.filter(v => v.status === 'Active' || v.status === 'Approved').length;
    const rejected = agentVendors.filter(v => v.status === 'Rejected').length;
    const demo = agentVendors.filter(v => v.assignedPlanId === 'VENDOR_DEMO').length;
    const licensed = agentVendors.filter(v => !!v.licenseKey).length;
    
    const conversionRate = acquired > 0 ? Math.round((approved / acquired) * 100) : 0;
    const targetNum = parseInt(selectedAgent.monthlyTarget) || 10;
    const targetAchievement = targetNum > 0 ? Math.round((approved / targetNum) * 100) : 0;

    const commEstimate = commissions
      .filter(c => c.agentName === selectedAgent.name && c.status !== 'Paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return { acquired, approved, rejected, demo, licensed, conversionRate, targetAchievement, commEstimate };
  }, [selectedAgent, vendors, commissions]);

  // Vendor Assignment mappings for selected agent
  const assignedVendors = useMemo(() => {
    if (!selectedAgent) return [];
    return vendors.filter(v => v.linkedRpnId === selectedAgent.id);
  }, [vendors, selectedAgent]);

  // Pipeline Stages grouping
  const pipelineGroups = useMemo(() => {
    const stages = [
      'Prospect', 'Contacted', 'Demo Scheduled', 'Demo Started', 
      'Registration Submitted', 'Pending Verification', 'Approved', 
      'POS Licensed', 'Active Vendor', 'Rejected'
    ];

    const map: Record<string, Vendor[]> = {};
    stages.forEach(st => { map[st] = []; });

    vendors.forEach(v => {
      // derive stage from current vendor properties
      let derivedStage = 'Prospect';
      if (v.status === 'Active') derivedStage = 'Active Vendor';
      else if (v.status === 'Pending Verification') derivedStage = 'Pending Verification';
      else if (v.status === 'Approved') derivedStage = 'Approved';
      else if (v.status === 'Rejected') derivedStage = 'Rejected';
      else if (v.licenseKey) derivedStage = 'POS Licensed';
      else if (v.assignedPlanId === 'VENDOR_DEMO') derivedStage = 'Demo Started';
      else if (v.joinedDate) derivedStage = 'Registration Submitted';

      if (map[derivedStage]) {
        map[derivedStage].push(v);
      } else {
        map['Prospect'].push(v);
      }
    });

    return map;
  }, [vendors]);

  // Operations handlers

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return alert('Name is required.');

    const newId = `AGN-${Math.floor(100 + Math.random() * 900)}`;
    const newAgent: RPNAgent = {
      id: newId,
      name: formName,
      region: formRegion,
      connectionStatus: formStatus,
      activeSessions: 0,
      throughput: '0.0 Tx/s',
      linkedVendorIds: [],
      phone: formPhone || '000-000-0000',
      email: formEmail || 'agent@itred.local',
      assignedArea: formAssignedArea || 'Metropolitan Area',
      monthlyTarget: formMonthlyTarget || '10 Vendors',
      commissionModel: formCommissionModel || 'Hybrid',
      notes: formNotes || '',
      performance: 'On Track',
      conversionRate: 0,
      commissionDue: 0
    };

    const updated = [newAgent, ...rpnAgents];
    setRpnAgents(updated);
    localStorage.setItem('sgn_rpn_agents', JSON.stringify(updated));

    // Register active workflows
    onAddWorkflow({
      workflowType: 'rpn_registration',
      title: `RPN Reg: ${formName}`,
      description: 'Acquisition agent profile created.',
      status: 'completed',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: newId,
      targetType: 'rpn',
      currentStep: 2,
      totalSteps: 2
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'rpn_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'CREATE_RPN',
      targetType: 'rpn',
      targetId: newId,
      result: 'success',
      message: `Created acquisition agent record ${formName} (${newId}).`
    });

    onAddWorkspaceActivity({
      workspaceId: 'rpn_operations',
      type: 'rpn',
      severity: 'info',
      title: 'New RPN Agent Created',
      message: `Agent ${formName} added to region ${formRegion}.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    onAddWorkspaceNotification({
      title: 'RPN Agent Created',
      message: `New acquisition agent ${formName} registered successfully.`,
      type: 'rpn',
      priority: 'normal',
      targetPath: '/rpn',
      workspaceId: 'rpn_operations'
    });

    setSelectedAgentId(newId);
    setIsCreateOpen(false);
  };

  const handleEditAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    const updated = rpnAgents.map(a => {
      if (a.id === selectedAgent.id) {
        return {
          ...a,
          name: formName,
          phone: formPhone,
          email: formEmail,
          region: formRegion,
          assignedArea: formAssignedArea,
          commissionModel: formCommissionModel,
          monthlyTarget: formMonthlyTarget,
          notes: formNotes,
          connectionStatus: formStatus
        };
      }
      return a;
    });

    setRpnAgents(updated);
    localStorage.setItem('sgn_rpn_agents', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'rpn_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'EDIT_RPN',
      targetType: 'rpn',
      targetId: selectedAgent.id,
      result: 'success',
      message: `Updated settings for acquisition agent ${selectedAgent.name}.`
    });

    setIsEditOpen(false);
  };

  const handleSuspendAgent = () => {
    if (!selectedAgent) return;

    const updated = rpnAgents.map(a => a.id === selectedAgent.id ? { ...a, connectionStatus: 'Offline' as const } : a);
    setRpnAgents(updated);
    localStorage.setItem('sgn_rpn_agents', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'rpn_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'SUSPEND_RPN',
      targetType: 'rpn',
      targetId: selectedAgent.id,
      result: 'success',
      message: `Suspended operations clearance for acquisition agent ${selectedAgent.name}.`
    });

    onAddWorkspaceNotification({
      title: 'Agent Suspended',
      message: `Acquisition agent ${selectedAgent.name} has been suspended.`,
      type: 'rpn',
      priority: 'high',
      targetPath: '/rpn',
      workspaceId: 'rpn_operations'
    });

    alert('Agent operations suspended.');
  };

  const handleReactivateAgent = () => {
    if (!selectedAgent) return;

    const updated = rpnAgents.map(a => a.id === selectedAgent.id ? { ...a, connectionStatus: 'Connected' as const } : a);
    setRpnAgents(updated);
    localStorage.setItem('sgn_rpn_agents', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'rpn_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'REACTIVATE_RPN',
      targetType: 'rpn',
      targetId: selectedAgent.id,
      result: 'success',
      message: `Reactivated operations clearance for acquisition agent ${selectedAgent.name}.`
    });

    onAddWorkspaceNotification({
      title: 'Agent Reactivated',
      message: `Acquisition agent ${selectedAgent.name} has been reactivated.`,
      type: 'rpn',
      priority: 'normal',
      targetPath: '/rpn',
      workspaceId: 'rpn_operations'
    });

    alert('Agent operations reactivated.');
  };

  const handleLinkVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !linkVendorId) return;

    const vendor = vendors.find(v => v.id === linkVendorId);
    if (!vendor) return;

    // Update vendor linked agent reference
    const updatedVendors = vendors.map(v => {
      if (v.id === vendor.id) {
        return {
          ...v,
          linkedRpnId: selectedAgent.id,
          linkedRpnName: selectedAgent.name
        };
      }
      return v;
    });

    setVendors(updatedVendors);
    localStorage.setItem('sgn_vendors', JSON.stringify(updatedVendors));

    // Register active workflow
    onAddWorkflow({
      workflowType: 'vendor_activation',
      title: `Assign RPN: ${vendor.name}`,
      description: `Vendor linked to acquisition agent ${selectedAgent.name}.`,
      status: 'completed',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: vendor.id,
      targetType: 'vendor',
      currentStep: 2,
      totalSteps: 5
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'rpn_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'ASSIGN_VENDOR',
      targetType: 'rpn',
      targetId: selectedAgent.id,
      result: 'success',
      message: `Linked vendor ${vendor.name} to acquisition agent ${selectedAgent.name}.`
    });

    onAddWorkspaceNotification({
      title: 'Vendor Linked to RPN',
      message: `Vendor ${vendor.name} has been assigned to agent ${selectedAgent.name}.`,
      type: 'rpn',
      priority: 'normal',
      targetPath: '/rpn',
      workspaceId: 'rpn_operations'
    });

    setIsLinkVendorOpen(false);
    alert('Vendor successfully linked.');
  };

  const handleApproveCommission = (comId: string) => {
    const updated = commissions.map(c => c.id === comId ? { ...c, status: 'Approved' as const } : c);
    saveCommissions(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'rpn_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'APPROVE_COMMISSION',
      targetType: 'commission',
      targetId: comId,
      result: 'success',
      message: `Approved payout allocation commission invoice ${comId}.`
    });

    alert('Commission payout approved.');
  };

  const handlePayCommission = (comId: string) => {
    const updated = commissions.map(c => c.id === comId ? { ...c, status: 'Paid' as const, paidDate: new Date().toISOString().split('T')[0] } : c);
    saveCommissions(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'rpn_operations',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'MARK_COMMISSION_PAID',
      targetType: 'commission',
      targetId: comId,
      result: 'success',
      message: `Marked commission invoice ${comId} as paid.`
    });

    alert('Commission payout completed.');
  };

  return (
    <div className="space-y-6 select-none font-mono text-[#1A1A1A]">
      
      {/* Header Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#D1D1CF] pb-4">
        <div className="text-left">
          <h1 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] font-sans">
            Independent RPN operations Enclave
          </h1>
          <p className="text-[10px] text-gray-500 font-medium font-sans">
            Manage acquisition agents (RPN), track onboarding pipelines, verify commission models, and trace regions limits.
          </p>
        </div>

        <div className="flex border-2 border-[#1A1A1A] bg-white text-[9px] font-black uppercase rounded-none">
          {(['registry', 'pipeline', 'commissions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 cursor-pointer transition-all border-r border-[#1A1A1A] last:border-none ${
                activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F4F4F1] text-gray-700 bg-transparent'
              }`}
            >
              {tab === 'registry' ? 'Agent Registry' : tab === 'pipeline' ? 'Acquisition Pipeline' : 'Commission Tracker'}
            </button>
          ))}
        </div>
      </div>

      {/* RPN DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5A00]" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Active RPN Agents</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">{kpis.activeAgents}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Live verified acquisers</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Suspended Agents</span>
          <span className="text-xl font-sans font-black text-red-600 block mt-1">{kpis.suspendedAgents}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Disabled credentials</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Acquired (This Month)</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">{kpis.vendorsAcquiredThisMonth}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Onboarded merchants</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Commission Pool Due</span>
          <span className="text-xl font-sans font-black text-gray-900 block mt-1">$${kpis.commissionDue.toLocaleString()}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Awaiting audit approvals</span>
        </div>
      </div>

      {/* TAB 1: RPN AGENT REGISTRY & PERFORMANCE */}
      {activeTab === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Registry Table (Col span 2) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            
            {/* Search/Filters */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by agent name, email, region..."
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 pl-9 text-xs focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase tracking-wider"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="bg-white border-2 border-[#1A1A1A] p-1.5 text-[9px] font-black focus:outline-none uppercase cursor-pointer rounded-none"
                >
                  <option value="all">All Regions</option>
                  {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border-2 border-[#1A1A1A] p-1.5 text-[9px] font-black focus:outline-none uppercase cursor-pointer rounded-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Connected">Connected</option>
                  <option value="Standby">Standby</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Registry table */}
            <div className="bg-white border-2 border-[#1A1A1A] overflow-hidden">
              
              <div className="bg-[#FAF9F6] border-b border-[#1A1A1A] p-2.5 flex justify-between items-center text-[9px] font-black uppercase text-gray-500">
                <span>RPN Agents registry ledger</span>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setFormName('');
                      setFormPhone('');
                      setFormEmail('');
                      setFormRegion('Europe West');
                      setFormAssignedArea('');
                      setFormCommissionModel('Hybrid');
                      setFormMonthlyTarget('10 Vendors');
                      setFormNotes('');
                      setFormStatus('Connected');
                      setIsCreateOpen(true);
                    }}
                    className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                  >
                    Create Agent
                  </button>

                  {selectedAgent && (
                    <>
                      <button
                        onClick={() => {
                          setFormName(selectedAgent.name);
                          setFormPhone(selectedAgent.phone || '');
                          setFormEmail(selectedAgent.email || '');
                          setFormRegion(selectedAgent.region);
                          setFormAssignedArea(selectedAgent.assignedArea || '');
                          setFormCommissionModel(selectedAgent.commissionModel || 'Hybrid');
                          setFormMonthlyTarget(selectedAgent.monthlyTarget || '10 Vendors');
                          setFormNotes(selectedAgent.notes || '');
                          setFormStatus(selectedAgent.connectionStatus);
                          setIsEditOpen(true);
                        }}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                      >
                        Edit
                      </button>

                      {selectedAgent.connectionStatus === 'Offline' ? (
                        <button onClick={handleReactivateAgent} className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer">Reactivate</button>
                      ) : (
                        <button onClick={handleSuspendAgent} className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer">Suspend</button>
                      )}

                      <button
                        onClick={() => {
                          setLinkVendorId(vendors[0]?.id || '');
                          setIsLinkVendorOpen(true);
                        }}
                        className="bg-[#FF5A00] text-white hover:bg-[#1A1A1A] px-2 py-1 text-[8px] font-black uppercase cursor-pointer border border-transparent"
                      >
                        Link Vendor
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[9px] font-mono">
                  <thead>
                    <tr className="bg-stone-50 border-b border-[#1A1A1A] uppercase font-bold text-[8px] tracking-wider text-gray-500">
                      <th className="p-3 border-r border-gray-200">RPN ID</th>
                      <th className="p-3 border-r border-gray-200">Full Name</th>
                      <th className="p-3 border-r border-gray-200">Phone</th>
                      <th className="p-3 border-r border-gray-200">Email</th>
                      <th className="p-3 border-r border-gray-200">Region</th>
                      <th className="p-3 border-r border-gray-200">Assigned Area</th>
                      <th className="p-3 border-r border-gray-200">Model</th>
                      <th className="p-3 border-r border-gray-200">Target</th>
                      <th className="p-3 border-r border-gray-200">Acquired</th>
                      <th className="p-3 border-r border-gray-200">Due</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map(a => {
                      const isSelected = selectedAgentId === a.id;
                      const agentVendors = vendors.filter(v => v.linkedRpnId === a.id);
                      
                      let badge = 'bg-stone-100 text-stone-850 border-stone-300';
                      if (a.connectionStatus === 'Connected') badge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                      else if (a.connectionStatus === 'Offline') badge = 'bg-red-50 text-red-800 border-red-300';

                      return (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedAgentId(a.id)}
                          className={`border-b border-gray-150 hover:bg-[#FAF9F6] transition-colors cursor-pointer ${
                            isSelected ? 'bg-orange-50/40 font-bold' : ''
                          }`}
                        >
                          <td className="p-3 border-r border-gray-200 font-bold text-gray-450">{a.id}</td>
                          <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{a.name}</td>
                          <td className="p-3 border-r border-gray-200">{a.phone || '—'}</td>
                          <td className="p-3 border-r border-gray-200 normal-case">{a.email || '—'}</td>
                          <td className="p-3 border-r border-gray-200 text-[8px] uppercase">{a.region}</td>
                          <td className="p-3 border-r border-gray-200 text-gray-650">{a.assignedArea || '—'}</td>
                          <td className="p-3 border-r border-gray-200 text-[8px] uppercase text-gray-500">{a.commissionModel || 'Hybrid'}</td>
                          <td className="p-3 border-r border-gray-200 font-sans">{a.monthlyTarget || '10'}</td>
                          <td className="p-3 border-r border-gray-200 text-center font-bold text-gray-800">{agentVendors.length}</td>
                          <td className="p-3 border-r border-gray-200 font-bold text-emerald-700">$${a.commissionDue || 0}</td>
                          <td className="p-3">
                            <span className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${badge}`}>
                              {a.connectionStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

          {/* Performance & Assignments side view (Col span 1) */}
          <div className="lg:col-span-1 space-y-4 text-left">
            
            {selectedAgent && performanceStats ? (
              <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm space-y-4">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
                
                <div className="border-b border-[#D1D1CF] pb-2">
                  <span className="text-[#FF5A00] font-black uppercase text-[10px] block">Agent Performance: {selectedAgent.name}</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Slab Model: {selectedAgent.commissionModel}</span>
                </div>

                {/* Metric grid */}
                <div className="grid grid-cols-2 gap-3 text-[9px] uppercase font-bold text-gray-500">
                  <div className="bg-[#FAF9F6] border border-stone-250 p-2.5">
                    <span className="block text-[7.5px] text-gray-400">Total Acquired</span>
                    <span className="text-gray-900 text-sm block font-sans font-black mt-0.5">{performanceStats.acquired}</span>
                  </div>
                  <div className="bg-[#FAF9F6] border border-stone-250 p-2.5">
                    <span className="block text-[7.5px] text-gray-400">Target Achievement</span>
                    <span className="text-[#FF5A00] text-sm block font-sans font-black mt-0.5">{performanceStats.targetAchievement}%</span>
                  </div>
                  <div className="bg-[#FAF9F6] border border-stone-250 p-2.5">
                    <span className="block text-[7.5px] text-gray-400">Approved Clearance</span>
                    <span className="text-emerald-700 text-sm block font-sans font-black mt-0.5">{performanceStats.approved}</span>
                  </div>
                  <div className="bg-[#FAF9F6] border border-stone-250 p-2.5">
                    <span className="block text-[7.5px] text-gray-400">Demo active</span>
                    <span className="text-orange-500 text-sm block font-sans font-black mt-0.5">{performanceStats.demo}</span>
                  </div>
                </div>

                {/* Assigned Merchants Table */}
                <div className="space-y-2 pt-2">
                  <span className="text-gray-400 text-[8px] font-black uppercase block border-b border-stone-150 pb-1">Assigned merchant accounts ({assignedVendors.length})</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {assignedVendors.length === 0 ? (
                      <span className="text-gray-400 text-[8px] italic uppercase block">No merchants linked to agent routing.</span>
                    ) : (
                      assignedVendors.map(v => (
                        <div key={v.id} className="bg-stone-50 border border-stone-200 p-2 flex justify-between items-center rounded-none text-[8.5px] font-bold text-gray-600">
                          <div>
                            <span className="text-gray-900 block font-sans">{v.name}</span>
                            <span className="text-[7.5px] text-gray-400 uppercase mt-0.5 block">{v.assignedPlanName || 'No plan'}</span>
                          </div>
                          <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 uppercase text-[7px] font-black">{v.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-300 p-8 text-center text-gray-400 italic text-[10px] uppercase font-bold">
                Select an agent row from registry table to inspect metric diagnostics.
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: ACQUISITION PIPELINE BOARD */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4 text-left">
          
          <div className="bg-white border-2 border-[#1A1A1A] p-4">
            <h3 className="text-xs font-black uppercase text-gray-800">Acquisition funnel pipeline</h3>
            <p className="text-[9px] text-gray-500 font-medium font-sans mt-0.5 normal-case">Grouped staging track representing lead verification steps before full terminal activation.</p>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-4">
            {Object.keys(pipelineGroups).map(stage => {
              const stageVendors = pipelineGroups[stage];
              return (
                <div key={stage} className="bg-white border-2 border-[#1A1A1A] w-64 shrink-0 p-4 space-y-3 flex flex-col justify-between min-h-[300px]">
                  
                  <div className="space-y-3">
                    <div className="border-b-2 border-[#1A1A1A] pb-1 flex justify-between items-center text-[9px] font-black uppercase text-gray-800">
                      <span>{stage}</span>
                      <span className="bg-stone-100 px-1.5">{stageVendors.length}</span>
                    </div>

                    <div className="space-y-2">
                      {stageVendors.map(v => (
                        <div key={v.id} className="bg-stone-50 border border-stone-200 p-2.5 rounded-none text-[9px] font-bold text-gray-650 space-y-1">
                          <div className="text-gray-900 font-sans">{v.name}</div>
                          <div className="flex justify-between items-center text-[7.5px] text-gray-400">
                            <span>ID: {v.id}</span>
                            <span>{v.joinedDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 3: COMMISSION TRACKER */}
      {activeTab === 'commissions' && (
        <div className="space-y-4 text-left">
          
          {/* Commissions table */}
          <div className="bg-white border-2 border-[#1A1A1A] overflow-hidden">
            
            <div className="bg-[#FAF9F6] border-b border-[#1A1A1A] p-2.5 flex justify-between items-center text-[9px] font-black uppercase text-gray-500">
              <span>Commission payout allocation ledger</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[9px] font-mono">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#1A1A1A] uppercase font-bold text-[8px] tracking-wider text-gray-500">
                    <th className="p-3 border-r border-gray-200">Invoice ID</th>
                    <th className="p-3 border-r border-gray-200">RPN Agent</th>
                    <th className="p-3 border-r border-gray-200">Merchant Client</th>
                    <th className="p-3 border-r border-gray-200">Commission model</th>
                    <th className="p-3 border-r border-gray-200">Allocation Fee</th>
                    <th className="p-3 border-r border-gray-200">Due Date</th>
                    <th className="p-3 border-r border-gray-200">Paid Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(c => {
                    let badge = 'bg-stone-100 text-stone-850 border-stone-300';
                    if (c.status === 'Paid') badge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                    else if (c.status === 'Approved') badge = 'bg-blue-50 text-blue-800 border-blue-300';
                    else if (c.status === 'Withheld') badge = 'bg-red-50 text-red-800 border-red-300';

                    return (
                      <tr key={c.id} className="border-b border-gray-150 hover:bg-[#FAF9F6] transition-colors">
                        <td className="p-3 border-r border-gray-200 font-bold text-gray-450">{c.id}</td>
                        <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{c.agentName}</td>
                        <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{c.vendorName}</td>
                        <td className="p-3 border-r border-gray-200 uppercase text-[8px]">{c.commissionModel}</td>
                        <td className="p-3 border-r border-gray-200 font-bold text-gray-900">$${c.amount}</td>
                        <td className="p-3 border-r border-gray-200 font-mono text-gray-650">{c.dueDate}</td>
                        <td className="p-3 border-r border-gray-200 font-mono text-gray-650">{c.paidDate || '—'}</td>
                        <td className="p-3 flex justify-between items-center gap-2">
                          <span className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${badge}`}>
                            {c.status}
                          </span>
                          
                          <div className="flex gap-1.5 text-[8px] font-black uppercase">
                            {c.status === 'Pending' && (
                              <button onClick={() => handleApproveCommission(c.id)} className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white px-2 py-0.5 cursor-pointer">Approve</button>
                            )}
                            {c.status === 'Approved' && (
                              <button onClick={() => handlePayCommission(c.id)} className="bg-[#FF5A00] text-white px-2 py-0.5 cursor-pointer">Pay</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* CREATE AGENT DRAWER */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleCreateAgent} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase text-[#1A1A1A] border-b border-[#D1D1CF] pb-2">
              Create RPN Agent Clearance
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold normal-case"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Region</label>
                  <input
                    type="text"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Assigned Area</label>
                  <input
                    type="text"
                    value={formAssignedArea}
                    onChange={(e) => setFormAssignedArea(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Commission Model</label>
                  <select
                    value={formCommissionModel}
                    onChange={(e) => setFormCommissionModel(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Fixed Allowance">Fixed Allowance</option>
                    <option value="Per Vendor Commission">Per Vendor Commission</option>
                    <option value="Hybrid">Hybrid Model</option>
                    <option value="Performance Bonus">Performance Bonus</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Acquisition Target</label>
                  <input
                    type="text"
                    value={formMonthlyTarget}
                    onChange={(e) => setFormMonthlyTarget(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Internal Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs h-12 uppercase leading-normal font-bold"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Register Agent
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT AGENT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleEditAgent} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase text-[#1A1A1A] border-b border-[#D1D1CF] pb-2">
              Edit Agent profile
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold normal-case"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Region</label>
                  <input
                    type="text"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Assigned Area</label>
                  <input
                    type="text"
                    value={formAssignedArea}
                    onChange={(e) => setFormAssignedArea(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Commission Model</label>
                  <select
                    value={formCommissionModel}
                    onChange={(e) => setFormCommissionModel(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Fixed Allowance">Fixed Allowance</option>
                    <option value="Per Vendor Commission">Per Vendor Commission</option>
                    <option value="Hybrid">Hybrid Model</option>
                    <option value="Performance Bonus">Performance Bonus</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Acquisition Target</label>
                  <input
                    type="text"
                    value={formMonthlyTarget}
                    onChange={(e) => setFormMonthlyTarget(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
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

      {/* LINK VENDOR DIALOG */}
      {isLinkVendorOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleLinkVendor} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative font-mono text-[#1A1A1A]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase border-b border-[#D1D1CF] pb-2">
              Link vendor to agent
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Select Target Vendor</label>
                <select
                  value={linkVendorId}
                  onChange={(e) => setLinkVendorId(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer font-sans uppercase"
                >
                  {vendors
                    .filter(v => v.linkedRpnId !== selectedAgent?.id)
                    .map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.id})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Acquisition stage</label>
                <select
                  value={linkStage}
                  onChange={(e) => setLinkStage(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                >
                  <option value="Prospect">Prospect</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Demo Scheduled">Demo Scheduled</option>
                  <option value="Demo Started">Demo Started</option>
                  <option value="Approved">Approved</option>
                  <option value="Active Vendor">Active Vendor</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsLinkVendorOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Establish Link
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}