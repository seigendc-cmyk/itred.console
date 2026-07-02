import React from 'react';
import { AppLicense } from '../types';
import { Cpu, Plus, Sparkles, AlertOctagon } from 'lucide-react';

interface AppLicensingViewProps {
  appLicenses: AppLicense[];
  searchQuery: string;
  onActivateAppClick: () => void;
  onToggleAppStatus: (licenseId: string) => void;
}

export default function AppLicensingView({
  appLicenses,
  searchQuery,
  onActivateAppClick,
  onToggleAppStatus
}: AppLicensingViewProps) {
  
  const filtered = appLicenses.filter(app => {
    const q = searchQuery.toLowerCase();
    return (
      app.appName.toLowerCase().includes(q) ||
      app.vendorName.toLowerCase().includes(q) ||
      app.key.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q)
    );
  });

  return (
    <div id="app_licensing_view" className="space-y-6">
      {/* Header */}
      <div id="app_header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#D1D1CF] pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider">App Licensing</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">SOFTWARE INTEGRATIONS, PLUGIN API KEYS & CAPABILITIES</p>
        </div>
        <button
          id="btn_activate_app_page"
          onClick={onActivateAppClick}
          className="flex items-center justify-center space-x-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white text-xs font-mono py-2 px-4 uppercase tracking-wider font-semibold transition-colors rounded-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision App Integration</span>
        </button>
      </div>

      {/* Intro box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D1D1CF] p-4 font-mono text-xs col-span-2">
          <div className="font-bold text-[#1A1A1A] uppercase mb-1">INTEGRATOR ENGINE KEYRING</div>
          <div className="text-gray-500 leading-relaxed">
            Plugins and applications connected to the <strong>seiGEN App Store</strong> utilize these tokens for secure communications. Inter-service permissions are verified against these license rows at each network cycle.
          </div>
        </div>
        <div className="bg-[#1A1A1A] text-white border border-[#2A2A2A] p-4 font-mono text-xs flex flex-col justify-between">
          <div className="flex items-center space-x-1.5 text-[#FF5A00] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTEGRATION SANDBOX</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            All integrations default to sandbox rate-limiting (max 10 API requests/sec) until custom SLA plan clearance is granted.
          </p>
        </div>
      </div>

      {/* Grid of App Licenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-gray-400 uppercase bg-white border border-[#D1D1CF] font-mono text-xs">
            NO APP LICENSE DIRECTIVES TO DISPLAY
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-[#D1D1CF] p-5 space-y-4 relative rounded-none flex flex-col justify-between hover:border-[#1A1A1A] transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                    {app.id}
                  </span>
                  <span className={`px-2 py-0.5 font-bold text-[9px] uppercase inline-flex items-center ${
                    app.status === 'Active' ? 'bg-green-100 text-green-800' :
                    app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-1 h-1 mr-1.5 rounded-none ${
                      app.status === 'Active' ? 'bg-green-500' :
                      app.status === 'Pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    {app.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-sans text-[#1A1A1A] uppercase tracking-wide">
                    {app.appName}
                  </h3>
                  <p className="text-xs text-gray-500 font-sans">
                    Merchant Link: <strong className="text-[#1A1A1A]">{app.vendorName}</strong>
                  </p>
                </div>

                <div className="pt-2 font-mono text-xs">
                  <div className="text-gray-400 text-[10px] uppercase mb-0.5">CRYPTOGRAPHIC INTEGRATION TOKEN</div>
                  <div className="bg-[#F4F4F1] border border-dashed border-[#D1D1CF] p-2 break-all text-[11px] font-semibold text-gray-700">
                    {app.key}
                  </div>
                </div>
              </div>

              {/* Toggle controls */}
              <div className="pt-4 border-t border-[#D1D1CF] flex justify-between items-center text-xs font-mono">
                <span className="text-gray-400 text-[9px]">RESTRICTED MODULE</span>
                <button
                  onClick={() => onToggleAppStatus(app.id)}
                  className={`text-[10px] uppercase font-bold py-1 px-3 border transition-colors cursor-pointer rounded-none ${
                    app.status === 'Active'
                      ? 'border-red-600 text-red-600 hover:bg-red-50'
                      : 'border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {app.status === 'Active' ? 'De-Authorize API' : 'Authorize API'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
