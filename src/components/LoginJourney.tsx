import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserCheck, 
  User, 
  Loader2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { 
  SCIInternalStaff, 
  SCIStaffRole, 
  SCIStaffDesk, 
  SCIMenuFeature, 
  SCIStaffSession 
} from '../internal/staffTypes';
import { resolveStaffAccess } from '../internal/access';

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
    }, 900);
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
            Account Single Sign-On
          </h2>
          <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto leading-relaxed">
            Authorized entry gateway to the iTred Central Control Centre.
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
                <span>CONNECTING TO GOOGLE OAUTH PROVIDER...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.514 5.514 0 0 1 8.5 13a5.514 5.514 0 0 1 5.491-5.514c2.26 0 3.869 1.007 4.731 1.83l3.245-3.243C19.92 4.155 17.14 2.5 14 2.5a10.5 10.5 0 0 0-10.5 10.5A10.5 10.5 0 0 0 14 23.5c5.77 0 10.5-4.145 10.5-10.5 0-.71-.06-1.4-.18-2.065H12.24Z"
                  />
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
              </>
            )}
          </button>

          <div className="bg-orange-50 border border-orange-200 text-[#1A1A1A] p-4 text-[11px] leading-relaxed font-sans">
            <strong>INTERNAL CONTROL PORTAL:</strong> Google login simulation restricts portal operations to security cleared operators only.
          </div>
        </div>

        <div className="mt-8 border-t border-[#D1D1CF] pt-4 text-center font-mono text-[9px] text-gray-400 uppercase tracking-widest flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#FF5A00]" /> SECURE CHANNEL
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

  // Find a staff member matching the logged-in email, or fall back to the first active staff member
  const defaultStaff = useMemo(() => {
    const matched = internalStaff.find(s => s.email.toLowerCase() === googleEmail.toLowerCase());
    return matched || internalStaff.find(s => s.status === 'active') || internalStaff[0];
  }, [internalStaff, googleEmail]);

  const [selectedStaffId, setSelectedStaffId] = useState<string>(defaultStaff?.staffId || '');

  const selectedStaff = useMemo(() => {
    return internalStaff.find(s => s.staffId === selectedStaffId) || defaultStaff;
  }, [internalStaff, selectedStaffId, defaultStaff]);

  // Filter desks by selected staff member's assignedDeskIds
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
        message: 'Please map all role clearance and desk terminal parameters.'
      };
    }
    return resolveStaffAccess({
      staff: selectedStaff,
      role: selectedRole,
      desk: selectedDesk
    });
  }, [selectedStaff, selectedRole, selectedDesk]);

  // Union of features calculation
  const effectiveMenuCount = useMemo(() => {
    if (!selectedRole || !selectedDesk) return 0;
    const union = new Set([...selectedRole.menuFeatureIds, ...selectedDesk.menuFeatureIds]);
    return union.size;
  }, [selectedRole, selectedDesk]);

  const dashboardType = useMemo(() => {
    if (!selectedDesk || !selectedStaff) return 'executive';
    return selectedDesk.dashboardType || selectedStaff.dashboardType || 'executive';
  }, [selectedDesk, selectedStaff]);

  const handleLoginClick = () => {
    if (accessResolution.allowed && accessResolution.session) {
      onLoginSuccess(accessResolution.session);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F1] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl bg-white border-4 border-[#1A1A1A] p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />

        {/* Section Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1 text-[#FF5A00]">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wider font-sans">
            DELEGATED STAFF CREDENTIALS
          </h2>
          <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto leading-relaxed">
            Select an active operator profile and desk console to resolve terminal clearance levels.
          </p>
        </div>

        <div className="space-y-4 font-mono text-xs text-[#1A1A1A]">
          
          {/* 1. Google Email Placeholder display */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase text-[9px] block font-bold">GOOGLE IDENTITY ACCOUNT</label>
            <div className="bg-gray-100 border border-[#D1D1CF] p-2.5 text-xs text-gray-600 uppercase flex items-center justify-between">
              <span>{googleEmail}</span>
              <span className="bg-green-100 text-green-700 text-[8px] font-black px-1.5 uppercase">Authenticated</span>
            </div>
          </div>

          {/* 2. Staff Selector */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase text-[9px] block font-bold">SELECT STAFF MEMBER PROFILE</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-white border-2 border-[#1A1A1A] p-2.5 text-xs font-bold focus:outline-none uppercase"
            >
              {internalStaff.map(s => (
                <option key={s.staffId} value={s.staffId}>
                  {s.fullName} ({s.staffId}) [{s.status}]
                </option>
              ))}
            </select>
          </div>

          {/* 3. Desk Selector filtered by staff.assignedDeskIds */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase text-[9px] block font-bold">SELECT DESK TERMINAL GATEWAY</label>
            {allowedDesks.length === 0 ? (
              <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-xs italic">
                No desks assigned to this staff profile. Access is blocked.
              </div>
            ) : (
              <select
                value={selectedDeskId}
                onChange={(e) => setSelectedDeskId(e.target.value)}
                className="w-full bg-white border-2 border-[#1A1A1A] p-2.5 text-xs font-bold focus:outline-none uppercase"
              >
                {allowedDesks.map(d => (
                  <option key={d.deskId} value={d.deskId}>
                    {d.deskName} ({d.deskCode}) [{d.status}]
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 4. Details specs panel */}
          {selectedStaff && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 border border-[#D1D1CF] text-[9px] uppercase font-bold text-gray-600">
              <div className="space-y-1">
                <div>Role: <span className="text-[#FF5A00] font-black">{selectedRole?.roleName || 'N/A'}</span></div>
                <div>Dashboard: <span className="text-gray-800">{dashboardType}</span></div>
              </div>
              <div className="space-y-1">
                <div>Effective menu paths: <span className="text-gray-800 font-black">{effectiveMenuCount} Nodes</span></div>
                <div>canCreateEmployee: <span className={selectedStaff.canCreateEmployee || selectedRole?.canCreateEmployee ? "text-green-600" : "text-gray-400"}>
                  {selectedStaff.canCreateEmployee || selectedRole?.canCreateEmployee ? 'True' : 'False'}
                </span></div>
              </div>
            </div>
          )}

          {/* 5. Access Decision Panel */}
          <div className="pt-2">
            <div className={`p-4 border-2 flex items-start space-x-3 ${
              accessResolution.allowed 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              <div className="shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black uppercase tracking-wider text-[10px]">
                  Clearance Resolution: {accessResolution.reasonCode}
                </div>
                <p className="text-[11px] mt-0.5 leading-relaxed font-sans normal-case text-gray-600">
                  {accessResolution.message}
                </p>
              </div>
            </div>
          </div>

          {/* 6. Sign in Trigger Button */}
          <button
            onClick={handleLoginClick}
            disabled={!accessResolution.allowed}
            className={`w-full py-3.5 uppercase font-sans font-black tracking-wider transition-colors border-2 text-center text-xs flex items-center justify-center space-x-2 ${
              accessResolution.allowed
                ? 'bg-[#FF5A00] hover:bg-[#1A1A1A] text-white border-transparent cursor-pointer'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Enter Control Centre Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footnotes */}
        <div className="mt-6 pt-4 border-t border-[#D1D1CF] flex justify-between items-center text-xs">
          <button
            onClick={() => {
              // Sign out from google auth placeholder
              localStorage.removeItem('sgn_is_logged_in');
              window.location.reload();
            }}
            className="text-gray-400 hover:text-black font-sans font-semibold uppercase flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
          >
            <span>Sign Out Google Account</span>
          </button>
          <span className="text-[10px] text-gray-400 font-mono">CREDENTIALS PORTAL</span>
        </div>
      </div>
    </div>
  );
}

// Keeping the older tenant company selector exported so we don't break any build paths
export function CompanySelectorView({ onSelectCompany, selectedCompany }: any) {
  return (
    <div className="p-8 text-center font-mono">
      <h2>Company selection bypassed.</h2>
    </div>
  );
}
