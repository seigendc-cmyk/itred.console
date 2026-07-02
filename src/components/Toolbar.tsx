import React, { useState } from 'react';
import { Search, Bell, Building2, User, ChevronDown, Check } from 'lucide-react';
import { MOCK_COMPANIES, MOCK_ADMINS } from '../data';
import { AppNotification } from '../types';

interface ToolbarProps {
  currentCompany: string;
  onCompanyChange: (company: string) => void;
  currentAdmin: typeof MOCK_ADMINS[0];
  onAdminChange: (admin: typeof MOCK_ADMINS[0]) => void;
  notifications: AppNotification[];
  onNavigateToNotifications: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  googleEmail?: string;
  vendors?: any[];
  isDemoActive?: boolean;
}

export default function Toolbar({
  currentCompany,
  onCompanyChange,
  currentAdmin,
  onAdminChange,
  notifications,
  onNavigateToNotifications,
  onSearch,
  searchQuery,
  googleEmail = 'seigendc@gmail.com',
  vendors = [],
  isDemoActive = false
}: ToolbarProps) {
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter businesses belonging to this Google email address (excluding demo vendors)
  const linkedBusinesses = vendors
    .filter(v => v.assignedPlanId !== 'VENDOR_DEMO')
    .filter(
      v => (v.email || '').toLowerCase() === googleEmail.toLowerCase()
    );

  return (
    <header id="toolbar_header" className="h-16 border-b border-[#D1D1CF] bg-white flex items-center justify-between px-8 relative z-10 shrink-0">
      {/* Search Input Section */}
      <div id="search_container" className="flex items-center w-80 relative">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          id="search_input"
          type="text"
          placeholder="Search entities..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-[#F4F4F1] border-none pl-9 pr-4 py-1.5 text-xs font-sans text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#FF5A00] placeholder-gray-400 rounded-none uppercase tracking-wider"
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
        <div id="storage_mode_indicator" className="flex items-center space-x-2 border-r border-[#D1D1CF] pr-6">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Storage Mode:</span>
          <div className="flex border border-[#D1D1CF] p-0.5 bg-[#F4F4F1] rounded-none">
            <div className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-none ${
              isDemoActive 
                ? 'bg-[#FF5A00] text-white shadow-sm' 
                : 'bg-transparent text-gray-500 opacity-60'
            }`}>
              Local Demo Mode
            </div>
            <div className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-none cursor-not-allowed select-none ${
              !isDemoActive 
                ? 'bg-gray-400 text-white shadow-sm' 
                : 'text-gray-400 opacity-40'
            }`}>
              Production Cloud Mode
            </div>
          </div>
        </div>
        
        {/* Company Selector */}
        <div id="company_selector" className="relative">
          <button
            id="company_dropdown_trigger"
            onClick={() => {
              setShowCompanyDropdown(!showCompanyDropdown);
              setShowAdminDropdown(false);
              setShowNotificationsDropdown(false);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 border border-[#D1D1CF] bg-[#F4F4F1] text-xs font-sans text-[#1A1A1A] hover:border-[#FF5A00] transition-colors rounded-none"
          >
            <Building2 className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span className="uppercase font-semibold tracking-wider max-w-[180px] truncate">{currentCompany}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          
          {showCompanyDropdown && (
            <div id="company_dropdown_menu" className="absolute right-0 mt-1 w-72 bg-white border border-[#D1D1CF] z-20 shadow-lg rounded-none p-1 divide-y divide-gray-100">
              {/* Account Title Header */}
              <div className="px-2 py-2 text-[10px] font-mono text-gray-500 bg-[#F4F4F1] uppercase tracking-wider">
                <span className="block text-gray-400 font-bold text-[8px]">GOOGLE MAIL ACCOUNT</span>
                <span className="font-semibold text-[#FF5A00] lowercase">{googleEmail}</span>
              </div>

              {/* Linked Businesses Group */}
              <div className="py-1">
                <div className="px-2 py-1 text-[8px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                  MY REGISTERED BUSINESSES ({linkedBusinesses.length})
                </div>
                {linkedBusinesses.length === 0 ? (
                  <div className="px-2 py-2 text-[10px] text-gray-400 italic">No registered businesses.</div>
                ) : (
                  linkedBusinesses.map((biz) => {
                    const isSelected = currentCompany === biz.name;
                    return (
                      <button
                        key={biz.id}
                        onClick={() => {
                          onCompanyChange(biz.name);
                          setShowCompanyDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs font-sans uppercase hover:bg-[#1A1A1A] hover:text-white flex items-center justify-between transition-colors rounded-none ${
                          isSelected ? 'text-[#FF5A00] font-bold' : 'text-[#1A1A1A]'
                        }`}
                      >
                        <div className="truncate flex flex-col items-start">
                          <span className="truncate">{biz.name}</span>
                          <span className="text-[8px] font-mono text-gray-400 lowercase normal-case">{biz.id} • {biz.location}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5A00] shrink-0 ml-2" />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Demo Vendors if active */}
              {vendors.some(v => v.assignedPlanId === 'VENDOR_DEMO') && (
                <div className="py-1">
                  <div className="px-2 py-1 text-[8px] font-mono font-bold text-orange-500 uppercase tracking-widest">
                    DEMO BUSINESSES
                  </div>
                  {vendors.filter(v => v.assignedPlanId === 'VENDOR_DEMO').map((biz) => {
                    const isSelected = currentCompany === biz.name;
                    return (
                      <button
                        key={biz.id}
                        onClick={() => {
                          onCompanyChange(biz.name);
                          setShowCompanyDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs font-sans uppercase hover:bg-[#FF5A00] hover:text-white flex items-center justify-between transition-colors rounded-none ${
                          isSelected ? 'text-[#FF5A00] font-bold' : 'text-[#1A1A1A]'
                        }`}
                      >
                        <div className="truncate flex flex-col items-start">
                          <span className="truncate">{biz.name}</span>
                          <span className="text-[8px] font-mono text-orange-400 lowercase normal-case">{biz.id} • LOCAL DEMO</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5A00] shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Standard Platform Nodes */}
              <div className="py-1">
                <div className="px-2 py-1 text-[8px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                  PLATFORM CORE SYSTEM NODES
                </div>
                {MOCK_COMPANIES.map((company) => {
                  const isSelected = currentCompany === company;
                  return (
                    <button
                      key={company}
                      onClick={() => {
                        onCompanyChange(company);
                        setShowCompanyDropdown(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 text-xs font-sans uppercase hover:bg-[#1A1A1A] hover:text-white flex items-center justify-between transition-colors rounded-none ${
                        isSelected ? 'text-[#FF5A00] font-bold' : 'text-[#1A1A1A]'
                      }`}
                    >
                      <span className="truncate">{company}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5A00] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Selector */}
        <div id="admin_selector" className="relative">
          <button
            id="admin_dropdown_trigger"
            onClick={() => {
              setShowAdminDropdown(!showAdminDropdown);
              setShowCompanyDropdown(false);
              setShowNotificationsDropdown(false);
            }}
            className="flex items-center space-x-2 px-3 py-1.5 border border-[#D1D1CF] bg-[#F4F4F1] text-xs font-sans text-[#1A1A1A] hover:border-[#FF5A00] transition-colors rounded-none"
          >
            <User className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span className="uppercase tracking-wider">{currentAdmin.name}</span>
            <span className="text-[10px] bg-gray-200 text-gray-700 px-1 font-semibold">{currentAdmin.role.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {showAdminDropdown && (
            <div id="admin_dropdown_menu" className="absolute right-0 mt-1 w-56 bg-white border border-[#D1D1CF] z-20 shadow-sm rounded-none p-1">
              <div className="px-2 py-1.5 text-[10px] font-mono text-gray-400 border-b border-gray-100 uppercase tracking-widest">
                SWITCH ADMIN PROTOCOL
              </div>
              {MOCK_ADMINS.map((admin) => (
                <button
                  key={admin.name}
                  onClick={() => {
                    onAdminChange(admin);
                    setShowAdminDropdown(false);
                  }}
                  className="w-full text-left px-2 py-2 text-xs font-sans uppercase hover:bg-[#1A1A1A] hover:text-white flex items-center justify-between transition-colors rounded-none text-[#1A1A1A]"
                >
                  <div>
                    <div className="font-bold">{admin.name}</div>
                    <div className="text-[9px] text-gray-400">{admin.role}</div>
                  </div>
                  {currentAdmin.name === admin.name && <Check className="w-3.5 h-3.5 text-[#FF5A00]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div id="notification_bell_container" className="relative">
          <button
            id="notification_bell_trigger"
            onClick={() => {
              setShowNotificationsDropdown(!showNotificationsDropdown);
              setShowCompanyDropdown(false);
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
                        <span className="text-[9px] text-gray-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[#1A1A1A] font-sans font-medium text-xs mt-1">{notif.title}</div>
                      <p className="text-gray-400 text-[10px] line-clamp-2 mt-0.5">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
              <button
                id="view_all_notifications_btn"
                onClick={() => {
                  onNavigateToNotifications();
                  setShowNotificationsDropdown(false);
                }}
                className="w-full text-center py-2 border-t border-gray-100 text-xs uppercase hover:bg-[#1A1A1A] hover:text-white font-semibold tracking-wider transition-colors"
              >
                ACCESS SECURE TELEMETRY BUFFER
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar / Status */}
        <div id="profile_display" className="flex items-center space-x-3 border-l border-[#D1D1CF] pl-6">
          <div className="text-right">
            <div className="text-xs font-sans font-bold text-[#1A1A1A] uppercase">{currentAdmin.name}</div>
            <div className="text-[9px] font-sans text-[#FF5A00] uppercase tracking-wider">{currentAdmin.role}</div>
          </div>
          <div className="w-10 h-10 bg-[#1A1A1A] border-2 border-[#FF5A00] flex items-center justify-center text-white font-mono text-xs font-bold rounded-none select-none">
            {currentAdmin.name.split('.').pop()?.trim().substring(0, 2).toUpperCase() || 'AD'}
          </div>
        </div>

      </div>
    </header>
  );
}
