import React, { useState, useMemo, useEffect } from 'react';
import { useLifecycle } from '../App';
import { useNavigate } from 'react-router-dom';
import { runSCIDiagnostics } from '../diagnostics';
import { 
  Users, 
  Key, 
  Terminal, 
  Coins, 
  Activity, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  ClipboardList, 
  Grid,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  Database,
  Bell,
  Cpu,
  Layers,
  Settings,
  AlertTriangle,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface CommandQueueItem {
  id: string;
  type: 'vendor_approval' | 'awaiting_license' | 'license_expiring' | 'rpn_target' | 'finance_collection' | 'staff_alert' | 'diagnostics_warning';
  title: string;
  desc: string;
  priority: 'High' | 'Medium' | 'Low';
  workspacePath: string;
  reviewed: boolean;
}

export default function DashboardView() {
  const { 
    vendors, 
    setVendors, 
    posLicenses, 
    setPosLicenses, 
    rpnAgents, 
    activeStaffSession, 
    workspaceAuditEvents, 
    onAddWorkspaceAuditEvent,
    workspaceNotifications, 
    onMarkWorkspaceNotificationRead,
    financeRecords,
    workflows,
    onAddWorkflow
  } = useLifecycle();

  const navigate = useNavigate();

  // Log dashboard open event
  useEffect(() => {
    onAddWorkspaceAuditEvent({
      workspaceId: 'home',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'DASHBOARD_OPEN',
      targetType: 'dashboard',
      targetId: 'executive_dashboard',
      result: 'success',
      message: 'Executive command dashboard opened.'
    });
  }, []);

  // Diagnostics check engine
  const diagnosticsResults = useMemo(() => runSCIDiagnostics(), []);
  const passedDiagnostics = diagnosticsResults.filter(r => r.passed).length;
  const failedDiagnostics = diagnosticsResults.length - passedDiagnostics;

  // Environment Mode
  const envModeStr = localStorage.getItem('sci_environment_mode') || 'prototype';

  // 1. Dynamic KPI values
  const kpiData = useMemo(() => {
    const totalVnd = vendors.length;
    const activeVnd = vendors.filter(v => v.status === 'Active').length;
    const pendingAct = vendors.filter(v => v.status === 'Pending Verification').length;
    const activeLics = posLicenses.filter(l => l.status === 'Active').length;
    const demoVnd = vendors.filter(v => v.assignedPlanId === 'VENDOR_DEMO').length;

    // Monthly revenue MRR
    const activePaidVendors = vendors.filter(v => v.status === 'Active');
    const plansCost = activePaidVendors.reduce((acc, curr) => {
      if (curr.assignedPlanId === 'PLN-POS-STARTER') return acc + 49;
      if (curr.assignedPlanId === 'PLN-POS-GROWTH') return acc + 99;
      if (curr.assignedPlanId === 'PLN-POS-PRO') return acc + 199;
      if (curr.assignedPlanId === 'PLN-POS-BUSPLUS') return acc + 299;
      if (curr.assignedPlanId === 'PLN-ENT-COMMERCE') return acc + 899;
      return acc;
    }, 0);
    const mrr = plansCost + 1500; // adding seed module/capacity revenue

    const rpnCount = rpnAgents.length;
    
    // Expiring licenses in 30 days
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringLics = posLicenses.filter(l => {
      const exp = new Date(l.expiryDate);
      return l.status === 'Active' && exp > new Date() && exp <= thirtyDaysFromNow;
    }).length;

    // Overdue renewals amount
    const overdueRenewals = financeRecords
      ? financeRecords
          .filter(r => r.paymentStatus === 'Overdue')
          .reduce((acc, curr) => acc + curr.amount, 0)
      : 249;

    const unreadNotifications = workspaceNotifications.filter(n => !n.read).length;

    return { totalVnd, activeVnd, pendingAct, activeLics, demoVnd, mrr, rpnCount, expiringLics, overdueRenewals, unreadNotifications };
  }, [vendors, posLicenses, rpnAgents, financeRecords, workspaceNotifications]);

  // 2. Command queue items state (with hide/complete actions)
  const [commandQueue, setCommandQueue] = useState<CommandQueueItem[]>(() => {
    return [
      { id: 'Q-001', type: 'vendor_approval', title: 'Pending Vendor Approval', desc: 'AtomiCo QuickShop is awaiting license credentials approval.', priority: 'High', workspacePath: '/vendors', reviewed: false },
      { id: 'Q-002', type: 'awaiting_license', title: 'Vendor Awaiting License', desc: 'KronoMart Hardware is active but has no bound licenses.', priority: 'High', workspacePath: '/pos', reviewed: false },
      { id: 'Q-003', type: 'license_expiring', title: 'POS License Expiring', desc: 'License POS-LIC-3310 will expire within 7 days.', priority: 'Medium', workspacePath: '/pos', reviewed: false },
      { id: 'Q-004', type: 'rpn_target', title: 'RPN Target Behind', desc: 'Virginia-Delta Agent is at 40% target fulfillment for Q3.', priority: 'Medium', workspacePath: '/rpn', reviewed: false },
      { id: 'Q-005', type: 'finance_collection', title: 'Finance Collections Due', desc: 'Vendor Vanguard Outpost has outstanding overdue billing balance.', priority: 'High', workspacePath: '/finance', reviewed: false },
      { id: 'Q-006', type: 'staff_alert', title: 'Staff Access Flagged', desc: 'Operator switched desk access with pending notifications queue.', priority: 'Low', workspacePath: '/staff', reviewed: false },
      { id: 'Q-007', type: 'diagnostics_warning', title: 'Diagnostics Checks Failed', desc: 'Capacity enforcement suite reported 1 unresolved alert.', priority: 'Medium', workspacePath: '/diagnostics', reviewed: false }
    ];
  });

  const handleMarkQueueReviewed = (id: string) => {
    setCommandQueue(prev => prev.map(item => item.id === id ? { ...item, reviewed: true } : item));
    
    onAddWorkspaceAuditEvent({
      workspaceId: 'home',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'QUEUE_ITEM_REVIEW',
      targetType: 'queue',
      targetId: id,
      result: 'success',
      message: `Marked command queue item ${id} as reviewed.`
    });
  };

  const handleCreateWorkflow = (item: CommandQueueItem) => {
    onAddWorkflow({
      workflowType: 'vendor_activation',
      title: `Queue Action: ${item.title}`,
      description: item.desc,
      status: 'pending',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: item.id,
      targetType: 'queue_item',
      currentStep: 1,
      totalSteps: 3
    });
    alert(`Workflow created successfully for prioritized item: ${item.title}`);
  };

  // 3. Operating System Health states
  const osHealthPanels = useMemo(() => {
    return [
      { id: 'vendor_ops', name: 'Vendor Operations', status: 'Operational', tasks: vendors.filter(v => v.status === 'Pending Verification').length, alerts: 0, path: '/vendors' },
      { id: 'licensing', name: 'Licensing Centre', status: 'Operational', tasks: posLicenses.filter(l => l.status === 'Pending').length, alerts: kpiData.expiringLics, path: '/plans' },
      { id: 'commercial', name: 'Commercial Desk', status: 'Operational', tasks: 0, alerts: 0, path: '/capacity' },
      { id: 'internal_admin', name: 'Internal Admin', status: 'Operational', tasks: 0, alerts: 0, path: '/staff' },
      { id: 'rpn_ops', name: 'RPN Operations', status: 'Operational', tasks: 0, alerts: 0, path: '/rpn' },
      { id: 'finance', name: 'Finance Control', status: 'Degraded', tasks: 2, alerts: financeRecords ? financeRecords.filter(r => r.paymentStatus === 'Overdue').length : 1, path: '/finance' },
      { id: 'platform', name: 'Platform Core', status: 'Operational', tasks: 0, alerts: failedDiagnostics, path: '/diagnostics' }
    ];
  }, [vendors, posLicenses, kpiData, financeRecords, failedDiagnostics]);

  // 4. Growth Funnel values
  const funnelData = useMemo(() => {
    const prospect = vendors.filter(v => v.status === 'Prospect' || v.status === 'Contacted').length || 2;
    const demo = vendors.filter(v => v.assignedPlanId === 'VENDOR_DEMO').length;
    const request = vendors.filter(v => v.status === 'Pending Verification').length;
    const approved = vendors.filter(v => v.status === 'Approved').length;
    const licensed = vendors.filter(v => !!v.licenseKey).length;
    const active = vendors.filter(v => v.status === 'Active').length;

    return { prospect, demo, request, approved, licensed, active };
  }, [vendors]);

  // 5. Activity Feed
  const recentActivities = useMemo(() => {
    return workspaceAuditEvents.slice(0, 15);
  }, [workspaceAuditEvents]);

  // Shortcut triggers
  const handleShortcutClick = (path: string) => {
    onAddWorkspaceAuditEvent({
      workspaceId: 'home',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'WORKSPACE_SHORTCUT_CLICK',
      targetType: 'shortcut',
      targetId: path,
      result: 'success',
      message: `Clicked workspace shortcut to ${path}.`
    });
    navigate(path);
  };

  return (
    <div className="space-y-6 font-mono text-left text-[#1A1A1A]">
      
      {/* 1. EXECUTIVE COMMAND KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        
        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Total Vendors</span>
          <span className="text-xl font-sans font-black block mt-1">{kpiData.totalVnd}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Active Vendors</span>
          <span className="text-xl font-sans font-black block mt-1 text-emerald-800">{kpiData.activeVnd}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5A00]" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Pending Activations</span>
          <span className="text-xl font-sans font-black block mt-1 text-[#FF5A00]">{kpiData.pendingAct}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Active POS Licenses</span>
          <span className="text-xl font-sans font-black block mt-1">{kpiData.activeLics}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Demo Vendors</span>
          <span className="text-xl font-sans font-black block mt-1">{kpiData.demoVnd}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Monthly Revenue</span>
          <span className="text-xl font-sans font-black block mt-1">$${kpiData.mrr.toLocaleString()}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">RPN Agents</span>
          <span className="text-xl font-sans font-black block mt-1">{kpiData.rpnCount}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-stone-700" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Staff Sessions</span>
          <span className="text-xl font-sans font-black block mt-1">{activeStaffSession ? 1 : 0}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Diagnostics Status</span>
          <span className="text-xl font-sans font-black block mt-1">
            {passedDiagnostics} / {diagnosticsResults.length}
          </span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-400" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Expiring Licenses</span>
          <span className="text-xl font-sans font-black block mt-1 text-red-500">{kpiData.expiringLics}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Overdue Renewals</span>
          <span className="text-xl font-sans font-black block mt-1 text-red-650">$${kpiData.overdueRenewals}</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">System Alerts</span>
          <span className="text-xl font-sans font-black block mt-1 text-red-650">{kpiData.unreadNotifications}</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Health Panels & funnel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. OPERATING SYSTEM HEALTH */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4 shadow-sm">
            <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
              <span>Operating System Workspace Health</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {osHealthPanels.map(panel => {
                let badge = 'bg-green-50 text-emerald-800 border-green-200';
                if (panel.status === 'Degraded') badge = 'bg-yellow-50 text-yellow-800 border-yellow-200';

                return (
                  <div key={panel.id} className="bg-stone-50 border border-stone-250 p-3 flex flex-col justify-between space-y-3 rounded-none text-[9px] font-bold text-gray-600">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-900 font-sans block">{panel.name}</span>
                        <span className={`border px-1 py-0.2 text-[7px] font-black uppercase ${badge}`}>{panel.status}</span>
                      </div>
                      <div className="text-gray-400 text-[8px] uppercase">Open Tasks: {panel.tasks} • Alerts: {panel.alerts}</div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleShortcutClick(panel.path)}
                      className="w-full py-1 bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white hover:border-transparent text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Open Workspace &rarr;
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. TODAY'S COMMAND QUEUE */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3 shadow-sm">
            <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
              <span>Today's Command Queue Checklist</span>
            </div>

            <div className="space-y-2.5">
              {commandQueue.filter(q => !q.reviewed).map(item => (
                <div key={item.id} className="bg-stone-50 border border-stone-200 p-3 flex justify-between items-center rounded-none text-[8.5px] font-bold text-gray-650">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-950 font-sans">{item.title}</span>
                      <span className={`px-1.5 border text-[7px] font-black uppercase ${
                        item.priority === 'High' ? 'border-red-300 text-red-650 bg-red-50' : 'border-stone-300 text-stone-500 bg-stone-50'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[8.5px] text-gray-500 font-sans leading-normal normal-case font-medium">{item.desc}</p>
                  </div>

                  <div className="flex gap-1.5 text-[8px] font-black uppercase font-mono">
                    <button onClick={() => handleMarkQueueReviewed(item.id)} className="bg-white border border-stone-300 px-2 py-1 hover:border-[#1A1A1A] cursor-pointer">Reviewed</button>
                    <button onClick={() => handleCreateWorkflow(item)} className="bg-white border border-stone-300 px-2 py-1 hover:border-[#1A1A1A] cursor-pointer">Workflow</button>
                    <button onClick={() => handleShortcutClick(item.workspacePath)} className="bg-[#FF5A00] text-white px-2 py-1 cursor-pointer">Open</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: snap shots & funnel & feed */}
        <div className="space-y-6">
          
          {/* 5. VENDOR GROWTH FUNNEL */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3 shadow-sm text-center">
            <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px] text-left">
              <span>Vendor Growth Funnel Metrics</span>
            </div>

            <div className="space-y-1 text-[9px] font-bold uppercase text-gray-500">
              <div className="bg-[#FAF9F6] border border-stone-250 p-2 text-center">
                <span>Prospect Lead ({funnelData.prospect} vendors)</span>
              </div>
              <div className="text-xs text-[#FF5A00] font-sans font-black">&darr;</div>
              
              <div className="bg-[#FAF9F6] border border-stone-250 p-2 text-center">
                <span>Demo Environment ({funnelData.demo} vendors)</span>
              </div>
              <div className="text-xs text-[#FF5A00] font-sans font-black">&darr;</div>

              <div className="bg-[#FAF9F6] border border-stone-250 p-2 text-center">
                <span>Activation Requested ({funnelData.request} vendors)</span>
              </div>
              <div className="text-xs text-[#FF5A00] font-sans font-black">&darr;</div>

              <div className="bg-[#FAF9F6] border border-stone-250 p-2 text-center">
                <span>Verification Approved ({funnelData.approved} vendors)</span>
              </div>
              <div className="text-xs text-[#FF5A00] font-sans font-black">&darr;</div>

              <div className="bg-[#FAF9F6] border border-stone-250 p-2 text-center">
                <span>POS License Issued ({funnelData.licensed} vendors)</span>
              </div>
              <div className="text-xs text-[#FF5A00] font-sans font-black">&darr;</div>

              <div className="bg-orange-50 border border-orange-250 text-[#FF5A00] p-2 text-center">
                <span>Active Vendor ({funnelData.active} vendors)</span>
              </div>
            </div>
          </div>

          {/* 10. EXECUTIVE ACTIVITY FEED */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4 shadow-sm">
            <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
              <span>Executive Cross-Workspace Activity Feed</span>
            </div>

            <div className="relative border-l border-[#D1D1CF] pl-4 ml-2 space-y-4 text-left font-sans">
              {recentActivities.length === 0 ? (
                <div className="text-[9px] text-gray-400 italic uppercase font-mono font-bold">No compliance audit logs logged.</div>
              ) : (
                recentActivities.map(e => (
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

        </div>

      </div>

      {/* 4. REVENUE SNAPSHOT GRAPHS */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left space-y-4 shadow-sm">
        <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
          <span>Ecosystem Revenue & Licensing Snapshot</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MRR Trend */}
          <div className="bg-stone-50 border border-stone-250 p-4 space-y-2">
            <span className="text-[8px] text-gray-400 font-black uppercase">MRR growth trend</span>
            <div className="h-28 flex items-end justify-between border-b border-stone-200 pb-1">
              <div className="w-6 bg-orange-500 h-8" />
              <div className="w-6 bg-orange-500 h-14" />
              <div className="w-6 bg-orange-500 h-20" />
              <div className="w-6 bg-[#FF5A00] h-24" />
            </div>
            <span className="text-[7.5px] text-gray-400 font-bold block mt-1 uppercase">Target MRR run-rate projection.</span>
          </div>

          {/* Plan slabs */}
          <div className="bg-stone-50 border border-stone-250 p-4 space-y-2">
            <span className="text-[8px] text-gray-400 font-black uppercase">Plan slabs distribution</span>
            <div className="flex h-28 items-center justify-around font-mono text-[9px] uppercase font-bold text-gray-500">
              <div className="space-y-1.5 text-[8px]">
                <div className="flex items-center space-x-1.5"><div className="w-2 h-2 bg-orange-500" /><span>Starter POS: 52%</span></div>
                <div className="flex items-center space-x-1.5"><div className="w-2 h-2 bg-emerald-600" /><span>Growth POS: 28%</span></div>
                <div className="flex items-center space-x-1.5"><div className="w-2 h-2 bg-indigo-600" /><span>Enterprise: 20%</span></div>
              </div>
            </div>
          </div>

          {/* System Environment */}
          <div className="bg-stone-50 border border-stone-250 p-4 space-y-2 text-[9px] font-bold text-gray-500 uppercase">
            <span className="text-[8px] text-gray-400 font-black uppercase block">System platform parameters</span>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between">
                <span>Active Mode:</span>
                <span className="text-gray-900">{envModeStr.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Firebase blueprint:</span>
                <span className="text-[#FF5A00]">SCHEMA OK</span>
              </div>
              <div className="flex justify-between">
                <span>Diagnostics runs:</span>
                <span className="text-emerald-800">HEALTHY</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
