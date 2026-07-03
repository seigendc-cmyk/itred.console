import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  User, 
  Loader2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Layers,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  SCIInternalStaff, 
  SCIStaffRole, 
  SCIStaffDesk, 
  SCIMenuFeature, 
  SCIStaffSession 
} from '../internal/staffTypes';
import { resolveStaffAccess } from '../internal/access';
import { addWorkspaceAuditEvent } from '../workspace/workspaceAudit';

/* ==========================================================================
   PHASE 1: GOOGLE LOGIN
   ========================================================================== */
interface GoogleLoginViewProps {
  onLogin: (email: string) => void;
}

export function GoogleLoginView({ onLogin }: GoogleLoginViewProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('admin@seigencommerce.com');

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(customEmail);
      navigate('/staff-access');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F1] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-[#1A1A1A] p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />

        <div className="text-center space-y-3 mb-8 pt-2">
          <div className="flex justify-center items-center space-x-1.5 mb-2 select-none">
            <span className="text-2xl font-black tracking-tight font-sans text-blue-600">G</span>
            <span className="text-2xl font-black tracking-tight font-sans text-red-500">o</span>
            <span className="text-2xl font-black tracking-tight font-sans text-yellow-500">o</span>
            <span className="text-2xl font-black tracking-tight font-sans text-blue-600">g</span>
            <span className="text-2xl font-black tracking-tight font-sans text-green-500">l</span>
            <span className="text-2xl font-black tracking-tight font-sans text-red-500">e</span>
          </div>
          <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wider font-sans">
            SCI Internal Staff Access
          </h2>
          <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto leading-relaxed">
            Prefilled OAuth single sign-on simulator for secure console access.
          </p>
        </div>

        <div className="space-y-5 font-mono text-xs text-[#1A1A1A]">
          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase text-[10px] block font-bold">PREFILLED ACCOUNT EMAIL</label>
            <div className="relative">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold lowercase rounded-none pl-9"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] py-3 uppercase font-bold text-center tracking-wider transition-all rounded-none cursor-pointer flex items-center justify-center space-x-3 text-xs shadow-md active:translate-y-0.5 font-sans"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" />
                <span>Simulating Google Auth Portal...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.514 5.514 0 0 1 8.5 13a5.514 5.514 0 0 1 5.491-5.514c2.26 0 3.869 1.007 4.731 1.83l3.245-3.243C19.92 4.155 17.14 2.5 14 2.5a10.5 10.5 0 0 0-10.5 10.5A10.5 10.5 0 0 0 14 23.5c5.77 0 10.5-4.145 10.5-10.5 0-.71-.06-1.4-.18-2.065H12.24Z"
                  />
                </svg>
                <span>SIGN IN WITH GOOGLE SSO</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 border-t border-[#D1D1CF] pt-4 text-center font-mono text-[9px] text-gray-400 uppercase tracking-widest flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#FF5A00]" /> SIMULATED GATE
          </span>
          <span>BUILD v4.14-stable</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PHASE 2: STAFF ACCESS FORM (SSO GATEWAY)
   ========================================================================== */
interface StaffAccessViewProps {
  internalStaff: SCIInternalStaff[];
  staffRoles: SCIStaffRole[];
  staffDesks: SCIStaffDesk[];
  menuFeatures: SCIMenuFeature[];
  activeStaffSession: SCIStaffSession | null;
  onLoginSuccess: (session: SCIStaffSession) => void;
  googleEmail: string;
}

export function StaffAccessView({
  internalStaff,
  staffRoles,
  staffDesks,
  menuFeatures,
  activeStaffSession,
  onLoginSuccess,
  googleEmail
}: StaffAccessViewProps) {
  const navigate = useNavigate();

  // Find matched profile or fall back
  const defaultStaff = useMemo(() => {
    const matched = internalStaff.find(s => s.email.toLowerCase() === googleEmail.toLowerCase());
    return matched || internalStaff.find(s => s.status === 'active') || internalStaff[0];
  }, [internalStaff, googleEmail]);

  const [selectedStaffId, setSelectedStaffId] = useState<string>(defaultStaff?.staffId || '');
  const [loginAttemptedBlocked, setLoginAttemptedBlocked] = useState(false);

  const selectedStaff = useMemo(() => {
    return internalStaff.find(s => s.staffId === selectedStaffId) || defaultStaff;
  }, [internalStaff, selectedStaffId, defaultStaff]);

  // Filter desks by selected staff member's assignedDeskIds only
  const allowedDesks = useMemo(() => {
    if (!selectedStaff) return [];
    return staffDesks.filter(d => selectedStaff.assignedDeskIds.includes(d.deskId));
  }, [staffDesks, selectedStaff]);

  // Desk selection state
  const [selectedDeskId, setSelectedDeskId] = useState<string>(() => {
    return selectedStaff?.defaultDeskId || allowedDesks[0]?.deskId || '';
  });

  // Re-adjust desk selection if staff changes
  React.useEffect(() => {
    if (selectedStaff) {
      const defaultId = selectedStaff.defaultDeskId || allowedDesks[0]?.deskId || '';
      setSelectedDeskId(defaultId);
      setLoginAttemptedBlocked(false); // Reset blocked UX warnings on change
    }
  }, [selectedStaff, allowedDesks]);

  const selectedDesk = useMemo(() => {
    return staffDesks.find(d => d.deskId === selectedDeskId) || allowedDesks[0];
  }, [staffDesks, selectedDeskId, allowedDesks]);

  const selectedRole = useMemo(() => {
    if (!selectedStaff) return null;
    return staffRoles.find(r => r.roleId === selectedStaff.roleId) || null;
  }, [staffRoles, selectedStaff]);

  // Resolve access using the resolveStaffAccess utility
  const accessResolution = useMemo(() => {
    if (!selectedStaff || !selectedRole || !selectedDesk) {
      return {
        allowed: false,
        reasonCode: 'MISSING_BINDINGS' as const,
        message: 'Role clearance and desk terminal mapping parameters are incomplete.'
      };
    }
    return resolveStaffAccess({
      staff: selectedStaff,
      role: selectedRole,
      desk: selectedDesk
    });
  }, [selectedStaff, selectedRole, selectedDesk]);

  // Role permissions
  const rolePermissions = useMemo(() => {
    return selectedRole?.menuFeatureIds ?? [];
  }, [selectedRole]);

  // Desk permissions
  const deskPermissions = useMemo(() => {
    return selectedDesk?.menuFeatureIds ?? [];
  }, [selectedDesk]);

  // Union of features (Effective clearance)
  const effectivePermissions = useMemo(() => {
    if (!selectedRole || !selectedDesk) return [];
    return Array.from(new Set([...selectedRole.menuFeatureIds, ...selectedDesk.menuFeatureIds]));
  }, [selectedRole, selectedDesk]);

  const dashboardType = useMemo(() => {
    if (!selectedDesk || !selectedStaff) return 'executive';
    return selectedDesk.dashboardType || selectedStaff.dashboardType || 'executive';
  }, [selectedDesk, selectedStaff]);

  const canCreateEmployee = useMemo(() => {
    if (!selectedStaff || !selectedRole) return false;
    return selectedStaff.canCreateEmployee || selectedRole.canCreateEmployee;
  }, [selectedStaff, selectedRole]);

  const handleLoginClick = () => {
    if (accessResolution.allowed && accessResolution.session) {
      // Log login success audit event
      addWorkspaceAuditEvent({
        workspaceId: 'home',
        actorStaffId: selectedStaff.staffId,
        actorName: selectedStaff.fullName,
        activeDeskId: selectedDesk.deskId,
        action: 'STAFF_LOGIN',
        targetType: 'session',
        result: 'success',
        message: `Staff member ${selectedStaff.fullName} successfully logged into desk ${selectedDesk.deskName}.`
      });
      onLoginSuccess(accessResolution.session);
      navigate('/dashboard');
    } else {
      setLoginAttemptedBlocked(true);
      // Log login blocked audit event
      addWorkspaceAuditEvent({
        workspaceId: 'home',
        actorStaffId: selectedStaff?.staffId || 'Unknown',
        actorName: selectedStaff?.fullName || 'Unknown',
        activeDeskId: selectedDesk?.deskId || 'None',
        action: 'STAFF_LOGIN_BLOCKED',
        targetType: 'session',
        result: 'blocked',
        message: `Clearance Denied: ${accessResolution.message}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F1] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-white border-4 border-[#1A1A1A] p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />

        {/* Section Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1 text-[#FF5A00]">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wider font-sans">
            SCI Internal Staff Access Gateway
          </h2>
          <p className="text-xs text-gray-500 font-sans max-w-md mx-auto leading-relaxed">
            Authenticate operator profiles and bind to desk terminal consoles to resolve functional clearance levels.
          </p>
        </div>

        <div className="space-y-5 font-mono text-xs text-[#1A1A1A]">
          
          {/* Identity Info Panel */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase text-[9px] block font-black">GOOGLE OAUTH BINDING</label>
            <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-[10px] text-gray-600 uppercase flex items-center justify-between font-bold">
              <span>{googleEmail}</span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[8px] font-black px-1.5 uppercase">VERIFIED ACTIVE</span>
            </div>
          </div>

          {/* Staff Dropdown Selector */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase text-[9px] block font-black">Select Staff Operator Profile</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-white border-2 border-[#1A1A1A] p-2.5 text-xs font-bold focus:outline-none uppercase cursor-pointer"
            >
              {internalStaff.map(s => {
                const roleName = staffRoles.find(r => r.roleId === s.roleId)?.roleName || s.roleId;
                const deskCount = s.assignedDeskIds.length;
                return (
                  <option key={s.staffId} value={s.staffId}>
                    {s.fullName} ({roleName} • {s.status.toUpperCase()} • {deskCount} Desks Assigned)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Desk Dropdown Selector (Filtered) */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase text-[9px] block font-black">Select Desk Terminal Console</label>
            {allowedDesks.length === 0 ? (
              <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-xs italic">
                No active desk terminals are assigned to this staff profile. Access is blocked.
              </div>
            ) : (
              <select
                value={selectedDeskId}
                onChange={(e) => setSelectedDeskId(e.target.value)}
                className="w-full bg-white border-2 border-[#1A1A1A] p-2.5 text-xs font-bold focus:outline-none uppercase cursor-pointer"
              >
                {allowedDesks.map(d => (
                  <option key={d.deskId} value={d.deskId}>
                    {d.deskName} ({d.deskCode}) [{d.status.toUpperCase()}]
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* LIVE PERMISSION PREVIEW PANEL */}
          <div className="border border-[#D1D1CF] bg-[#FAF9F6] p-4 space-y-4">
            <div className="text-[#1A1A1A] font-black text-[9px] uppercase tracking-wider border-b border-[#D1D1CF] pb-1.5 flex justify-between items-center">
              <span>Live Terminal Permission Preview</span>
              <span className={`px-2 py-0.5 text-[8px] font-black uppercase ${
                accessResolution.allowed 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {accessResolution.allowed ? 'CLEARANCE ALLOWED' : 'CLEARANCE BLOCKED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[9px] font-bold text-gray-600">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400 block text-[8px] uppercase">OPERATING TYPE</span>
                  <span className="text-gray-800 uppercase font-black">{dashboardType} Dashboard</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[8px] uppercase">CAN CREATE EMPLOYEE</span>
                  <span className={canCreateEmployee ? "text-emerald-700 font-black" : "text-gray-400"}>
                    {canCreateEmployee ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-gray-400 block text-[8px] uppercase">EFFECTIVE CLEARANCES UNION ({effectivePermissions.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {effectivePermissions.length === 0 ? (
                      <span className="text-red-500 italic text-[8px]">None</span>
                    ) : (
                      effectivePermissions.map(p => (
                        <span key={p} className="bg-orange-50 text-[#FF5A00] border border-orange-200 px-1 py-0.2 text-[8px] uppercase">
                          {p.replace('_', ' ')}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Split Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-[8px] text-gray-500 border-t border-[#EAEAE8] pt-2">
              <div>
                <span className="block font-bold text-[8px] text-gray-455 uppercase">ROLE CLEARANCES ({rolePermissions.length})</span>
                <span className="normal-case tracking-normal leading-relaxed mt-0.5 block truncate font-mono text-[8px]">
                  {rolePermissions.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="block font-bold text-[8px] text-gray-455 uppercase">DESK CLEARANCES ({deskPermissions.length})</span>
                <span className="normal-case tracking-normal leading-relaxed mt-0.5 block truncate font-mono text-[8px]">
                  {deskPermissions.join(', ') || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* BLOCKED LOGIN UX WARNING PANEL */}
          {(!accessResolution.allowed || loginAttemptedBlocked) && (
            <div className="bg-red-50 border-2 border-red-500 p-4 space-y-3 text-red-900">
              <div className="flex items-center space-x-2 text-red-700 font-black text-[10px]">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>CRITICAL ACCESS CLEARANCE BLOCK</span>
              </div>

              <div className="text-[9px] uppercase font-bold space-y-1 leading-relaxed">
                <div>
                  <span className="text-red-500">REASON FOR DENIAL:</span>
                  <p className="font-sans normal-case text-xs text-red-750 font-extrabold mt-0.5 leading-relaxed">
                    {accessResolution.message}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-red-200/50">
                  <div>
                    <span className="text-red-400 block text-[8px]">SELECTED STAFF PROFILE:</span>
                    <span className="text-red-800">{selectedStaff?.fullName} ({selectedStaff?.status.toUpperCase()})</span>
                  </div>
                  <div>
                    <span className="text-red-400 block text-[8px]">SELECTED DESK TERMINAL:</span>
                    <span className="text-red-800">{selectedDesk?.deskName || 'None'} ({selectedDesk?.status.toUpperCase() || 'N/A'})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-red-200/50 space-y-1">
                  <span className="text-red-500 block text-[8px]">REQUIRED REMEDIATION STEPS:</span>
                  <ul className="list-disc pl-4 font-sans text-[10px] normal-case text-gray-650 space-y-0.5 font-medium leading-relaxed">
                    {selectedStaff?.status !== 'active' && (
                      <li>Change the selected operator's status to <strong>Active</strong> in the administration module.</li>
                    )}
                    {selectedRole?.status !== 'active' && (
                      <li>Activate the selected clearance role (<strong>{selectedRole?.roleName}</strong>) under Staff Roles.</li>
                    )}
                    {selectedDesk?.status !== 'active' && (
                      <li>Activate this desk terminal (<strong>{selectedDesk?.deskName}</strong>) in the Staff Desks builder.</li>
                    )}
                    {(!selectedStaff?.assignedDeskIds.includes(selectedDeskId)) && (
                      <li>Assign this desk terminal code to the operator's clearance profiles.</li>
                    )}
                    {effectivePermissions.length === 0 && (
                      <li>Configure either the Staff Role or the Desk Terminal gateway to grant at least one effective menu capability.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Trigger Authentication button */}
          <button
            onClick={handleLoginClick}
            className={`w-full py-3.5 uppercase font-sans font-black tracking-wider transition-colors border-2 text-center text-xs flex items-center justify-center space-x-2 ${
              accessResolution.allowed
                ? 'bg-[#FF5A00] hover:bg-[#1A1A1A] text-white border-transparent cursor-pointer'
                : 'bg-red-600 hover:bg-red-700 text-white border-transparent cursor-pointer'
            }`}
          >
            <span>Enter SCI Control Centre Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Page Footnotes */}
        <div className="mt-6 pt-4 border-t border-[#D1D1CF] flex justify-between items-center text-xs">
          <button
            onClick={() => {
              localStorage.removeItem('sgn_is_logged_in');
              window.location.reload();
            }}
            className="text-gray-400 hover:text-black font-sans font-semibold uppercase flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
          >
            <span>Sign Out Google account simulator</span>
          </button>
          <span className="text-[9px] text-gray-450 font-mono font-bold">SECURE CHANNEL ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

// Bypassed selectors preserved
export function CompanySelectorView({ onSelectCompany, selectedCompany }: any) {
  return (
    <div className="p-8 text-center font-mono">
      <h2>Company selection bypassed.</h2>
    </div>
  );
}