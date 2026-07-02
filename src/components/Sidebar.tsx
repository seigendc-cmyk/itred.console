import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  Terminal,
  Cpu,
  Key,
  Activity,
  Coins,
  Bell,
  FileText,
  Settings,
  Database
} from 'lucide-react';
import { SCIStaffSession } from '../internal/staffTypes';
import { SCIWorkspaceCode } from '../workspace/workspaceTypes';

export type SidebarTab =
  | 'dashboard'
  | 'vendors'
  | 'plans'
  | 'pos'
  | 'apps'
  | 'activations'
  | 'rpn'
  | 'finance'
  | 'notifications'
  | 'audit'
  | 'settings'
  | 'integrations'
  | 'ecosystem'
  | 'ai_analyst'
  | 'diagnostics'
  | 'capacity'
  | 'staff_management'
  | 'role_creator'
  | 'desk_creator'
  | 'menu_features';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  unreadNotificationsCount: number;
  pendingActivationsCount: number;
  activeStaffSession: SCIStaffSession | null;
  activeWorkspaceId: SCIWorkspaceCode;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  unreadNotificationsCount,
  pendingActivationsCount,
  activeStaffSession,
  activeWorkspaceId
}: SidebarProps) {
  
  // Mapping of sidebar links to workspaces
  const workspaceNavMap: Record<
    SCIWorkspaceCode, 
    { id: SidebarTab; label: string; icon: React.ComponentType<any>; featureId: string; badge?: number }[]
  > = {
    home: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, featureId: 'dashboard' }
    ],
    vendor_operations: [
      { id: 'vendors', label: 'Vendor Management', icon: Users, featureId: 'vendors' },
      { id: 'activations', label: 'Activation Requests', icon: Key, featureId: 'activation_requests', badge: pendingActivationsCount }
    ],
    licensing_centre: [
      { id: 'plans', label: 'Plans & Pricing', icon: Layers, featureId: 'plans_pricing' },
      { id: 'pos', label: 'POS Licensing', icon: Terminal, featureId: 'pos_licensing' },
      { id: 'apps', label: 'App Licensing', icon: Cpu, featureId: 'app_licensing' }
    ],
    commercial: [
      { id: 'capacity', label: 'Capacity Overview', icon: Cpu, featureId: 'capacity' }
    ],
    internal_administration: [
      { id: 'staff_management', label: 'Staff Management', icon: Users, featureId: 'staff_management' },
      { id: 'role_creator', label: 'Staff Roles', icon: Sparkles, featureId: 'role_creator' },
      { id: 'desk_creator', label: 'Staff Desks', icon: Terminal, featureId: 'desk_creator' },
      { id: 'menu_features', label: 'Menu Features', icon: Layers, featureId: 'menu_features' }
    ],
    rpn_operations: [
      { id: 'rpn', label: 'RPN Management', icon: Activity, featureId: 'rpn_management' }
    ],
    finance: [
      { id: 'finance', label: 'Finance Records', icon: Coins, featureId: 'finance' }
    ],
    platform: [
      { id: 'diagnostics', label: 'SCI Diagnostics', icon: Activity, featureId: 'diagnostics' },
      { id: 'integrations', label: 'Integrations', icon: Database, featureId: 'integrations' },
      { id: 'settings', label: 'System Settings', icon: Settings, featureId: 'settings' },
      { id: 'audit', label: 'Audit Logs', icon: FileText, featureId: 'audit_logs' },
      { id: 'notifications', label: 'Notifications Logs', icon: Bell, featureId: 'notifications', badge: unreadNotificationsCount }
    ]
  };

  const currentItems = workspaceNavMap[activeWorkspaceId] || [];

  // Filter links based on staff session menu feature clearance rules
  const allowedItems = currentItems.filter((item) => {
    if (!activeStaffSession) return true;
    return activeStaffSession.grantedMenuFeatureIds.includes(item.featureId);
  });

  const getWorkspaceTitle = (code: SCIWorkspaceCode) => {
    return code.replace('_', ' ').toUpperCase();
  };

  return (
    <aside id="sidebar_container" className="w-56 bg-[#1A1A1A] border-r border-[#2A2A2A] flex flex-col h-full text-white shrink-0 font-sans select-none">
      
      {/* Workspace Header */}
      <div className="p-4 border-b border-[#2A2A2A] bg-[#161616]">
        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">Workspace Panel</div>
        <div className="text-xs font-bold tracking-tight text-[#FF5A00] uppercase truncate mt-0.5 font-mono">
          {getWorkspaceTitle(activeWorkspaceId)}
        </div>
      </div>

      {/* Nav Menu */}
      <nav id="sidebar_nav" className="flex-1 overflow-y-auto py-3 space-y-1">
        {allowedItems.length === 0 ? (
          <div className="p-4 text-[10px] text-gray-500 italic font-mono uppercase text-center">
            No console clearances granted for this workspace
          </div>
        ) : (
          allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                id={`sidebar_tab_${item.id}`}
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs uppercase tracking-wider transition-all rounded-none text-left font-medium ${
                  isActive
                    ? 'bg-[#2A2A2A] border-l-4 border-[#FF5A00] text-white font-bold'
                    : 'text-[#E2E8F0] opacity-60 border-l-4 border-transparent hover:opacity-100 hover:bg-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FF5A00]' : 'text-gray-400'}`} />
                  <span className="font-sans text-[10px]">{item.label}</span>
                </div>
                
                {/* Conditional Badges */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[8px] font-mono font-bold ${
                    isActive ? 'bg-[#FF5A00] text-white' : 'bg-[#FF5A00]/20 text-[#FF5A00]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })
        )}
      </nav>

      {/* Connection Indicator in footer */}
      <div className="p-4 border-t border-[#2A2A2A] font-mono text-[9px] text-gray-500 uppercase tracking-widest flex justify-between">
        <span>UPLINK STABLE</span>
        <span className="text-green-500 animate-pulse font-black">●</span>
      </div>

    </aside>
  );
}
const Sparkles = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
  </svg>
);
