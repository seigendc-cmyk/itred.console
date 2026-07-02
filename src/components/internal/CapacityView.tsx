import React from 'react';
import { Cpu, Layers, HardDrive, BarChart3, Database } from 'lucide-react';
import { Plan, POSLicense, RPNAgent } from '../types';

interface CapacityViewProps {
  plans: Plan[];
  posLicenses: POSLicense[];
  rpnAgents: RPNAgent[];
}

export default function CapacityView({ plans, posLicenses, rpnAgents }: CapacityViewProps) {
  const activeLicenses = posLicenses.filter(l => l.status === 'Active');
  const demoLicenses = posLicenses.filter(l => l.licenseMode === 'demo');
  const cloudLicenses = posLicenses.filter(l => l.storageMode === 'cloud');

  const totalRPNThroughput = rpnAgents
    .filter(a => a.connectionStatus === 'Connected' && a.throughput !== 'N/A')
    .reduce((acc, curr) => acc + parseFloat(curr.throughput) || 0, 0);

  return (
    <div className="space-y-6">
      
      {/* Visual Header */}
      <div className="bg-white border-4 border-[#1A1A1A] p-6 shadow-md relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
        <div className="space-y-1 font-sans">
          <div className="flex items-center space-x-2 text-[#FF5A00] text-[10px] font-mono font-bold uppercase tracking-widest">
            <Cpu className="w-4 h-4" />
            <span>Capacity & Threshold Resource Analytics</span>
          </div>
          <h1 className="text-xl font-bold uppercase text-[#1A1A1A] tracking-tight">
            System Resource & Limits Monitor
          </h1>
          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
            Real-time visual ledger detailing capacity usage, transactional nodes allocation, active licenses distribution, and plan slab constraints.
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs text-[#1A1A1A]">
        
        {/* Card 1: POS Licenses */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
          <div className="flex justify-between items-center text-gray-400">
            <span>ACTIVE LICENSES</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-sans font-black text-[#1A1A1A]">
              {activeLicenses.length}
            </div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">
              Out of {posLicenses.length} Total Issued
            </div>
          </div>
          <div className="pt-2 border-t border-gray-150 text-[9px] uppercase text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Cloud Storage:</span>
              <strong className="text-gray-800 font-bold">{cloudLicenses.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Local Only:</span>
              <strong className="text-gray-800 font-bold">{demoLicenses.length}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: RPN Edge Tunnels */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
          <div className="flex justify-between items-center text-gray-400">
            <span>RPN CONFIGURED UPLINKS</span>
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-sans font-black text-[#FF5A00]">
              {rpnAgents.length}
            </div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">
              Active Routing Gateways
            </div>
          </div>
          <div className="pt-2 border-t border-gray-150 text-[9px] uppercase text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Affiliate Agents:</span>
              <strong className="text-gray-800 font-bold">
                {rpnAgents.filter(a => a.agentType === 'acquisition_agent').length}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Data Relay Nodes:</span>
              <strong className="text-gray-800 font-bold">
                {rpnAgents.filter(a => a.agentType !== 'acquisition_agent').length}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Aggregate Throughput */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
          <div className="flex justify-between items-center text-gray-400">
            <span>NETWORK BANDWIDTH</span>
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-sans font-black text-[#1A1A1A]">
              {totalRPNThroughput.toFixed(1)} <span className="text-xs">Tx/s</span>
            </div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">
              Active telemetry bandwidth
            </div>
          </div>
          <div className="pt-2 border-t border-gray-150 text-[9px] uppercase text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Telemetry state:</span>
              <strong className="text-green-600 font-bold">Stable Uplink</strong>
            </div>
            <div className="flex justify-between">
              <span>Network Refresh:</span>
              <strong className="text-gray-850 font-bold">3000 ms</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Slabs Allocation */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
          <div className="flex justify-between items-center text-gray-400">
            <span>PLAN SLABS</span>
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-sans font-black text-[#1A1A1A]">
              {plans.length}
            </div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">
              Defined Capacity Templates
            </div>
          </div>
          <div className="pt-2 border-t border-gray-150 text-[9px] uppercase text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Active Slabs:</span>
              <strong className="text-gray-800 font-bold">
                {plans.filter(p => p.status === 'Active' || (p as any).status !== 'Inactive').length}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Demo / Trial Slabs:</span>
              <strong className="text-gray-800 font-bold">
                {plans.filter(p => p.id === 'VENDOR_DEMO').length}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* Plan capacity slabs parameters */}
      <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
        <div className="p-3 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#1A1A1A] uppercase tracking-wider text-xs font-mono">
          Capacity Tier Limits Schema
        </div>
        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-white uppercase text-[9px]">
                <th className="p-3">Plan Name</th>
                <th className="p-3">Plan Code</th>
                <th className="p-3">Max Branches</th>
                <th className="p-3">Max Terminals</th>
                <th className="p-3">Max Staff</th>
                <th className="p-3">Max Products</th>
                <th className="p-3">Monthly Charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1D1CF]">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-[#F9F9F8]">
                  <td className="p-3 font-sans font-bold text-[#1A1A1A]">{plan.name}</td>
                  <td className="p-3 font-mono font-bold text-[#FF5A00]">{plan.id}</td>
                  <td className="p-3">{plan.maxBranches}</td>
                  <td className="p-3">{plan.maxTerminals}</td>
                  <td className="p-3">{plan.maxStaff}</td>
                  <td className="p-3">{plan.maxProducts}</td>
                  <td className="p-3 font-bold">${plan.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
