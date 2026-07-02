import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Building, 
  MapPin, 
  Mail, 
  Code, 
  Calendar, 
  Check, 
  ArrowRight,
  ChevronRight,
  Activity,
  Coins,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Vendor, Plan, RPNAgent } from '../types';

// Steps list for visualization and debugging
export const LIFECYCLE_STEPS = [
  { phase: 1, label: 'Google Login', path: '/login' },
  { phase: 2, label: 'Company Selector', path: '/company-selector' },
  { phase: 3, label: 'Staff Access', path: '/staff-access' },
  { phase: 4, label: 'Dashboard Home', path: '/dashboard' },
  { phase: 5, label: 'Create Vendor', path: '/lifecycle/create-vendor' },
  { phase: 6, label: 'Pending Verify', path: (id: string) => `/lifecycle/pending-verification/${id}` },
  { phase: 7, label: 'Admin Approval', path: (id: string) => `/lifecycle/admin-approval/${id}` },
  { phase: 8, label: 'Assign Plan', path: (id: string) => `/lifecycle/assign-plan/${id}` },
  { phase: 9, label: 'POS License', path: (id: string) => `/lifecycle/issue-pos-license/${id}` },
  { phase: 10, label: 'Activate Apps', path: (id: string) => `/lifecycle/activate-apps/${id}` },
  { phase: 11, label: 'Vendor Ready', path: (id: string) => `/lifecycle/vendor-ready/${id}` }
];

