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
  Database,
  Boxes,
  Sparkles
} from 'lucide-react';

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
}

export default function Sidebar({
  activeTab,
  onTabChange,
  unreadNotificationsCount,
  pendingActivationsCount
}: SidebarProps) {
  
  const sections: {
    title: string;
    items: { id: SidebarTab; label: string; icon: React.ComponentType<any>; badge?: number }[];
  }[] = [
    {
      title: 'HOME',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { id: 'vendors', label: 'Vendor Management', icon: Users },
        { id: 'activations', label: 'Activation Requests', icon: Key, badge: pendingActivationsCount },
        { id: 'rpn', label: 'RPN Management', icon: Activity }
      ]
    },
    {
      title: 'COMMERCIAL',
      items: [
        { id: 'plans', label: 'Plans & Pricing', icon: Layers },
        { id: 'capacity', label: 'Capacity', icon: Cpu },
        { id: 'pos', label: 'POS Licensing', icon: Terminal },
        { id: 'apps', label: 'App Licensing', icon: Cpu }
      ]
    },
    {
      title: 'INTERNAL ADMINISTRATION',
      items: [
        { id: 'staff_management', label: 'Staff Management', icon: Users },
        { id: 'role_creator', label: 'Staff Roles', icon: Sparkles },
        { id: 'desk_creator', label: 'Staff Desks', icon: Terminal },
        { id: 'menu_features', label: 'Menu Features', icon: Layers }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'audit', label: 'Audit Logs', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
        { id: 'finance', label: 'Finance', icon: Coins }
      ]
    },
    {
      title: 'PLATFORM',
      items: [
        { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
        { id: 'integrations', label: 'Integrations', icon: Database },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside id="sidebar_container" className="w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] flex flex-col h-full text-white shrink-0 font-sans select-none">
      {/* Brand Header */}
      <div id="sidebar_brand" className="h-16 px-6 border-b border-[#2A2A2A] flex items-center bg-[#1A1A1A]">
        <div className="h-8 w-8 bg-[#FF5A00] mr-3 shrink-0" />
        <div className="flex flex-col justify-center">
          <span className="text-lg font-bold tracking-tight uppercase leading-none">
            iTred <span className="font-light opacity-60 text-sm">Console</span>
          </span>
          <span className="text-[9px] text-[#8E9299] uppercase tracking-widest mt-0.5 font-mono">seiGEN COMMERCE CORE</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav id="sidebar_nav" className="flex-1 overflow-y-auto py-4 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-6 text-[9px] uppercase tracking-widest text-[#FF5A00] font-black font-mono opacity-80">
              {section.title}
            </div>
            
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    id={`sidebar_tab_${item.id}`}
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-6 py-2 text-xs uppercase tracking-wider transition-all rounded-none text-left font-medium ${
                      isActive
                        ? 'bg-[#2A2A2A] border-l-4 border-[#FF5A00] text-white font-bold'
                        : 'text-[#E2E8F0] opacity-60 border-l-4 border-transparent hover:opacity-100 hover:bg-[#2A2A2A]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF5A00]' : 'text-gray-400'}`} />
                      <span className="font-sans text-[11px]">{item.label}</span>
                    </div>
                    
                    {/* Conditional Badges */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                        isActive ? 'bg-[#FF5A00] text-white' : 'bg-[#FF5A00]/20 text-[#FF5A00]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* System Status Footer */}
      <div id="sidebar_footer" className="p-6 border-t border-[#2A2A2A] font-mono space-y-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest opacity-40">Environment</div>
          <div className="text-xs text-[#FF5A00] font-bold">seiGEN_PROD_04</div>
        </div>
        <div className="flex justify-between items-center text-[9px] text-gray-500">
          <span>HOST: PORT_3000</span>
          <span className="text-green-500 font-bold flex items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" /> LIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
