import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SCIStaffSession, SCIInternalStaff, SCIStaffDesk, SCIStaffRole } from '../internal/staffTypes';
import { SCIWorkspaceNotification } from '../workspace/workspaceNotifications';
import { SCIEnvironmentMode } from '../workspace/workspaceEnvironment';
import { searchWorkspaceIndex, SCIWorkspaceSearchItem } from '../workspace/workspaceSearch';

interface ToolbarProps {
  activeStaffSession: SCIStaffSession | null;
  onLogout: () => void;
  notifications: SCIWorkspaceNotification[];
  onNavigateToNotifications: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  activeWorkspaceLabel: string;
  internalStaff: SCIInternalStaff[];
  staffRoles: SCIStaffRole[];
  staffDesks: SCIStaffDesk[];
  onDeskSwitch: (deskId: string) => void;
  envMode: SCIEnvironmentMode;
  onChangeEnvMode: (mode: SCIEnvironmentMode) => void;
  onMarkNotificationRead: (notificationId: string) => void;
  onCommandClick?: (item: SCIWorkspaceSearchItem) => void;
}

export default function Toolbar({
  activeStaffSession,
  onLogout,
  notifications,
  onNavigateToNotifications,
  onSearch,
  searchQuery,
  activeWorkspaceLabel,
  internalStaff,
  staffRoles,
  staffDesks,
  onDeskSwitch,
  envMode,
  onChangeEnvMode,
  onMarkNotificationRead,
  onCommandClick
}: ToolbarProps) {
  const navigate = useNavigate();
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Resolve search results
  const searchResults = React.useMemo(() => {
    return searchWorkspaceIndex(searchQuery);
  }, [searchQuery]);

  // Resolve assigned desks for active operator profile
  const activeStaff = React.useMemo(() => {
    if (!activeStaffSession) return null;
    return internalStaff.find(s => s.staffId === activeStaffSession.staffId) || null;
  }, [internalStaff, activeStaffSession]);

  const assignedDesks = React.useMemo(() => {
    if (!activeStaff) return [];
    return staffDesks.filter(d => activeStaff.assignedDeskIds.includes(d.deskId));
  }, [staffDesks, activeStaff]);

  // Resolve roleName from staffRoles
  const resolvedRoleName = React.useMemo(() => {
    if (!activeStaffSession) return 'guest';
    const roleObj = staffRoles.find(r => r.roleId === activeStaffSession.roleId);
    return roleObj ? roleObj.roleName : activeStaffSession.roleId.replace('role_', '');
  }, [staffRoles, activeStaffSession]);

  return (
    <header id="toolbar_header" className="h-16 border-b border-[#D1D1CF] bg-white flex items-center justify-between px-8 relative z-10 shrink-0 font-sans select-none">
      
      {/* Breadcrumb section on far left */}
      <div className="flex items-center space-x-3 shrink-0">
        <span className="font-mono text-xs font-black uppercase text-[#1A1A1A] tracking-widest">
          SCI Control Centre
        </span>
        <span className="text-gray-300 text-sm font-light">/</span>
        <span className="bg-orange-50 text-[#FF5A00] border border-orange-200 text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
          {activeWorkspaceLabel}
        </span>
      </div>

      {/* Search Input Section */}
      <div id="search_container" className="flex items-center w-64 relative mx-4">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          id="search_input"
          type="text"
          placeholder="Search workspaces & cmds..."
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
        {searchQuery && searchResults.length > 0 && (
          <div id="search_results_dropdown" className="absolute top-10 left-0 w-80 bg-white border-2 border-[#1A1A1A] z-50 shadow-md font-mono text-[10px] text-[#1A1A1A] max-h-64 overflow-y-auto p-1">
            <div className="px-2 py-1 text-[8px] font-bold text-gray-455 border-b border-gray-150 uppercase tracking-widest">
              Search Results ({searchResults.length})
            </div>
            {searchResults.map((item) => (
              <button
                id={`search_result_item_${item.searchId}`}
                key={item.searchId}
                onClick={() => {
                  if (item.targetPath) {
                    navigate(item.targetPath);
                  }
                  if (item.type === 'command') {
                    onCommandClick?.(item);
                  }
                  onSearch('');
                }}
                className="w-full text-left px-2 py-2 hover:bg-[#F4F4F1] border-b border-stone-100 last:border-0 flex flex-col gap-0.5 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1A1A1A] uppercase text-[10px]">{item.label}</span>
                  <span className={`px-1 py-0.2 text-[7px] font-bold border ${
                    item.type === 'workspace' 
                      ? 'border-[#FF5A00] text-[#FF5A00] bg-orange-50' 
                      : 'border-[#1A1A1A] text-[#1A1A1A] bg-stone-100'
                  }`}>
                    {item.type.toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-500 font-sans text-[9px] truncate normal-case">{item.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center/Right controls */}
      <div id="toolbar_actions" className="flex items-center space-x-5">
        
        {/* Environment Mode Switcher */}
        <div id="environment_mode_container" className="flex items-center space-x-2 border-r border-[#D1D1CF] pr-5 font-mono text-[10px]">
          <span className="text-gray-500 uppercase tracking-wider">ENV MODE:</span>
          <select
            value={envMode}
            onChange={(e) => onChangeEnvMode(e.target.value as SCIEnvironmentMode)}
            className="bg-[#F4F4F1] border border-[#D1D1CF] px-2 py-1 text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#FF5A00] text-gray-800 cursor-pointer rounded-none"
          >
            <option value="prototype">Prototype</option>
            <option value="local_demo">Local Demo</option>
            <option value="staging">Staging</option>
            <option value="production" disabled>Production (Disabled)</option>
          </select>
        </div>
        
        {/* Active Console/Desk Dropdown Switcher */}
        {activeStaffSession && assignedDesks.length > 0 && (
          <div className="flex items-center space-x-1.5 bg-orange-50 border border-orange-250 px-3 py-1 font-mono text-[10px] text-[#FF5A00] font-black uppercase">
            <span className="w-1.5 h-1.5 bg-[#FF5A00] rounded-none animate-pulse shrink-0" />
            <span className="text-gray-500">DESK:</span>
            <select
              value={activeStaffSession.activeDeskId}
              onChange={(e) => onDeskSwitch(e.target.value)}
              className="bg-transparent border-none text-[#FF5A00] font-black focus:outline-none uppercase cursor-pointer text-[10px] p-0 font-mono"
            >
              {assignedDesks.map(d => (
                <option key={d.deskId} value={d.deskId} className="bg-white text-gray-800 font-sans">
                  {d.deskName} ({d.deskCode})
                </option>
              ))}
            </select>
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
            <span className="uppercase tracking-wider font-mono">{activeStaffSession?.fullName || 'Anonymous'}</span>
            <span className="text-[9px] bg-gray-200 text-gray-700 px-1.5 py-0.5 font-mono font-semibold uppercase">{resolvedRoleName}</span>
            
            {activeStaffSession?.dashboardType && (
              <span className="text-[9px] bg-orange-100 text-[#FF5A00] px-1 font-mono font-extrabold uppercase shrink-0">
                {activeStaffSession.dashboardType}
              </span>
            )}

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
                  <span className="text-[#FF5A00]">{resolvedRoleName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desk Terminal:</span>
                  <span className="text-gray-800">{activeStaffSession?.activeDeskId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dashboard Type:</span>
                  <span className="text-orange-500 uppercase">{activeStaffSession?.dashboardType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Effective Paths:</span>
                  <span className="text-gray-855 font-black">{activeStaffSession?.grantedMenuFeatureIds.length} Nodes</span>
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
                      key={notif.notificationId}
                      className={`p-2.5 border-b border-gray-100 last:border-0 text-xs hover:bg-[#F4F4F1] relative ${
                        !notif.read ? 'border-l-2 border-l-[#FF5A00] bg-orange-50/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`font-semibold text-[9px] px-1 uppercase ${
                          notif.type === 'approval' ? 'bg-yellow-100 text-yellow-800' :
                          notif.type === 'security' ? 'bg-red-100 text-red-800' :
                          notif.type === 'license' ? 'bg-blue-100 text-blue-800' :
                          'bg-stone-100 text-stone-850'
                        }`}>
                          {notif.type}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[8px] text-gray-400">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                          {!notif.read && (
                            <button
                              id={`mark_read_btn_${notif.notificationId}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkNotificationRead(notif.notificationId);
                              }}
                              className="text-[8px] text-[#FF5A00] hover:text-orange-700 font-bold uppercase underline cursor-pointer"
                              title="Mark as Read"
                            >
                              Ack
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="font-sans font-bold text-[#1A1A1A] text-[10px] uppercase">{notif.title}</p>
                      <p className="text-gray-600 leading-normal font-sans mt-0.5 text-[9px]">{notif.message}</p>
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
