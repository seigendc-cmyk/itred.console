import React from 'react';
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
  Grid 
} from 'lucide-react';
import { AuditLog } from '../types';

interface DashboardStats {
  totalVendors: number;
  pendingActivations: number;
  activePOSLicenses: number;
  revenueThisMonth: string;
  rpnAgentsCount: number;
  pendingVerifications: number;
}

interface DashboardViewProps {
  stats: DashboardStats;
  recentLogs: AuditLog[];
  onQuickAction: (actionId: 'create_vendor' | 'approve_vendor' | 'create_plan' | 'issue_pos' | 'activate_app') => void;
  dashboardType?: string;
}

export default function DashboardView({ stats, recentLogs, onQuickAction, dashboardType = 'executive' }: DashboardViewProps) {
  
  const cards = [
    {
      id: 'stat_total_vendors',
      title: 'Total Vendors',
      value: stats.totalVendors,
      subtext: 'Registered ecosystem merchants',
      icon: Users,
      color: 'border-l-4 border-l-[#1A1A1A]'
    },
    {
      id: 'stat_pending_activations',
      title: 'Pending Activations',
      value: stats.pendingActivations,
      subtext: 'Awaiting node key issuance',
      icon: Key,
      color: 'border-l-4 border-l-[#FF5A00]'
    },
    {
      id: 'stat_active_pos',
      title: 'Active POS Licenses',
      value: stats.activePOSLicenses,
      subtext: 'Operational merchant terminals',
      icon: Terminal,
      color: 'border-l-4 border-l-emerald-600'
    },
    {
      id: 'stat_revenue',
      title: 'Revenue This Month',
      value: stats.revenueThisMonth,
      subtext: 'Aggregated clearing fees',
      icon: Coins,
      color: 'border-l-4 border-l-amber-500'
    },
    {
      id: 'stat_rpn_agents',
      title: 'RPN Agents',
      value: stats.rpnAgentsCount,
      subtext: 'Relay Processing Nodes online',
      icon: Activity,
      color: 'border-l-4 border-l-blue-600'
    },
    {
      id: 'stat_pending_verifications',
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      subtext: 'Requires operational audit',
      icon: ShieldAlert,
      color: 'border-l-4 border-l-rose-600'
    }
  ];

  // Dynamically filter cards based on active desk console dashboardType
  const filteredCards = React.useMemo(() => {
    if (dashboardType === 'sales') {
      return cards.filter(c => c.id === 'stat_revenue' || c.id === 'stat_total_vendors' || c.id === 'stat_active_pos');
    }
    if (dashboardType === 'support') {
      return cards.filter(c => c.id === 'stat_pending_activations' || c.id === 'stat_pending_verifications' || c.id === 'stat_rpn_agents');
    }
    if (dashboardType === 'operations') {
      return cards.filter(c => c.id === 'stat_pending_activations' || c.id === 'stat_rpn_agents' || c.id === 'stat_pending_verifications');
    }
    return cards;
  }, [dashboardType, stats]);

  return (
    <div id="dashboard_view" className="space-y-8">
      {/* View Header */}
      <div id="dashboard_header" className="flex justify-between items-center border-b border-[#D1D1CF] pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider">
            iTred Control Dashboard — {dashboardType} console
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">ECOSYSTEM OPERATIONS METRICS PORTAL — COMPRESSED SCHEMA</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-[#F4F4F1] border border-[#D1D1CF] px-3 py-1.5 text-[#1A1A1A]">
          <span className="w-2.5 h-2.5 bg-green-500 inline-block mr-1"></span>
          <span>NODE CLUSTER: PRIMARY ONLINE</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div id="dashboard_stats_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              id={card.id}
              key={card.title}
              className={`bg-white border border-[#D1D1CF] p-6 flex flex-col justify-between relative shadow-sm rounded-none transition-all hover:translate-y-[-2px] ${card.color}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    {card.title}
                  </span>
                  <span className="text-3xl font-bold font-mono text-[#1A1A1A] block tracking-tight">
                    {card.value}
                  </span>
                </div>
                <div className="p-2 border border-gray-100 bg-[#F4F4F1]">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-sans block">
                  {card.subtext}
                </span>
                {card.title === 'Pending Activations' && stats.pendingActivations > 0 && (
                  <span className="text-[10px] font-mono text-[#FF5A00] font-bold">Action Needed</span>
                )}
              </div>

              {/* Technical corner decor */}
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#1A1A1A]/10" />
            </div>
          );
        })}
      </div>

      {/* Quick Action Panel */}
      <div id="dashboard_quick_actions" className="border border-[#D1D1CF] bg-white p-6 relative">
        {/* Accent corner tag */}
        <div className="absolute top-0 left-0 bg-[#1A1A1A] text-white text-[9px] font-mono px-3 py-0.5 uppercase tracking-wider">
          PRIMARY SYSTEM CONTROL PANEL
        </div>
        
        <div className="mt-2 space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold font-sans text-gray-500 uppercase tracking-widest">
              Standard Operations
            </h2>
          </div>
          
          {/* Action buttons list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <button
              id="action_create_vendor"
              onClick={() => onQuickAction('create_vendor')}
              className="flex flex-col justify-between p-4 bg-[#F4F4F1] border border-transparent hover:border-[#FF5A00] hover:bg-[#FF5A00]/5 text-[#1A1A1A] hover:text-[#FF5A00] transition-all text-left group font-mono h-24 rounded-none cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <Users className="w-4 h-4 text-gray-500 group-hover:text-[#FF5A00]" />
                <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5A00]" />
              </div>
              <div>
                <div className="text-[9px] text-gray-400 uppercase">MERCHANT SETUP</div>
                <div className="text-xs font-bold uppercase tracking-wider">Create Vendor</div>
              </div>
            </button>

            <button
              id="action_approve_vendor"
              onClick={() => onQuickAction('approve_vendor')}
              className="flex flex-col justify-between p-4 bg-[#F4F4F1] border border-transparent hover:border-[#FF5A00] hover:bg-[#FF5A00]/5 text-[#1A1A1A] hover:text-[#FF5A00] transition-all text-left group font-mono h-24 rounded-none cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <CheckCircle2 className="w-4 h-4 text-gray-500 group-hover:text-[#FF5A00]" />
                <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5A00]" />
              </div>
              <div>
                <div className="text-[9px] text-gray-400 uppercase">SECURITY PROTOCOL</div>
                <div className="text-xs font-bold uppercase tracking-wider">Approve Vendor</div>
              </div>
            </button>

            <button
              id="action_create_plan"
              onClick={() => onQuickAction('create_plan')}
              className="flex flex-col justify-between p-4 bg-[#F4F4F1] border border-transparent hover:border-[#FF5A00] hover:bg-[#FF5A00]/5 text-[#1A1A1A] hover:text-[#FF5A00] transition-all text-left group font-mono h-24 rounded-none cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <Grid className="w-4 h-4 text-gray-500 group-hover:text-[#FF5A00]" />
                <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5A00]" />
              </div>
              <div>
                <div className="text-[9px] text-gray-400 uppercase">SUBSCRIPTION MODEL</div>
                <div className="text-xs font-bold uppercase tracking-wider">Create Plan</div>
              </div>
            </button>

            <button
              id="action_issue_pos"
              onClick={() => onQuickAction('issue_pos')}
              className="flex flex-col justify-between p-4 bg-[#F4F4F1] border border-transparent hover:border-[#FF5A00] hover:bg-[#FF5A00]/5 text-[#1A1A1A] hover:text-[#FF5A00] transition-all text-left group font-mono h-24 rounded-none cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <Terminal className="w-4 h-4 text-gray-500 group-hover:text-[#FF5A00]" />
                <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5A00]" />
              </div>
              <div>
                <div className="text-[9px] text-gray-400 uppercase">NODE TERMINAL</div>
                <div className="text-xs font-bold uppercase tracking-wider">Issue POS License</div>
              </div>
            </button>

            <button
              id="action_activate_app"
              onClick={() => onQuickAction('activate_app')}
              className="flex flex-col justify-between p-4 bg-[#F4F4F1] border border-transparent hover:border-[#FF5A00] hover:bg-[#FF5A00]/5 text-[#1A1A1A] hover:text-[#FF5A00] transition-all text-left group font-mono h-24 rounded-none cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <Key className="w-4 h-4 text-gray-500 group-hover:text-[#FF5A00]" />
                <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5A00]" />
              </div>
              <div>
                <div className="text-[9px] text-gray-400 uppercase">INTEGRATION ACCESS</div>
                <div className="text-xs font-bold uppercase tracking-wider">Activate App</div>
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* Secondary Dashboard Content: Recent Audit Stream & System Outline */}
      <div id="dashboard_secondary_panels" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Audits Panel */}
        <div id="dashboard_recent_audits" className="lg:col-span-2 bg-white border border-[#D1D1CF] p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#F4F4F1] pb-2">
            <h3 className="text-xs font-bold font-mono text-[#1A1A1A] uppercase tracking-wider flex items-center">
              <ClipboardList className="w-4 h-4 text-[#FF5A00] mr-1.5" />
              LIVE SYSTEM AUDIT TELEMETRY STREAM
            </h3>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5">SECURE</span>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {recentLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 border border-[#D1D1CF] bg-[#F4F4F1] text-xs font-mono hover:bg-[#EAEAE8] transition-all"
              >
                <div className="flex items-center space-x-3 truncate">
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="bg-gray-200 text-[#1A1A1A] font-bold px-1 text-[9px] shrink-0 uppercase">
                    {log.actor}
                  </span>
                  <span className="text-[#1A1A1A] truncate max-w-[200px] uppercase font-semibold">
                    {log.action}
                  </span>
                  <span className="text-gray-400 hidden sm:inline truncate">
                    → {log.target}
                  </span>
                </div>
                <span className={`text-[9px] px-1 font-bold shrink-0 uppercase ${
                  log.status === 'Success' ? 'bg-green-100 text-green-800' :
                  log.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Metadata Info */}
        <div id="dashboard_env_panel" className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 text-white font-mono space-y-4 relative overflow-hidden">
          {/* Faint industrial background markings */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
            <Terminal className="w-48 h-48 stroke-[4px]" />
          </div>
          
          <div className="border-b border-[#2A2A2A] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">
              SYSTEM HOST PARAMETERS
            </h3>
          </div>

          <div className="space-y-3 text-[11px] text-gray-400 relative z-10">
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span>SYSTEM SHELL:</span>
              <span className="text-[#FF5A00] font-semibold">iTred Control v4.1</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span>ACTIVE DAEMON:</span>
              <span className="text-white">seiGEN CORE v4.14</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span>GATEWAY BOUND:</span>
              <span className="text-white">10.84.112.5:3000</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span>ENCRYPTION TYPE:</span>
              <span className="text-[#FF5A00]">RSA-4096-ECC</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span>SYS SECURITY:</span>
              <span className="text-green-500 font-bold">STABLE LOCK</span>
            </div>
          </div>
          
          <div className="p-2 border border-dashed border-gray-700 bg-[#151618] text-[9px] text-center text-gray-400">
            ALL NODE OPERATIONS SUBJECT TO COMPLIANCE PROTOCOL S-801
          </div>
        </div>

      </div>
    </div>
  );
}
