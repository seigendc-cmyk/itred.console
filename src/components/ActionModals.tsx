import React, { useState } from 'react';
import { Vendor, Plan, POSLicense, ActivationRequest, AppLicense } from '../types';
import { X, ShieldAlert, Plus, Check, Terminal, Users, Layers, Key, CheckSquare } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
}

/* ==========================================================================
   1. CREATE VENDOR MODAL
   ========================================================================== */
interface CreateVendorModalProps extends ModalProps {
  onSubmit: (vendor: Omit<Vendor, 'id' | 'code' | 'joinedDate'>) => void;
}

export function CreateVendorModal({ onClose, onSubmit }: CreateVendorModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grocery & Hypermarket');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Frankfurt, DE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onSubmit({ name, category, email, location, status: 'Pending Verification' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 font-mono text-xs">
      <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-md p-6 relative rounded-none shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black hover:border border-black p-0.5">
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-2">
            <Users className="w-5 h-5 text-[#FF5A00]" />
            <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">REGISTER NEW MERCHANT VENDOR</h2>
          </div>

          <div className="bg-orange-50 border border-orange-200 text-[#1A1A1A] p-3 text-[11px] leading-relaxed">
            Registered vendors default to <strong>'Pending Verification'</strong>. Submit credentials to trigger the security review stack.
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-gray-500 uppercase text-[10px] block">Merchant Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Atlas Commodities"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 uppercase text-[10px] block">Sector Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none uppercase font-semibold"
              >
                <option value="Grocery & Hypermarket">Grocery & Hypermarket</option>
                <option value="General Goods">General Goods</option>
                <option value="Convenience Stores">Convenience Stores</option>
                <option value="Building Materials">Building Materials</option>
                <option value="Apparel & Footwear">Apparel & Footwear</option>
                <option value="Fuel & Convenience">Fuel & Convenience</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 uppercase text-[10px] block">Contact Email</label>
              <input
                type="email"
                required
                placeholder="ops@atlas-commodities.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none lowercase font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 uppercase text-[10px] block">Corporate Uplink Region</label>
              <input
                type="text"
                required
                placeholder="e.g. Frankfurt, DE"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold"
              />
            </div>
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-2 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-colors rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-2 uppercase font-bold text-center tracking-wide transition-colors rounded-none cursor-pointer"
            >
              PROVISION MODULE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ==========================================================================
   2. APPROVE VENDOR MODAL
   ========================================================================== */
interface ApproveVendorModalProps extends ModalProps {
  pendingVendors: Vendor[];
  onApprove: (vendorId: string) => void;
}

export function ApproveVendorModal({ onClose, pendingVendors, onApprove }: ApproveVendorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 font-mono text-xs">
      <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-lg p-6 relative rounded-none shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black hover:border border-black p-0.5">
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-2">
            <CheckSquare className="w-5 h-5 text-[#FF5A00]" />
            <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">PENDING VERIFICATIONS OVERRIDE</h2>
          </div>

          <div className="bg-orange-50 border border-orange-200 text-[#1A1A1A] p-3 text-[11px] leading-relaxed">
            Verify merchant compliance profiles to authorize terminal and app licensing integrations.
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {pendingVendors.length === 0 ? (
              <div className="p-8 text-center text-gray-400 uppercase font-bold">
                NO VENDORS AWAITING SECURE AUDIT IN BUFFER
              </div>
            ) : (
              pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-3 border border-[#D1D1CF] bg-[#F4F4F1] hover:bg-[#EAEAE8] flex justify-between items-center transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#1A1A1A] text-xs font-sans uppercase">
                      {vendor.name} ({vendor.id})
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Region: {vendor.location} • {vendor.category}
                    </div>
                  </div>
                  <button
                    onClick={() => onApprove(vendor.id)}
                    className="flex items-center space-x-1.5 bg-green-700 hover:bg-green-800 text-white font-bold py-1 px-3 uppercase tracking-wider rounded-none cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>VERIFY</span>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full bg-white border border-[#D1D1CF] text-gray-700 py-2 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-colors rounded-none cursor-pointer"
            >
              CLOSE AUDIT INTERFACE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   3. CREATE PLAN MODAL
   ========================================================================== */
interface CreatePlanModalProps extends ModalProps {
  onSubmit: (plan: Omit<Plan, 'id' | 'activeVendors'>) => void;
}

export function CreatePlanModal({ onClose, onSubmit }: CreatePlanModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'POS' | 'App' | 'Hybrid'>('Hybrid');
  const [price, setPrice] = useState(499);
  const [interval, setInterval] = useState<'Monthly' | 'Annual'>('Monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price < 0) return;
    onSubmit({ name, type, price, interval });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 font-mono text-xs">
      <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-md p-6 relative rounded-none shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black hover:border border-black p-0.5">
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-2">
            <Layers className="w-5 h-5 text-[#FF5A00]" />
            <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">PROVISION BILLING SLAB PLAN</h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-gray-500 uppercase text-[10px] block">Plan Name</label>
              <input
                type="text"
                required
                placeholder="e.g. regional terminal basic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase text-[10px] block">Integration Class</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none uppercase font-semibold"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="POS">POS Only</option>
                  <option value="App">App Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase text-[10px] block">Price (USD)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 uppercase text-[10px] block">Settlement Period</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as any)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none uppercase font-semibold"
              >
                <option value="Monthly">Monthly Recurring</option>
                <option value="Annual">Annual Fixed Ledger</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-2 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-colors rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-2 uppercase font-bold text-center tracking-wide transition-colors rounded-none cursor-pointer"
            >
              PROVISION SLAB
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ==========================================================================
   4. ISSUE POS LICENSE MODAL
   ========================================================================== */
interface IssuePOSLicenseModalProps extends ModalProps {
  activeVendors: Vendor[];
  onSubmit: (vendorName: string, terminalId: string, licenseKey: string) => void;
}

export function IssuePOSLicenseModal({ onClose, activeVendors, onSubmit }: IssuePOSLicenseModalProps) {
  const [vendorName, setVendorName] = useState(activeVendors[0]?.name || '');
  const [terminalId, setTerminalId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !terminalId) return;

    // Generate simulated license key
    const letters = 'ABCDEF0123456789';
    const randPart = () => Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * 16)]).join('');
    const simulatedKey = `ITRD-POS-${randPart()}-${randPart()}-${randPart()}`;

    onSubmit(vendorName, terminalId.toUpperCase(), simulatedKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 font-mono text-xs">
      <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-md p-6 relative rounded-none shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black hover:border border-black p-0.5">
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-2">
            <Terminal className="w-5 h-5 text-[#FF5A00]" />
            <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">ISSUE PHYSICAL POS KEY</h2>
          </div>

          {activeVendors.length === 0 ? (
            <div className="space-y-4 text-center py-4">
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 uppercase font-bold text-[10px]">
                CRITICAL BLOCKED: NO COMPLIANT ACTIVE VENDORS DETECTED
              </div>
              <p className="text-gray-500 text-[11px] font-sans">
                Please verify a pending vendor record first before attempting Point-Of-Sale licensing allocation.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#1A1A1A] text-white py-2 uppercase font-bold rounded-none cursor-pointer"
              >
                CLOSE KEYRING MODULE
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[10px] block">Target Vendor Merchant</label>
                  <select
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none uppercase font-semibold"
                  >
                    {activeVendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.name}>
                        {vendor.name} ({vendor.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase text-[10px] block">Physical Terminal Node Id</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRM-TYO-991"
                    value={terminalId}
                    onChange={(e) => setTerminalId(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase"
                  />
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-2 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-colors rounded-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-2 uppercase font-bold text-center tracking-wide transition-colors rounded-none cursor-pointer"
                >
                  ISSUE COMPLIANCE KEY
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}


/* ==========================================================================
   5. ACTIVATE APP MODAL
   ========================================================================== */
interface ActivateAppModalProps extends ModalProps {
  activeVendors: Vendor[];
  onSubmit: (vendorName: string, appName: string, key: string) => void;
  pendingRequests: ActivationRequest[];
  onDirectApproveRequest?: (requestId: string) => void;
}

export function ActivateAppModal({
  onClose,
  activeVendors,
  onSubmit,
  pendingRequests,
  onDirectApproveRequest
}: ActivateAppModalProps) {
  const [vendorName, setVendorName] = useState(activeVendors[0]?.name || '');
  const [appName, setAppName] = useState('');

  const appTemplates = [
    'Multi-Channel StockSync',
    'iTred Automated Ledger Pro',
    'GeoFence Logistics Beacon',
    'Vance Cryptographic Gateway',
    'seiGEN Commerce Smart Analytics'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !appName) return;

    // Generate secure app token key
    const letters = 'ABCDEF0123456789';
    const randPart = () => Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * 16)]).join('');
    const simulatedKey = `SGN-APP-${randPart()}-${randPart()}`;

    onSubmit(vendorName, appName, simulatedKey);
    onClose();
  };

  const appVerificationRequests = pendingRequests.filter(r => r.type === 'App Integration' && r.status === 'Pending');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 font-mono text-xs">
      <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-md p-6 relative rounded-none shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black hover:border border-black p-0.5">
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-2">
            <Key className="w-5 h-5 text-[#FF5A00]" />
            <h2 className="text-sm font-bold uppercase text-[#1A1A1A]">PROVISION PLUGIN INTERFACES</h2>
          </div>

          {/* Quick approve pending app request */}
          {appVerificationRequests.length > 0 && onDirectApproveRequest && (
            <div className="space-y-2 border border-[#D1D1CF] p-3 bg-orange-50">
              <div className="font-bold text-[#FF5A00] text-[10px] uppercase">PENDING MERCHANT APP SIGNALS</div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {appVerificationRequests.map(req => (
                  <div key={req.id} className="flex justify-between items-center text-[11px] bg-white border border-gray-200 p-1.5">
                    <span className="truncate max-w-[180px] font-semibold">{req.vendorName} → {req.requestedItem.split(' ')[0]}</span>
                    <button
                      onClick={() => {
                        onDirectApproveRequest(req.id);
                        onClose();
                      }}
                      className="bg-green-700 hover:bg-green-800 text-white font-bold px-2 py-0.5 text-[9px] uppercase rounded-none cursor-pointer"
                    >
                      APPROVE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="font-bold uppercase text-[10px] text-gray-500 border-t border-[#D1D1CF] pt-2">MANUAL API REGISTRATION</div>

            {activeVendors.length === 0 ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 uppercase font-bold text-[10px]">
                BLOCKED: NO ACTIVE MERCHANTS DEFINED
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[10px] block">Merchant Link</label>
                    <select
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none uppercase font-semibold"
                    >
                      {activeVendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.name}>
                          {vendor.name} ({vendor.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase text-[10px] block">Application Core Package</label>
                    <input
                      type="text"
                      list="app-templates"
                      required
                      placeholder="e.g. StockSync Client"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase"
                    />
                    <datalist id="app-templates">
                      {appTemplates.map(t => <option key={t} value={t} />)}
                    </datalist>
                  </div>
                </div>

                <div className="pt-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-2 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-colors rounded-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-2 uppercase font-bold text-center tracking-wide transition-colors rounded-none cursor-pointer"
                  >
                    ISSUE GATEWAY TOKEN
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
