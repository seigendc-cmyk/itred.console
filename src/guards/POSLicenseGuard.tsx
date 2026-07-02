import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLifecycle } from '../App';
import { licenseReaderService } from '../services/licenseReaderService';
import { ShieldAlert } from 'lucide-react';

interface POSLicenseGuardProps {
  children: React.ReactNode;
}

export default function POSLicenseGuard({ children }: POSLicenseGuardProps) {
  const { currentCompany, vendors, posLicenses } = useLifecycle();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyPOSLicense() {
      if (!currentCompany) {
        setErrorMsg('No POS license found');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      // Find selected vendor
      const vendor = vendors.find((v: any) => v.name === currentCompany);
      if (!vendor) {
        setErrorMsg('No POS license found');
        setLoading(false);
        return;
      }

      // Query the active POS license
      const license = await licenseReaderService.getPOSLicense(vendor.id);
      if (!license) {
        setErrorMsg('No POS license found');
        setLoading(false);
        return;
      }

      // Validate license status
      if (license.status === 'pending') {
        setErrorMsg('POS license pending activation');
        setLoading(false);
        return;
      }
      if (license.status === 'expired') {
        setErrorMsg('POS license expired');
        setLoading(false);
        return;
      }
      if (license.status === 'suspended') {
        setErrorMsg('POS license suspended');
        setLoading(false);
        return;
      }
      if (license.status === 'revoked') {
        setErrorMsg('POS license revoked');
        setLoading(false);
        return;
      }
      if (license.status !== 'active') {
        setErrorMsg('No POS license found');
        setLoading(false);
        return;
      }

      // Validate expiresAt date
      const expiry = new Date(license.expiresAt);
      if (expiry < new Date()) {
        setErrorMsg('POS license expired');
        setLoading(false);
        return;
      }

      // Validate license Mode vs context
      if (license.licenseMode === 'production') {
        if (license.storageMode !== 'cloud') {
          setErrorMsg('Demo mode cannot access production POS cloud mode');
          setLoading(false);
          return;
        }

        // Active production terminal enforcement limits
        // 1. Terminals check (active pos licenses matching this vendor)
        const activeTerminals = posLicenses.filter((lic: any) => lic.vendorName === vendor.name && (lic.status === 'Active' || lic.status === 'active')).length;
        
        const terminalsLimit = license.maxTerminals === 'Unlimited' ? Infinity : license.maxTerminals;
        if (activeTerminals > terminalsLimit) {
          setErrorMsg('POS license limit exceeded: active terminals exceed plan limit');
          setLoading(false);
          return;
        }

        // 2. Mock branch check
        let branches = 1;
        if (vendor.id === 'V-802') branches = 2; // NexaRetail
        else if (vendor.id === 'V-774') branches = 4; // Zephyr
        else if (vendor.id === 'V-311') branches = 2; // KronoMart
        
        const branchesLimit = license.maxBranches === 'Unlimited' ? Infinity : license.maxBranches;
        if (branches > branchesLimit) {
          setErrorMsg('POS license limit exceeded: active branches exceed plan limit');
          setLoading(false);
          return;
        }

        // 3. Mock staff check
        let staff = 2;
        if (vendor.id === 'V-802') staff = 5; // NexaRetail
        else if (vendor.id === 'V-774') staff = 12; // Zephyr
        else if (vendor.id === 'V-311') staff = 4; // KronoMart
        
        const staffLimit = license.maxStaff === 'Unlimited' ? Infinity : license.maxStaff;
        if (staff > staffLimit) {
          setErrorMsg('POS license limit exceeded: active staff exceed plan limit');
          setLoading(false);
          return;
        }
      } else if (license.licenseMode === 'demo') {
        // Enforce that demo license only operates in localOnly mode
        if (license.storageMode !== 'localOnly') {
          setErrorMsg('Demo mode cannot access production POS cloud mode');
          setLoading(false);
          return;
        }
      }

      setLoading(false);
    }

    verifyPOSLicense();
  }, [currentCompany, vendors, posLicenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F1] flex flex-col justify-center items-center font-mono text-xs">
        <div className="animate-pulse text-gray-500 uppercase tracking-widest">
          Verifying Core Licensing Signatures...
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col justify-center items-center p-4 select-none">
        <div className="w-full max-w-md bg-stone-900 border-2 border-[#FF5A00] p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
          
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 border border-[#FF5A00]/30 bg-[#FF5A00]/10 text-[#FF5A00]">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-sm font-mono font-black text-gray-400 uppercase tracking-wider">
                SECURITY COMPLIANCE ALERT
              </h2>
              <h1 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                POS ACCESS TERMINATED
              </h1>
            </div>

            <div className="bg-[#1A1A1A] p-4 border border-[#FF5A00]/25 font-mono text-xs text-center text-[#FF5A00] font-bold uppercase tracking-wide">
              {errorMsg}
            </div>

            <p className="text-xs text-gray-400 font-sans leading-relaxed max-w-sm mx-auto">
              This terminal is blocked from registering sessions for company <strong>{currentCompany}</strong>. Ensure billing is settled, active POS licenses are provisioned, and limits are not exceeded.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-stone-850 flex flex-col gap-2">
            <button
              onClick={() => navigate('/company-selector')}
              className="w-full bg-[#FF5A00] hover:bg-[#E04F00] text-white py-2 px-4 text-xs font-mono font-bold uppercase text-center transition-all cursor-pointer rounded-none border border-transparent"
            >
              Select Another Company
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-transparent border border-stone-700 hover:border-[#FF5A00] text-gray-300 hover:text-white py-2 px-4 text-xs font-mono font-bold uppercase text-center transition-all cursor-pointer rounded-none"
            >
              Back to Auth
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
