import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, ShieldAlert } from 'lucide-react';
import { AppNotification } from '../types';
import { SCIStaffSession } from '../internal/staffTypes';

interface ToolbarProps {
  activeStaffSession: SCIStaffSession | null;
  onLogout: () => void;
  notifications: AppNotification[];
  onNavigateToNotifications: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  isDemoActive?: boolean;
}

export default function Toolbar({
  activeStaffSession,
  onLogout,
  notifications,
  onNavigateToNotifications,
  onSearch,
  searchQuery,
  isDemoActive = false
}: ToolbarProps) {
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="toolbar_header" className="h-16 border-b border-[#D1D1CF] bg-white flex items-center justify-between px-8 relative z-10 shrink-0 font-sans">
      
      {/* Search Input Section */}
      <div id="search_container" className="flex items-center w-80 relative">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          id="search_input"
          type="text"
          placeholder="Search entities..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-[#F4F4F1] border-none pl-9 pr-4 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#FF5A00] placeholder-gray-400 rounded-none uppercase tracking-wider font-mono"
        />
        {searchQuery && (
          <button 
            id="clear_search_btn"
            onClick={() => onSearch('')} 
            className="absolute right-3 text-xs text-gray-400 hover:text-[#FF5A00] font-mono"
          >
            ESC
          </button>
        )}
      </div>

      {/* Center/Right controls */}
      <div id="toolbar_actions" className="flex items-center space-x-6">
        
        {/* Global Storage Mode Indicator */}
        <div id="storage_mode_indicator" className="flex items-center space-x-2 border-r border-[#D1D1CF] pr-6 font-mono text-[10px]">
          <span className="text-gray-500 uppercase tracking-wider">Storage Mode:</span>
          <div className="flex border border-[#D1D1CF] p-0.5 bg-[#F4F4F1] rounded-none">
            <div className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none ${
              isDemoActive 
                ? 'bg-[#FF5A00] text-white shadow-sm' 
                : 'bg-transparent text-gray-500 opacity-60'
            }`}>
              Local Demo
            </div>
            <div className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none cursor-not-allowed select-none ${
              !isDemoActive 
                ? 'bg-gray-400 text-white shadow-sm' 
                : 'text-gray-450 opacity-40'
            }`}>
              Cloud Prod
            </div>
          </div>
        </div>
        
        {/* Active Console/Desk Indicator */}
        {activeStaffSession && (
          <div className="flex items-center space-x-1.5 bg-orange-50 border border-orange-250 px-3 py-1 font-mono text-[10px] text-[#FF5A00] font-black uppercase">
            <span className="w-1.5 h-1.5 bg-[#FF5A00] rounded-none animate-pulse shrink-0" />
            <span>CONSOLE DESK: {activeStaffSession.activeDeskId}</span>
          </div>
        )}

        {/* Admin Selector & Profile Dropdown */}
        <div id="admin_selector" className="relative">
          <button
            id="admin_dropdown_trigger"
            onClick={() => {
              setShowAdminDropdown(!showAdminDropdown);
              setShowNotificationsDropdown(false);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 border border-[#D1D1CF] bg-[#F4F4F1] text-xs font-sans text-[#1A1A1A] hover:border-[#FF5A00] transition-colors rounded-none font-bold"
          >
            <User className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span className="uppercase tracking-wider font-mono">{activeStaffSession?.fullName || 'Anonymous'}</span>
            <span className="text-[9px] bg-gray-200 text-gray-700 px-1 font-mono font-semibold uppercase">{activeStaffSession?.roleId.replace('role_', '') || 'guest'}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {showAdminDropdown && (
            <div id="admin_dropdown_menu" className="absolute right-0 mt-1 w-64 bg-white border border-[#D1D1CF] z-20 shadow-sm rounded-none p-1 font-mono text-xs text-[#1A1A1A]">
              <div className="px-2 py-1.5 text-[9px] font-bold text-gray-400 border-b border-gray-100 uppercase tracking-widest">
                Active Console Session
              </div>
              <div className="p-2 space-y-1 bg-stone-50 border border-[#D1D1CF] my-1 text-[10px] uppercase font-bold text-gray-600">
                <div className="flex justify-between">
                  <span>Operator:</span>
                  <span className="text-gray-800">{activeStaffSession?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role Clearance:</span>
                  <span className="text-[#FF5A00]">{activeStaffSession?.roleId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desk Terminal:</span>
                  <span className="text-gray-800">{activeStaffSession?.activeDeskId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Effective Paths:</span>
                  <span className="text-gray-850 font-black">{activeStaffSession?.grantedMenuFeatureIds.length} Nodes</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminDropdown(false);
                  onLogout();
                }}
                className="w-full text-left px-2 py-2 text-xs font-black text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors uppercase flex items-center space-x-2 border-t border-gray-100 rounded-none cursor-pointer mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Console / Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div id="notification_bell_container" className="relative">
          <button
            id="notification_bell_trigger"
            onClick={() => {
              setShowNotificationsDropdown(!showNotificationsDropdown);
              setShowAdminDropdown(false);
            }}
            className="p-1.5 border border-[#D1D1CF] bg-[#F4F4F1] hover:border-[#FF5A00] text-[#1A1A1A] hover:text-[#FF5A00] relative rounded-none transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span id="notification_badge" className="absolute -top-1.5 -right-1.5 bg-[#FF5A00] text-white text-[9px] font-mono font-bold px-1 py-0.5 min-w-[16px] h-[16px] flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationsDropdown && (
            <div id="notifications_popover" className="absolute right-0 mt-1 w-80 bg-white border border-[#D1D1CF] z-20 shadow-sm rounded-none p-1 font-mono">
              <div className="px-2 py-1.5 text-[10px] text-gray-400 border-b border-gray-100 flex justify-between items-center uppercase tracking-widest">
                <span>SYSTEM UPLINK TELEMETRY</span>
                <span className="bg-red-100 text-red-700 px-1 font-semibold text-[9px]">{unreadCount} PENDING</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 uppercase">NO ACTIVE ALERTS</div>
                ) : (
                  notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 border-b border-gray-100 last:border-0 text-xs hover:bg-[#F4F4F1] ${
                        !notif.read ? 'border-l-2 border-l-[#FF5A00] bg-orange-50/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`font-semibold text-[10px] px-1 uppercase ${
                          notif.type === 'alert' ? 'bg-red-100 text-red-800' :
                          notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          notif.type === 'success' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notif.type}
                        </span>
                        <span className="text-[9px] text-gray-450">{notif.timestamp.split('T')[1].slice(0, 5)}</span>
                      </div>
                      <p className="text-gray-600 leading-normal font-sans mt-1 text-[11px]">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => {
                  setShowNotificationsDropdown(false);
                  onNavigateToNotifications();
                }}
                className="w-full text-center py-2 text-[10px] text-[#FF5A00] hover:text-[#1A1A1A] font-bold uppercase tracking-wider border-t border-gray-100"
              >
                Inspect All Logs
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
