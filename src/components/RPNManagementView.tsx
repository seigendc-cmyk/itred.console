import React, { useState } from 'react';
import { RPNAgent, Vendor } from '../types';
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Radio, 
  Printer, 
  FileText, 
  Check, 
  ExternalLink, 
  X, 
  Layers, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface RPNManagementViewProps {
  rpnAgents: RPNAgent[];
  onPingNode: (nodeId: string) => void;
  vendors?: Vendor[];
}

export default function RPNManagementView({ rpnAgents, onPingNode, vendors = [] }: RPNManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'nodes' | 'attachments'>('nodes');
  const [selectedRpnId, setSelectedRpnId] = useState<string>(rpnAgents[0]?.id || '');
  const [showPrintPreview, setShowPrintPreview] = useState<string | null>(null);

  const selectedAgent = rpnAgents.find(agent => agent.id === selectedRpnId);
  
  // Dynamic calculation of attached vendors
  const getAttachedVendorsForRpn = (rpnId: string, agent: RPNAgent | undefined) => {
    return vendors.filter(v => 
      v.linkedRpnId === rpnId || 
      (agent?.linkedVendorIds || []).includes(v.id)
    );
  };

  const attachedVendors = getAttachedVendorsForRpn(selectedRpnId, selectedAgent);

  const handlePrintTrigger = () => {
    window.print();
  };

  // Helper date
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div id="rpn_view" className="space-y-6 font-mono relative">
      {/* CSS Media Print Overrides */}
      <style>{`
        @media print {
          /* Hide everything except our print target */
          body * {
            visibility: hidden !important;
          }
          #print-target-section, #print-target-section * {
            visibility: visible !important;
          }
          #print-target-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div id="rpn_header" className="border-b border-[#D1D1CF] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider">RPN Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">RELAY PROCESSING NODE ROUTING SYSTEM & ENCRYPTED TRANSITS</p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-[#EAEAE8] border border-[#D1D1CF] px-3 py-1.5 text-[#1A1A1A]">
          <Radio className="w-4 h-4 text-[#FF5A00] animate-pulse" />
          <span>GLOBAL BROADCAST: STABLE UPLINKS</span>
        </div>
      </div>

      {/* Node status summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#D1D1CF] p-4 space-y-1 shadow-sm">
          <div className="text-[10px] text-gray-400 uppercase">ACTIVE TUNNEL SESSIONS</div>
          <div className="text-xl font-bold text-[#1A1A1A]">
            {rpnAgents.reduce((acc, curr) => acc + curr.activeSessions, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-green-600 font-semibold">ENCRYPTED AT ENDPOINTS</div>
        </div>
        <div className="bg-white border border-[#D1D1CF] p-4 space-y-1 shadow-sm">
          <div className="text-[10px] text-gray-400 uppercase">ONLINE NETWORK CAP</div>
          <div className="text-xl font-bold text-[#1A1A1A]">1,383.0 Tx/s</div>
          <div className="text-[10px] text-gray-500">AGGREGATE BANDWIDTH POOL</div>
        </div>
        <div className="bg-white border border-[#D1D1CF] p-4 space-y-1 shadow-sm">
          <div className="text-[10px] text-gray-400 uppercase">SYSTEM BACKUP ROUTE</div>
          <div className="text-xl font-bold text-[#FF5A00]">STANDBY SECURE</div>
          <div className="text-[10px] text-gray-500">VIRGINIA-DELTA STANDBY CO-LOC</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#D1D1CF] bg-[#EAEAE8] p-1 gap-1">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase transition-all tracking-wider text-center cursor-pointer ${
            activeTab === 'nodes'
              ? 'bg-white text-[#1A1A1A] border-b-2 border-b-[#FF5A00] shadow-sm'
              : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4F4F1]'
          }`}
        >
          Active Edge Routing Nodes ({rpnAgents.length})
        </button>
        <button
          onClick={() => setActiveTab('attachments')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase transition-all tracking-wider text-center cursor-pointer ${
            activeTab === 'attachments'
              ? 'bg-white text-[#1A1A1A] border-b-2 border-b-[#FF5A00] shadow-sm'
              : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4F4F1]'
          }`}
        >
          RPN Vendor Attachments & Print Compliance
        </button>
      </div>

      {/* Tab 1: Nodes List */}
      {activeTab === 'nodes' && (
        <div className="bg-white border border-[#D1D1CF]">
          <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] text-xs text-gray-500 flex justify-between items-center uppercase font-bold">
            <span>Active Edge Routing Nodes ({rpnAgents.length})</span>
            <span>LATENCY REFRESH RATE: 3000MS</span>
          </div>

          <div className="divide-y divide-[#D1D1CF]">
            {rpnAgents.map((agent) => {
              const count = getAttachedVendorsForRpn(agent.id, agent).length;
              return (
                <div
                  key={agent.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-[#F4F4F1] transition-colors gap-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2.5 border ${
                      agent.connectionStatus === 'Connected' ? 'bg-green-50 border-green-200 text-green-700' :
                      agent.connectionStatus === 'Standby' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#1A1A1A] text-sm font-sans uppercase">
                          {agent.name}
                        </span>
                        <span className="text-[10px] bg-gray-200 text-gray-700 px-1 text-xs font-semibold uppercase">
                          {agent.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
                        {agent.region} • CURRENT ACTIVE THROUGHPUT: <strong className="text-gray-700 font-bold">{agent.throughput}</strong>
                      </div>
                      <div className="mt-1.5">
                        <button
                          onClick={() => {
                            setSelectedRpnId(agent.id);
                            setActiveTab('attachments');
                          }}
                          className="text-[10px] text-[#FF5A00] hover:text-[#1A1A1A] font-bold uppercase tracking-wider flex items-center space-x-1 border border-transparent hover:border-[#FF5A00] hover:bg-orange-50 px-1.5 py-0.5 cursor-pointer"
                        >
                          <span>Linked Businesses: {count}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center space-x-4 sm:justify-end shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#1A1A1A]">
                        {agent.activeSessions} SESSIONS
                      </div>
                      <div className="text-[9px] text-gray-400">ACTIVE INGRESS TUNNELS</div>
                    </div>

                    <span className={`px-2 py-1 font-bold text-[10px] uppercase inline-flex items-center border ${
                      agent.connectionStatus === 'Connected' ? 'bg-green-100 text-green-800 border-green-200' :
                      agent.connectionStatus === 'Standby' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 mr-1.5 rounded-none ${
                        agent.connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' :
                        agent.connectionStatus === 'Standby' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      {agent.connectionStatus}
                    </span>

                    <button
                      title="Ping Connection Uplink"
                      onClick={() => onPingNode(agent.id)}
                      className="p-1.5 border border-[#D1D1CF] hover:border-[#FF5A00] hover:bg-orange-50 text-[#1A1A1A] hover:text-[#FF5A00] transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Vendor Attachments & print */}
      {activeTab === 'attachments' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold block">SELECT ROUTING NODE TO INSPECT</label>
              <select
                value={selectedRpnId}
                onChange={(e) => setSelectedRpnId(e.target.value)}
                className="bg-white border-2 border-[#1A1A1A] p-2 text-xs font-bold focus:outline-none uppercase w-full md:w-80"
              >
                {rpnAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.id} — {agent.name} ({agent.region})
                  </option>
                ))}
              </select>
            </div>

            {selectedAgent && (
              <div className="flex items-center space-x-3 bg-[#F4F4F1] border border-[#D1D1CF] px-4 py-2 text-xs">
                <div>
                  <div className="font-bold text-[#1A1A1A] uppercase">{selectedAgent.name} Status</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">REGION: {selectedAgent.region} • LATENCY: NOMINAL</div>
                </div>
                <span className={`px-1.5 py-0.5 font-bold text-[9px] uppercase border inline-flex items-center ${
                  selectedAgent.connectionStatus === 'Connected' ? 'bg-green-50 border-green-200 text-green-700' :
                  selectedAgent.connectionStatus === 'Standby' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                  'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {selectedAgent.connectionStatus}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#D1D1CF]">
            {/* Table Header and Print Button */}
            <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Attached Enterprise Vendors ({attachedVendors.length})
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">VENDORS HARNESSING ENCRYPTED ROUTING ON THIS GATEWAY</p>
              </div>

              <button
                disabled={attachedVendors.length === 0}
                onClick={() => setShowPrintPreview(selectedRpnId)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                  attachedVendors.length === 0
                    ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-[#1A1A1A] bg-[#1A1A1A] hover:bg-[#FF5A00] hover:border-[#FF5A00] text-white shadow-md active:translate-y-0.5'
                }`}
              >
                <Printer className="w-4 h-4" />
                Print RPN Vendor List
              </button>
            </div>

            {/* Vendor List Table */}
            {attachedVendors.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic text-xs space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-gray-300" />
                <p>No active vendors attached to this relay processing node.</p>
                <p className="text-[10px] uppercase tracking-normal font-sans not-italic">
                  Link a new business to this RPN in the Enterprise Register Form.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D1D1CF] bg-gray-50 text-gray-500 uppercase text-[9px] font-bold tracking-wider">
                      <th className="p-3">VENDOR ID</th>
                      <th className="p-3">CODE</th>
                      <th className="p-3">COMPANY NAME</th>
                      <th className="p-3">BUSINESS CATEGORY</th>
                      <th className="p-3">LOCATION / HUB</th>
                      <th className="p-3 text-right">OPERATIONS STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1D1CF]">
                    {attachedVendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3">
                          <span className="bg-gray-100 font-bold px-1.5 py-0.5 text-gray-700 text-[10px]">
                            {vendor.id}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 font-bold">{vendor.code}</td>
                        <td className="p-3 font-bold text-[#1A1A1A] font-sans">{vendor.name}</td>
                        <td className="p-3 uppercase text-gray-500 text-[10px] font-bold">{vendor.category}</td>
                        <td className="p-3 text-gray-600">{vendor.location}</td>
                        <td className="p-3 text-right">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase inline-flex items-center border ${
                            vendor.status === 'Active' || vendor.status === 'Ready' || vendor.status === 'Approved'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : vendor.status === 'Suspended' || vendor.status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {vendor.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Report Preview / Custom Full-screen Overlay Modal */}
      {showPrintPreview && selectedAgent && (
        <div className="fixed inset-0 bg-[#1A1A1A]/95 z-50 flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-8 font-mono">
          
          {/* Printable Control bar */}
          <div className="w-full max-w-4xl bg-[#2D2D2D] border-b border-gray-700 p-4 flex items-center justify-between shadow-2xl shrink-0 text-white select-none">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#FF5A00]" />
              <span className="font-bold text-xs uppercase tracking-widest">UPLINK SECURE PRINT SERVICE</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrintTrigger}
                className="bg-[#FF5A00] hover:bg-white hover:text-[#1A1A1A] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Trigger Print
              </button>
              <button
                onClick={() => setShowPrintPreview(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 text-xs font-bold uppercase cursor-pointer"
                title="Exit Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Paper Document Container (ID target-section for standard window.print()) */}
          <div 
            id="print-target-section"
            className="w-full max-w-4xl bg-white text-black p-8 sm:p-12 shadow-2xl border border-gray-300 relative text-left my-4 print:my-0 print:p-0 print:shadow-none print:border-none"
          >
            {/* Dotted border indicators (cutting line guides for physically simulated ledger layout) */}
            <div className="border-b-4 border-double border-black pb-4 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold font-sans tracking-tight uppercase text-black">seiGEN GLOBAL GATEWAY COMPLIANCE</h1>
                <p className="text-[10px] text-gray-500 uppercase mt-1">CO-LOCATION NETWORK INTERFACE SYSTEM MANIFEST</p>
                <p className="text-[10px] text-gray-500 uppercase">DOCUMENT ID: sGN-RPN-COMP-{selectedAgent.id}-{Date.now().toString().slice(-6)}</p>
              </div>
              <div className="text-right">
                <span className="inline-block border border-black px-2 py-1 text-[10px] font-bold uppercase">
                  LEVEL 4 AUTH SECRET
                </span>
                <p className="text-[9px] text-gray-400 mt-1">GENERATED: {currentDateStr}</p>
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="mb-6 flex justify-between items-center bg-gray-50 p-3 border border-gray-200">
              <div className="text-xs">
                <div className="font-bold uppercase text-black">UPLINK BINDING SPECIFICATIONS</div>
                <div className="text-[10px] text-gray-500 mt-1">RPN AGENT: {selectedAgent.name}</div>
                <div className="text-[10px] text-gray-500">REGION BIND: {selectedAgent.region}</div>
                <div className="text-[10px] text-gray-500">THROUGHPUT RATIO: {selectedAgent.throughput}</div>
              </div>
              <div className="text-right">
                {/* Visual monospace hash line resembling barcode block */}
                <div className="text-[14px] leading-none font-bold select-none text-black">
                  ||||| | ||||| || | |||| ||||| || |||
                </div>
                <span className="text-[8px] text-gray-400 uppercase tracking-widest">{selectedAgent.id}-TX-UPLINK</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="mb-6 border-b border-black pb-2">
              <h2 className="text-sm font-bold uppercase text-black tracking-widest flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#FF5A00] print:text-black shrink-0" />
                Attached Merchant Network Ledger ({attachedVendors.length} Nodes)
              </h2>
            </div>

            {/* Printable Table */}
            {attachedVendors.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 italic text-xs">
                No active merchant vendor nodes attached to this routing network.
              </div>
            ) : (
              <table className="w-full text-left text-[11px] border-collapse mb-8">
                <thead>
                  <tr className="border-b-2 border-black text-black uppercase font-bold">
                    <th className="py-2 pr-2">NODE ID</th>
                    <th className="py-2 pr-2">CODE</th>
                    <th className="py-2 pr-2">COMPANY REGISTERED NAME</th>
                    <th className="py-2 pr-2">BUSINESS BIND</th>
                    <th className="py-2 pr-2">OPERATIONS CENTER</th>
                    <th className="py-2 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attachedVendors.map((vendor) => (
                    <tr key={vendor.id} className="text-black">
                      <td className="py-2 pr-2 font-bold">{vendor.id}</td>
                      <td className="py-2 pr-2 text-gray-700">{vendor.code}</td>
                      <td className="py-2 pr-2 font-sans font-bold">{vendor.name}</td>
                      <td className="py-2 pr-2 uppercase text-gray-600 text-[10px]">{vendor.category}</td>
                      <td className="py-2 pr-2 text-gray-700">{vendor.location}</td>
                      <td className="py-2 text-right font-bold uppercase text-black">{vendor.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Sign-offs and footer */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-black mt-8 text-[10px]">
              <div className="space-y-1.5">
                <div className="font-bold uppercase text-black">SYSTEM METRICS VERIFICATION</div>
                <p className="text-gray-500 leading-relaxed">
                  The routing gateway has checked diagnostic latency on all {attachedVendors.length} registered endpoints.
                  All tunnels use Class 3 TLS co-location protocol matching standards of the Central Clearing Authority.
                </p>
                <p className="text-gray-400 font-sans text-[8px] uppercase mt-2">
                  seiGen Core Engine build v4.14-stable-build.209. Security logs archived under legal audit.
                </p>
              </div>
              <div className="flex flex-col justify-end items-end space-y-4">
                <div className="w-full max-w-xs border-b border-black text-right pt-6 text-gray-400 italic font-serif">
                  {/* Space for physical signature */}
                </div>
                <div className="text-right">
                  <div className="font-bold uppercase text-black">AUTHORIZED OPERATING OFFICER</div>
                  <div className="text-[9px] text-gray-500 uppercase">cryptographic verification protocol</div>
                </div>
              </div>
            </div>

            {/* Watermark/receipt stamp simulation */}
            <div className="absolute right-8 top-1/2 opacity-5 border-4 border-black p-4 rounded-full text-center rotate-12 pointer-events-none select-none uppercase font-sans">
              <div className="font-black text-xl">seiGEN CENTRAL</div>
              <div className="text-[9px] font-bold tracking-widest mt-0.5">VERIFIED ROUTING</div>
            </div>

          </div>

          {/* Help instruction overlay */}
          <div className="w-full max-w-4xl bg-gray-800 border border-gray-700 p-3 mt-4 text-center text-xs text-gray-300">
            <span className="font-bold text-[#FF5A00]">PRO-TIP:</span> The print preview uses dedicated print CSS media targets. Only the clean document page in white background will print on paper.
          </div>

        </div>
      )}

    </div>
  );
}