// Helper to render the shared visual stepper bar
export function LifecycleStepper({ currentPhase }: { currentPhase: number }) {
  return (
    <div className="w-full bg-white border border-[#D1D1CF] p-4 font-mono text-xs">
      {/* Mobile Stepper Representation */}
      <div className="md:hidden flex justify-between items-center">
        <div>
          <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">LIFECYCLE FLOW</span>
          <div className="text-[#1A1A1A] font-bold uppercase">
            Phase {currentPhase} of 11: {LIFECYCLE_STEPS[currentPhase - 1]?.label}
          </div>
        </div>
        <div className="text-[#FF5A00] font-bold text-sm">
          {Math.round((currentPhase / 11) * 100)}%
        </div>
      </div>
      <div className="md:hidden w-full bg-gray-200 h-2 mt-2">
        <div 
          className="bg-[#FF5A00] h-2 transition-all duration-300" 
          style={{ width: `${(currentPhase / 11) * 100}%` }}
        />
      </div>

      {/* Desktop Stepper Representation */}
      <div className="hidden md:flex justify-between items-center relative">
        {/* Horizontal connector line */}
        <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
        
        {LIFECYCLE_STEPS.map((step) => {
          const isActive = step.phase === currentPhase;
          const isCompleted = step.phase < currentPhase;
          
          return (
            <div key={step.phase} className="flex flex-col items-center z-10 relative">
              <div 
                className={`w-9 h-9 flex items-center justify-center font-bold font-mono transition-all duration-200 border-2 ${
                  isActive 
                    ? 'bg-[#FF5A00] border-[#FF5A00] text-white shadow-md animate-pulse scale-105' 
                    : isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white border-[#D1D1CF] text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.phase}
              </div>
              <span className={`text-[9px] mt-2 font-bold uppercase tracking-wider text-center ${
                isActive ? 'text-[#FF5A00]' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
              }`}>
                {step.label.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   PHASE 5: CREATE VENDOR
   ========================================================================== */
interface CreateVendorWizardProps {
  onCreateVendor: (vendor: Omit<Vendor, 'id' | 'code' | 'joinedDate'>) => void;
  vendors: Vendor[];
  rpnAgents?: RPNAgent[];
}

export function CreateVendorWizard({ onCreateVendor, vendors, rpnAgents = [] }: CreateVendorWizardProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grocery & Hypermarket');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [selectedRpnId, setSelectedRpnId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Company name is required');
    if (!email.trim()) return setError('Contact email is required');
    if (!location.trim()) return setError('Operational location is required');

    const chosenRpn = rpnAgents.find(agent => agent.id === selectedRpnId);

    // Create vendor
    onCreateVendor({
      name,
      category,
      email,
      location,
      status: 'Pending Verification',
      linkedRpnId: chosenRpn ? chosenRpn.id : undefined,
      linkedRpnName: chosenRpn ? chosenRpn.name : undefined
    });

    // Find next generated ID. The state modification pushes the new vendor to top.
    // We can simulate finding the temporary ID (next V-XXX number)
    const nextNum = vendors.length + 101;
    const generatedId = `V-${nextNum}`;

    navigate(`/lifecycle/pending-verification/${generatedId}`);
  };

  return (
    <div className="space-y-6">
      <LifecycleStepper currentPhase={5} />

      <div className="max-w-xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-4 mb-6">
          <Users className="w-6 h-6 text-[#FF5A00]" />
          <div>
            <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wide">PHASE 5 — REGISTER NEW VENDOR MODULE</h2>
            <p className="text-[10px] text-gray-500 font-mono">BROADCAST NEW IDENTITY BLOCK TO LEDGER</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 text-xs uppercase font-mono mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
          <div className="space-y-2">
            <label className="text-[#1A1A1A] font-bold uppercase block">VENDOR COMPANY NAME</label>
            <input
              type="text"
              placeholder="e.g. Orion Prime Distributors"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[#1A1A1A] font-bold uppercase block">INDUSTRY SEGMENT</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
              >
                <option value="Grocery & Hypermarket">Grocery & Hypermarket</option>
                <option value="General Goods">General Goods</option>
                <option value="Convenience Stores">Convenience Stores</option>
                <option value="Apparel & Footwear">Apparel & Footwear</option>
                <option value="Fuel & Convenience">Fuel & Convenience</option>
                <option value="Building Materials">Building Materials</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[#1A1A1A] font-bold uppercase block">OPERATIONAL HUB BIND</label>
              <input
                type="text"
                placeholder="e.g. Berlin, DE"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setError(''); }}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[#1A1A1A] font-bold uppercase block">CONTACT COMPLIANCE EMAIL</label>
            <input
              type="email"
              placeholder="e.g. compliance@orion-prime.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold lowercase rounded-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#1A1A1A] font-bold uppercase block">RPN ROUTING GATEWAY</label>
            <select
              value={selectedRpnId}
              onChange={(e) => setSelectedRpnId(e.target.value)}
              className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
            >
              <option value="">Direct / Standalone Routing (No RPN)</option>
              {rpnAgents && rpnAgents.map((agent: any) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.region}) — {agent.connectionStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-orange-50 border border-orange-200 text-[#1A1A1A] p-4 text-[11px] leading-relaxed font-sans">
            <strong>COMPLIANCE BIND WARNING:</strong> Submitting registers this merchant module as <strong>'Pending Verification'</strong>. Outbound POS terminal sync remains hardlocked until manual administrative compliance override is passed.
          </div>

          <div className="pt-4 flex space-x-3">
            <Link
              to="/dashboard"
              className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-3 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-all font-sans"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-3 uppercase font-bold text-center tracking-wide transition-all font-sans flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>REGISTER VENDOR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ==========================================================================
   PHASE 6: PENDING VERIFICATION
   ========================================================================== */
interface PendingVerificationWizardProps {
  vendors: Vendor[];
}

export function PendingVerificationWizard({ vendors }: PendingVerificationWizardProps) {
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const vendor = useMemo(() => {
    return vendors.find(v => v.id === vendorId) || vendors[0];
  }, [vendors, vendorId]);

  if (!vendor) {
    return <div className="text-center py-12 uppercase font-mono">VENDOR NOT FOUND</div>;
  }

  return (
    <div className="space-y-6">
      <LifecycleStepper currentPhase={6} />

      <div className="max-w-xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-4 mb-6">
          <ShieldAlert className="w-6 h-6 text-[#FF5A00]" />
          <div>
            <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wide">PHASE 6 — PENDING OPERATIONAL CLEARANCE</h2>
            <p className="text-[10px] text-gray-500 font-mono">ECOSYSTEM ISOLATION BUFFER SEQUENCE</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Alert */}
          <div className="bg-amber-50 border-2 border-[#FF5A00] p-4 text-[#1A1A1A] space-y-2">
            <span className="font-bold font-mono text-xs uppercase bg-[#FF5A00] text-white px-2 py-0.5 inline-block">
              PENDING AUDIT clearance
            </span>
            <p className="text-xs font-sans leading-relaxed">
              Vendor module <strong>{vendor.name}</strong> was successfully registered on {vendor.joinedDate || 'today'}. Access is temporarily suspended in compliance with the isolation buffer configuration. An admin override audit is required.
            </p>
          </div>

          {/* Vendor profile details card */}
          <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-5 font-mono text-xs space-y-3">
            <h3 className="font-bold text-gray-400 uppercase tracking-wider border-b border-[#D1D1CF] pb-1">
              REGISTRATION DEPLOYMENT METADATA
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-gray-400 uppercase block">VENDOR ASSIGNED ID</span>
                <span className="font-bold text-[#1A1A1A] uppercase">{vendor.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block">REGISTRATION CODE</span>
                <span className="font-bold text-[#1A1A1A] uppercase">{vendor.code || 'PENDING'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block">INDUSTRY SEGMENT</span>
                <span className="font-bold text-[#1A1A1A] uppercase">{vendor.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase block">REGIONAL GATEWAY BIND</span>
                <span className="font-bold text-[#1A1A1A] uppercase">{vendor.location}</span>
              </div>
            </div>
          </div>

          {/* Simulated Decrypt check logs */}
          <div className="bg-gray-950 border border-[#2A2A2A] p-4 text-[#8E9299] font-mono text-[10px] space-y-1 rounded-none leading-relaxed">
            <div className="text-[#FF5A00]">sys_daemon[409]: initializing isolated verification sequence...</div>
            <div>sys_daemon[410]: checking host domain authority {"→ [PASS]"}</div>
            <div>sys_daemon[411]: checking blacklist directory logs {"→ [PASS]"}</div>
            <div className="text-yellow-500">sys_daemon[412]: WARNING: licensing tokens require compliance audit</div>
            <div className="text-emerald-400">sys_daemon[413]: vendor is safely buffered. awaiting audit trigger.</div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-3 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-all font-sans"
            >
              EXIT TO DASHBOARD
            </button>
            <button
              onClick={() => navigate(`/lifecycle/admin-approval/${vendor.id}`)}
              className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-3 uppercase font-bold text-center tracking-wide transition-all font-sans flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>TRIGGER AUDIT ROUTE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   PHASE 7: ADMIN APPROVAL
   ========================================================================== */
interface AdminApprovalWizardProps {
  vendors: Vendor[];
  onApproveVendor: (vendorId: string) => void;
}

export function AdminApprovalWizard({ vendors, onApproveVendor }: AdminApprovalWizardProps) {
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  const vendor = useMemo(() => {
    return vendors.find(v => v.id === vendorId) || vendors[0];
  }, [vendors, vendorId]);

  if (!vendor) {
    return <div className="text-center py-12 uppercase font-mono">VENDOR NOT FOUND</div>;
  }

  const isAllChecked = check1 && check2 && check3;

  const handleApprove = () => {
    if (!isAllChecked) return;
    onApproveVendor(vendor.id);
    navigate(`/lifecycle/assign-plan/${vendor.id}`);
  };

  return (
    <div className="space-y-6">
      <LifecycleStepper currentPhase={7} />

      <div className="max-w-xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-4 mb-6">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wide">PHASE 7 — COMPLIANCE SECURITY OVERRIDE</h2>
            <p className="text-[10px] text-gray-500 font-mono">ADMINISTRATIVE CLEARANCE CERTIFICATE GATEWAY</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-4 text-xs font-sans text-gray-700 leading-relaxed">
            Verify the compliance details of <strong>{vendor.name}</strong> ({vendor.id}) and complete the operational audit checklist. Passing this audit clears the merchant to join the active licensing queue.
          </div>

          {/* Checklist */}
          <div className="space-y-3 font-mono text-xs">
            <h3 className="font-bold text-gray-400 uppercase tracking-wider block">
              OPERATIONAL HARDENING CHECKLIST
            </h3>

            <div 
              onClick={() => setCheck1(!check1)}
              className={`p-4 border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                check1 ? 'border-emerald-600 bg-emerald-50/20' : 'border-[#D1D1CF] bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 ${
                check1 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#D1D1CF]'
              }`}>
                {check1 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
              </div>
              <div>
                <div className="font-bold text-[#1A1A1A] uppercase">1. MERCHANT IDENTITY BIND</div>
                <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                  Confirm company name alignment with official national chambers of commerce and verify operational tax residency ({vendor.location}).
                </p>
              </div>
            </div>

            <div 
              onClick={() => setCheck2(!check2)}
              className={`p-4 border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                check2 ? 'border-emerald-600 bg-emerald-50/20' : 'border-[#D1D1CF] bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 ${
                check2 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#D1D1CF]'
              }`}>
                {check2 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
              </div>
              <div>
                <div className="font-bold text-[#1A1A1A] uppercase">2. CRYPTOGRAPHIC CREDENTIAL BIND</div>
                <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                  Establish isolated testing keys, test webhooks, and match digital signing credentials with target nodes.
                </p>
              </div>
            </div>

            <div 
              onClick={() => setCheck3(!check3)}
              className={`p-4 border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                check3 ? 'border-emerald-600 bg-emerald-50/20' : 'border-[#D1D1CF] bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 ${
                check3 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#D1D1CF]'
              }`}>
                {check3 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
              </div>
              <div>
                <div className="font-bold text-[#1A1A1A] uppercase">3. VERIFICATION DEPOSIT RECORD</div>
                <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                  Certify the clearing-house safety deposit has cleared (automatically provisions inbound $500.00 credit to ledger).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              onClick={() => navigate(`/lifecycle/pending-verification/${vendor.id}`)}
              className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-3 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-all font-sans cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleApprove}
              disabled={!isAllChecked}
              className={`flex-1 py-3 uppercase font-bold text-center tracking-wide transition-all font-sans flex items-center justify-center space-x-2 cursor-pointer ${
                isAllChecked 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
              }`}
            >
              <span>AUDIT PASS & APPROVE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   PHASE 8: ASSIGN PRICING PLAN
   ========================================================================== */
interface AssignPlanWizardProps {
  vendors: Vendor[];
  plans: Plan[];
  onAssignPlan?: (vendorId: string, planId: string) => void;
}

export function AssignPlanWizard({ vendors, plans, onAssignPlan }: AssignPlanWizardProps) {
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');

  const vendor = useMemo(() => {
    return vendors.find(v => v.id === vendorId) || vendors[0];
  }, [vendors, vendorId]);

  if (!vendor) {
    return <div className="text-center py-12 uppercase font-mono">VENDOR NOT FOUND</div>;
  }

  const handleAssign = () => {
    if (onAssignPlan) {
      onAssignPlan(vendor.id, selectedPlanId);
    }
    // Save selection in session storage for the final wizard summary
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    if (selectedPlan) {
      sessionStorage.setItem(`assigned_plan_${vendor.id}`, JSON.stringify(selectedPlan));
    }
    navigate(`/lifecycle/issue-pos-license/${vendor.id}`);
  };

  return (
    <div className="space-y-6">
      <LifecycleStepper currentPhase={8} />

      <div className="max-w-xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-4 mb-6">
          <Layers className="w-6 h-6 text-[#FF5A00]" />
          <div>
            <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wide">PHASE 8 — ASSIGN BILLING PLAN SLAB</h2>
            <p className="text-[10px] text-gray-500 font-mono">CONSOLIDATE TRANSACTION CLEARING SCHEMAS</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="text-xs font-sans text-gray-500 leading-relaxed">
            Select a commercial pricing slab profile to link with the merchant node for <strong>{vendor.name}</strong>. Hybrid models permit simultaneous app integrations and POS terminal licenses.
          </div>

          {/* Pricing cards */}
          <div className="space-y-3 font-mono text-xs max-h-80 overflow-y-auto pr-1">
            {plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-4 border cursor-pointer transition-all flex justify-between items-center ${
                    isSelected 
                      ? 'border-[#FF5A00] bg-orange-50/10' 
                      : 'border-[#D1D1CF] bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-[#1A1A1A] uppercase flex items-center space-x-2">
                      <span>{plan.name}</span>
                      <span className="bg-gray-200 text-gray-700 px-1 text-[9px] uppercase font-bold tracking-wider rounded-none">
                        {plan.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block uppercase">
                      ID: {plan.id} • {plan.activeVendors} merchants synced
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-[#1A1A1A] block font-mono">
                      ${plan.price}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">
                      /{plan.interval === 'Monthly' ? 'MO' : 'YR'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              onClick={() => navigate(`/lifecycle/admin-approval/${vendor.id}`)}
              className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-3 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-all font-sans cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleAssign}
              className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-3 uppercase font-bold text-center tracking-wide transition-all font-sans flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>PROVISION PLAN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   PHASE 9: ISSUE POS LICENSE
   ========================================================================== */
interface IssuePOSLicenseWizardProps {
  vendors: Vendor[];
  onIssueLicense: (vendorName: string, terminalId: string, licenseKey: string) => void;
}

export function IssuePOSLicenseWizard({ vendors, onIssueLicense }: IssuePOSLicenseWizardProps) {
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const [terminalId, setTerminalId] = useState(`TRM-NYC-${Math.floor(100 + Math.random() * 900)}`);
  const [licenseKey, setLicenseKey] = useState(`ITRD-POS-C10A-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [error, setError] = useState('');

  const vendor = useMemo(() => {
    return vendors.find(v => v.id === vendorId) || vendors[0];
  }, [vendors, vendorId]);

  if (!vendor) {
    return <div className="text-center py-12 uppercase font-mono">VENDOR NOT FOUND</div>;
  }

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalId.trim()) return setError('Terminal ID is required');
    if (!licenseKey.trim()) return setError('License key is required');

    onIssueLicense(vendor.name, terminalId, licenseKey);
    
    // Save in session storage
    sessionStorage.setItem(`issued_pos_${vendor.id}`, JSON.stringify({ terminalId, licenseKey }));
    
    navigate(`/lifecycle/activate-apps/${vendor.id}`);
  };

  return (
    <div className="space-y-6">
      <LifecycleStepper currentPhase={9} />

      <div className="max-w-xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-4 mb-6">
          <Terminal className="w-6 h-6 text-[#FF5A00]" />
          <div>
            <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wide">PHASE 9 — POS COMPLIANCE LICENSING</h2>
            <p className="text-[10px] text-gray-500 font-mono">REGISTER DEPLOYED PHYSICAL DEVICE NODE</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 text-xs uppercase font-mono mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleIssue} className="space-y-5 font-mono text-xs">
          <div className="space-y-1 bg-[#F4F4F1] border border-[#D1D1CF] p-4 text-xs font-sans text-gray-600 leading-relaxed mb-2">
            Target Merchant: <strong className="text-black font-bold uppercase">{vendor.name}</strong> • Node binding ID: <strong className="text-black font-bold font-mono">{vendor.id}</strong>
          </div>

          <div className="space-y-2">
            <label className="text-[#1A1A1A] font-bold uppercase block">PHYSICAL TERMINAL ID</label>
            <input
              type="text"
              placeholder="e.g. TRM-TYO-991"
              value={terminalId}
              onChange={(e) => { setTerminalId(e.target.value); setError(''); }}
              className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-bold uppercase rounded-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#1A1A1A] font-bold uppercase block">COMPLIANCE DECRYPT SECURITY BIND KEY</label>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={licenseKey}
                className="w-full bg-[#EAEAE8] border border-[#D1D1CF] p-3 text-xs text-gray-600 font-bold uppercase rounded-none select-all cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setLicenseKey(`ITRD-POS-C10A-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`)}
                className="bg-[#1A1A1A] text-white hover:bg-[#FF5A00] px-4 font-sans font-bold uppercase text-[10px] tracking-wider transition-all rounded-none cursor-pointer"
              >
                GENERATE
              </button>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 text-[#1A1A1A] p-4 text-[11px] leading-relaxed font-sans">
            <strong>HARDWARE CERTIFICATION NOTICE:</strong> Issuing binds this key to the physical terminal interface. Automatically bills $850.00 registration fee credit to ledger balance.
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/lifecycle/assign-plan/${vendor.id}`)}
              className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-3 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-all font-sans cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-3 uppercase font-bold text-center tracking-wide transition-all font-sans flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>ISSUE LICENSE KEY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ==========================================================================
   PHASE 10: ACTIVATE APPS
   ========================================================================== */
interface ActivateAppsWizardProps {
  vendors: Vendor[];
  onActivateApp: (vendorName: string, appName: string, key: string) => void;
}

const AVAILABLE_PLUGINS = [
  { name: 'Multi-Channel StockSync', description: 'Real-time inventory mapping across regional nodes.', version: 'v1.4.1' },
  { name: 'iTred Automated Ledger Pro', description: 'Synchronized accounting, transaction logs, and finance ledger audits.', version: 'v8.9' },
  { name: 'GeoFence Logistics Beacon', description: 'Coordinates freight coordinates with physical shipping nodes.', version: 'v4.0' }
];

export function ActivateAppsWizard({ vendors, onActivateApp }: ActivateAppsWizardProps) {
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const [selectedApps, setSelectedApps] = useState<string[]>([AVAILABLE_PLUGINS[0].name]);

  const vendor = useMemo(() => {
    return vendors.find(v => v.id === vendorId) || vendors[0];
  }, [vendors, vendorId]);

  if (!vendor) {
    return <div className="text-center py-12 uppercase font-mono">VENDOR NOT FOUND</div>;
  }

  const handleToggle = (appName: string) => {
    if (selectedApps.includes(appName)) {
      setSelectedApps(prev => prev.filter(n => n !== appName));
    } else {
      setSelectedApps(prev => [...prev, appName]);
    }
  };

  const handleActivate = () => {
    selectedApps.forEach(appName => {
      const randToken = `SGN-APP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      onActivateApp(vendor.name, appName, randToken);
    });

    // Save active apps selection in session storage
    sessionStorage.setItem(`activated_apps_${vendor.id}`, JSON.stringify(selectedApps));

    navigate(`/lifecycle/vendor-ready/${vendor.id}`);
  };

  return (
    <div className="space-y-6">
      <LifecycleStepper currentPhase={10} />

      <div className="max-w-xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-4 mb-6">
          <Cpu className="w-6 h-6 text-[#FF5A00]" />
          <div>
            <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wide">PHASE 10 — ACTIVATE PLUGIN INTERFACES</h2>
            <p className="text-[10px] text-gray-500 font-mono">SECURE INTEGRATION GATEWAY APIS</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="text-xs font-sans text-gray-500 leading-relaxed">
            Select standard plugins and decentralized APIs to provision for <strong>{vendor.name}</strong>. Activated applications receive access tokens to interface securely with the iTred core.
          </div>

          <div className="space-y-3 font-mono text-xs">
            {AVAILABLE_PLUGINS.map((app) => {
              const isChecked = selectedApps.includes(app.name);
              return (
                <div 
                  key={app.name}
                  onClick={() => handleToggle(app.name)}
                  className={`p-4 border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                    isChecked ? 'border-[#FF5A00] bg-orange-50/10' : 'border-[#D1D1CF] bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    isChecked ? 'bg-[#FF5A00] border-[#FF5A00] text-white' : 'border-[#D1D1CF]'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#1A1A1A] uppercase">{app.name}</span>
                      <span className="bg-gray-100 text-gray-600 px-1 py-0.5 text-[8px] font-bold tracking-wider rounded-none font-mono">
                        {app.version}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-sans mt-1">
                      {app.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-orange-50 border border-orange-200 text-[#1A1A1A] p-4 text-[11px] leading-relaxed font-sans">
            <strong>SUBSCRIPTION TRIGGER:</strong> Each plugin activation initiates a $1,200.00 integration setup record to the corporate ledger indices.
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              onClick={() => navigate(`/lifecycle/issue-pos-license/${vendor.id}`)}
              className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-3 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-all font-sans cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleActivate}
              className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-3 uppercase font-bold text-center tracking-wide transition-all font-sans flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>ACTIVATE PLUGINS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   PHASE 11: VENDOR READY
   ========================================================================== */
interface VendorReadyWizardProps {
  vendors: Vendor[];
}

export function VendorReadyWizard({ vendors }: VendorReadyWizardProps) {
  const navigate = useNavigate();
  const { vendorId } = useParams();

  const vendor = useMemo(() => {
    return vendors.find(v => v.id === vendorId) || vendors[0];
  }, [vendors, vendorId]);

  // Retrieve integration parameters from session storage
  const assignedPlan = useMemo(() => {
    const raw = sessionStorage.getItem(`assigned_plan_${vendorId}`);
    return raw ? JSON.parse(raw) : { name: 'seiGEN Core Enterprise', price: 2499, type: 'Hybrid', interval: 'Monthly' };
  }, [vendorId]);

  const issuedPOS = useMemo(() => {
    const raw = sessionStorage.getItem(`issued_pos_${vendorId}`);
    return raw ? JSON.parse(raw) : { terminalId: 'TRM-NYC-802', licenseKey: 'ITRD-POS-C10A-7731-901B' };
  }, [vendorId]);

  const activatedApps = useMemo(() => {
    const raw = sessionStorage.getItem(`activated_apps_${vendorId}`);
    return raw ? JSON.parse(raw) : ['Multi-Channel StockSync'];
  }, [vendorId]);

  if (!vendor) {
    return <div className="text-center py-12 uppercase font-mono">VENDOR NOT FOUND</div>;
  }

  return (
    <div className="space-y-6">
      <LifecycleStepper currentPhase={11} />

      <div className="max-w-2xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 shadow-xl relative overflow-hidden">
        {/* Victory corner banner */}
        <div className="absolute top-0 right-0 bg-[#FF5A00] text-white text-[9px] font-mono px-8 py-1 rotate-45 translate-x-7 translate-y-3 font-bold uppercase tracking-wider">
          CERTIFIED
        </div>

        <div className="flex items-center space-x-3 border-b-2 border-emerald-500 pb-4 mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h2 className="text-xl font-bold uppercase text-[#1A1A1A] tracking-wider font-sans">PHASE 11 — VENDOR INTEGRATION STACK COMPLETE</h2>
            <p className="text-[10px] text-emerald-600 font-mono font-bold uppercase tracking-widest">
              STATUS: READY & SYNCED — CLEARANCE LEVEL: LIVE
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-xs font-sans text-gray-700 leading-relaxed">
            The merchant vendor integration protocol for <strong>{vendor.name}</strong> is completely established. All hardware nodes are initialized, subscriptions provisioned, and gateway routes verified.
          </p>

          {/* Certificate design */}
          <div className="border-2 border-dashed border-[#D1D1CF] p-6 bg-[#F4F4F1] font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#D1D1CF] pb-2 text-[10px] text-gray-400 font-bold">
              <span>seiGEN MERCHANT AUTHORITY COUNCIL</span>
              <span>NO: SGN-V-{vendor.id.split('-')[1] || '802'}</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">AUTHORIZED MERCHANT</span>
                  <span className="font-bold text-[#1A1A1A] text-sm font-sans uppercase block">{vendor.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">NODE UNIQUE IDENTIFIER</span>
                  <span className="font-bold text-[#1A1A1A] text-sm uppercase block">{vendor.id} ({vendor.code})</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">SUBSCRIPTION PLAN Tier</span>
                  <span className="font-bold text-[#1A1A1A] uppercase block">
                    {assignedPlan.name} (${assignedPlan.price}/{assignedPlan.interval === 'Monthly' ? 'MO' : 'YR'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">LICENSED POS HW TERMINAL</span>
                  <span className="font-bold text-gray-800 uppercase block">
                    {issuedPOS.terminalId} • Key: <span className="font-mono text-[10px] font-bold text-[#FF5A00]">{issuedPOS.licenseKey.substring(0, 13)}...</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-[#D1D1CF] pt-2.5">
                <span className="text-[10px] text-gray-400 uppercase block mb-1">PROVISIONED APPS / GATEWAYS</span>
                <div className="flex flex-wrap gap-1.5">
                  {activatedApps.map((app: string) => (
                    <span key={app} className="bg-[#1A1A1A] text-white px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-none font-mono">
                      {app}
                    </span>
                  ))}
                  {activatedApps.length === 0 && (
                    <span className="text-gray-400 italic text-[10px]">None activated</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs created during the lifecycle */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest block">
              SECURE INTEGRATION AUDIT TRAIL
            </span>
            <div className="bg-gray-950 p-4 border border-[#2A2A2A] text-[10px] text-[#8E9299] font-mono rounded-none leading-relaxed space-y-1">
              <div>[COMPLIANCE] REGISTER_VENDOR_PENDING {"→"} {vendor.name} ({vendor.id}) {"→"} <span className="text-green-400">Success</span></div>
              <div>[COMPLIANCE] APPROVE_VENDOR_VERIFICATION {"→ Passed Identity Checks →"} <span className="text-green-400">Success</span></div>
              <div>[FINANCE] RECORD_SAFETY_DEPOSIT_CREDIT {"→ Inbound Deposit verified →"} <span className="text-green-400">Success</span></div>
              <div>[LEDGER] PROVISION_PRICING_PLAN {"→ Assigned"} {assignedPlan.name} {"→"} <span className="text-green-400">Success</span></div>
              <div>[LEDGER] ISSUE_POS_LICENSE {"→ Binds node terminal"} {issuedPOS.terminalId} {"→"} <span className="text-green-400">Success</span></div>
              {activatedApps.map((app: string) => (
                <div key={app}>[GATEWAY] PROVISION_APP_INTEGRATION {"→ Enabled plugin:"} {app} {"→"} <span className="text-green-400">Success</span></div>
              ))}
              <div className="text-emerald-400 animate-pulse font-bold mt-1">*** INTERFACES FULLY OPERATIONAL ***</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                // Clear session storage values for safety/next run
                sessionStorage.removeItem(`assigned_plan_${vendorId}`);
                sessionStorage.removeItem(`issued_pos_${vendorId}`);
                sessionStorage.removeItem(`activated_apps_${vendorId}`);
                
                navigate('/dashboard');
              }}
              className="w-full bg-[#1A1A1A] hover:bg-[#FF5A00] text-white py-3.5 uppercase font-bold text-center tracking-wider transition-all font-sans cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>RETURN TO CONTROL CONSOLE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
