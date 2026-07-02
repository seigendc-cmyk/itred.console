import React from 'react';
import { ActivationRequest } from '../types';
import { Key, Check, X, ShieldAlert, Clock } from 'lucide-react';

interface ActivationRequestsViewProps {
  requests: ActivationRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

export default function ActivationRequestsView({
  requests,
  onApproveRequest,
  onRejectRequest
}: ActivationRequestsViewProps) {
  
  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <div id="activation_requests_view" className="space-y-6">
      {/* Header */}
      <div id="activations_header" className="border-b border-[#D1D1CF] pb-4">
        <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider">Activation Requests</h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">INCOMING REGISTRATION PROFILES & UPLINK SIGNALS</p>
      </div>

      {/* Overview Stat Line */}
      <div className="flex items-center justify-between bg-white border border-[#D1D1CF] p-4 font-mono text-xs shadow-sm">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#FF5A00]" />
          <span className="font-bold text-[#1A1A1A]">PENDING REGISTRATION STACK:</span>
          <span className="bg-[#FF5A00] text-white px-1.5 py-0.5 font-bold">{pendingCount} REQUESTS</span>
        </div>
        <span className="text-gray-400 text-[10px]">DAEMON STATUS: POLLING</span>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-[#D1D1CF]">
        <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] text-xs font-mono text-gray-500 uppercase font-bold">
          Ecosystem Signal Buffer Queue
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#EAEAE8] border-b border-[#D1D1CF] text-gray-600 uppercase tracking-wider">
                <th className="p-3">REQUEST ID</th>
                <th className="p-3">APPLICANT VENDOR</th>
                <th className="p-3">REQUESTED RESOURCE</th>
                <th className="p-3">REQUEST CLASSIFICATION</th>
                <th className="p-3">SUBMIT DATE</th>
                <th className="p-3">OPERATION STATUS</th>
                <th className="p-3 text-right">EVALUATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1D1CF]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 uppercase">
                    NO ACTIVE SIGNALS REGISTERED IN QUEUE
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F4F4F1] transition-colors">
                    <td className="p-3 align-middle font-bold text-[#1A1A1A]">
                      {req.id}
                    </td>
                    <td className="p-3 align-middle font-sans font-semibold text-sm text-[#1A1A1A]">
                      {req.vendorName}
                    </td>
                    <td className="p-3 align-middle text-gray-700 max-w-xs truncate" title={req.requestedItem}>
                      {req.requestedItem}
                    </td>
                    <td className="p-3 align-middle">
                      <span className="bg-[#EAEAE8] text-gray-700 px-1.5 py-0.5 text-[10px] uppercase font-bold border border-gray-200">
                        {req.type}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-gray-500">
                      {req.date}
                    </td>
                    <td className="p-3 align-middle">
                      <span className={`px-2 py-0.5 font-bold text-[10px] uppercase inline-flex items-center ${
                        req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-none ${
                          req.status === 'Approved' ? 'bg-green-500' :
                          req.status === 'Pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex justify-end space-x-1">
                          <button
                            title="Approve / Issue Resource"
                            onClick={() => onApproveRequest(req.id)}
                            className="p-1 border border-green-600 bg-white hover:bg-green-600 text-green-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Check className="w-4.5 h-4.5" />
                          </button>
                          <button
                            title="Reject Request"
                            onClick={() => onRejectRequest(req.id)}
                            className="p-1 border border-red-600 bg-white hover:bg-red-600 text-red-600 hover:text-white transition-all cursor-pointer"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          EVALUATED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
