import React, { useState } from 'react';
import { useLifecycle } from '../App';
import { 
  Cpu, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  Key, 
  Layers, 
  Users, 
  Play, 
  Square, 
  TrendingUp, 
  Boxes,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Radio,
  FileText
} from 'lucide-react';

interface EcosystemApp {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Degraded' | 'Standby';
  license: string;
  version: string;
  health: number; // percentage
  connectedVendors: number;
  category: string;
}

const INITIAL_APPS: EcosystemApp[] = [
  {
    id: 'app-pos',
    name: 'iTredPOS',
    description: 'Cryptographic point-of-sale gateway with offline-first transaction logging',
    status: 'Active',
    license: 'SGN-LIC-POS-9810-F2A',
    version: 'v4.2.1-STABLE',
    health: 99.9,
    connectedVendors: 14,
    category: 'Sales & Checkout'
  },
  {
    id: 'app-discovery',
    name: 'iTred Vendor Discovery',
    description: 'On-chain directory search and smart-contract-vetted B2B matchmaking',
    status: 'Active',
    license: 'SGN-LIC-DISC-5441-K8D',
    version: 'v2.1.0-RELEASE',
    health: 98.7,
    connectedVendors: 32,
    category: 'Directory & Search'
  },
  {
    id: 'app-ideliver',
    name: 'iDeliver',
    description: 'Dynamic carrier tracking telemetry and geo-fence routing logistics',
    status: 'Active',
    license: 'SGN-LIC-DELV-1102-Y4A',
    version: 'v3.0.5-PATCH3',
    health: 100.0,
    connectedVendors: 8,
    category: 'Logistics'
  },
  {
    id: 'app-poolwise',
    name: 'PoolWise',
    description: 'Consolidated settlement protocol and dynamic cash-pool optimization',
    status: 'Standby',
    license: 'SGN-LIC-POOL-4491-M1N',
    version: 'v1.8.9-STABLE',
    health: 95.4,
    connectedVendors: 6,
    category: 'Settlement Pools'
  },
  {
    id: 'app-cashplan',
    name: 'CashPlan',
    description: 'Automated predictive cash-flow forecasting ledger and liquidity planner',
    status: 'Inactive',
    license: 'SGN-LIC-CASH-7710-Q5C',
    version: 'v1.2.0-BETA',
    health: 0,
    connectedVendors: 0,
    category: 'Financial Planning'
  },
  {
    id: 'app-execdesk',
    name: 'Executive Desk',
    description: 'Real-time corporate performance metrics and multi-tenant analytics hub',
    status: 'Active',
    license: 'SGN-LIC-EXEC-3310-P7E',
    version: 'v2.4.0-RELEASE',
    health: 99.2,
    connectedVendors: 3,
    category: 'Analytics Dashboard'
  }
];

export default function EcosystemDashboardView() {
  const { currentAdmin, addLogAndNotify } = useLifecycle();
  
  // Local simulated state for the ecosystem applications
  const [apps, setApps] = useState<EcosystemApp[]>(() => {
    const saved = localStorage.getItem('sci_ecosystem_apps');
    return saved ? JSON.parse(saved) : INITIAL_APPS;
  });

  const [pingingAppId, setPingingAppId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ id: string; message: string; latency: number } | null>(null);
  const [activeVisualFilter, setActiveVisualFilter] = useState<'ALL' | 'ACTIVE' | 'STANDBY' | 'INACTIVE'>('ALL');

  // Save current app list to local storage
  const saveApps = (newApps: EcosystemApp[]) => {
    setApps(newApps);
    localStorage.setItem('sci_ecosystem_apps', JSON.stringify(newApps));
  };

  // Toggle Activation Button
  const handleToggleActivation = (id: string) => {
    const nextApps = apps.map(app => {
      if (app.id === id) {
        const isCurrentlyActive = app.status === 'Active' || app.status === 'Degraded';
        const nextStatus: EcosystemApp['status'] = isCurrentlyActive ? 'Inactive' : 'Active';
        const nextHealth = isCurrentlyActive ? 0 : 95 + Math.random() * 5;
        const nextVendors = isCurrentlyActive ? 0 : Math.floor(2 + Math.random() * 20);
        
        // Push notification log
        if (addLogAndNotify) {
          addLogAndNotify(
            currentAdmin?.name || 'Lead SysOp',
            isCurrentlyActive ? 'DEACTIVATE_ECOSYSTEM_APP' : 'ACTIVATE_ECOSYSTEM_APP',
            app.name,
            'Success',
            isCurrentlyActive ? 'warning' : 'success',
            `Ecosystem App Modified`,
            `Application "${app.name}" status set to ${nextStatus.toUpperCase()}. Channels updated.`
          );
        }

        return {
          ...app,
          status: nextStatus,
          health: Number(nextHealth.toFixed(1)),
          connectedVendors: nextVendors
        };
      }
      return app;
    });

    saveApps(nextApps);
  };

  // Simulated Diagnostic Ping
  const handlePingApp = (app: EcosystemApp) => {
    if (app.status === 'Inactive') {
      alert(`Cannot ping offline system "${app.name}". Please activate the application first.`);
      return;
    }
    
    setPingingAppId(app.id);
    setPingResult(null);

    setTimeout(() => {
      const latency = Math.floor(10 + Math.random() * 85);
      const randMsgs = [
        'Ecosystem websocket pipe synchronized successfully',
        'Database replica synchronized, index integrity 100%',
        'Network telemetry relay clear, response codes nominal',
        'Gateway cluster balanced, zero packet losses registered'
      ];
      const message = randMsgs[Math.floor(Math.random() * randMsgs.length)];

      setPingResult({
        id: app.id,
        message,
        latency
      });
      setPingingAppId(null);

      if (addLogAndNotify) {
        addLogAndNotify(
          'DAEMON_MONITOR',
          'PING_DIAGNOSTIC_CLEAR',
          `${app.name} (${app.version})`,
          'Success',
          'success',
          'Ecosystem Ping Successful',
          `Heartbeat returned from ${app.name} in ${latency}ms. Diagnostic payload: "${message}".`
        );
      }
    }, 700);
  };

  // Reset local state to default seeds
  const handleResetEcosystem = () => {
    saveApps(INITIAL_APPS);
    setPingResult(null);
    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Lead SysOp',
        'FLUSH_ECOSYSTEM_STATE',
        'SCI Ecosystem Registry',
        'Success',
        'info',
        'Ecosystem Seeding Reset',
        `Ecosystem status blocks successfully restored to default system seed templates.`
      );
    }
  };

  // Calculate high-level system dashboard analytics
  const activeAppsCount = apps.filter(a => a.status === 'Active' || a.status === 'Degraded').length;
  const standbyAppsCount = apps.filter(a => a.status === 'Standby').length;
  const totalVendorsSum = apps.reduce((sum, a) => sum + a.connectedVendors, 0);
  const averageHealth = Number(
    (apps.filter(a => a.status !== 'Inactive').reduce((sum, a) => sum + a.health, 0) / 
    (apps.filter(a => a.status !== 'Inactive').length || 1)).toFixed(1)
  );

  const filteredApps = apps.filter(app => {
    if (activeVisualFilter === 'ALL') return true;
    if (activeVisualFilter === 'ACTIVE') return app.status === 'Active' || app.status === 'Degraded';
    if (activeVisualFilter === 'STANDBY') return app.status === 'Standby';
    if (activeVisualFilter === 'INACTIVE') return app.status === 'Inactive';
    return true;
  });

  return (
    <div id="sci_ecosystem_dashboard_prototype" className="space-y-6">
      
      {/* 1. BRAND HEADER */}
      <div id="ecosystem_dashboard_header" className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b-4 border-[#1A1A1A] pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-[#FF5A00]" />
            <h1 className="text-xl font-black font-sans text-[#1A1A1A] uppercase tracking-wider">SCI Ecosystem Dashboard</h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">seiGEN COMMERCE INTEGRATION PLATFORM APPLICATION REGISTRY</p>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-2">
          <button
            id="reset_ecosystem_seeds_btn"
            onClick={handleResetEcosystem}
            className="px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 rounded-none cursor-pointer border border-[#D1D1CF] bg-white text-gray-600 hover:bg-gray-100 flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default Seeds</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS ROW */}
      <div id="ecosystem_summary_metrics_bar" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        {/* Metric 1 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="text-gray-400 uppercase text-[9px] font-black tracking-widest block">Total App Modules</div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-sans font-black text-[#1A1A1A]">{apps.length}</span>
            <span className="text-[10px] text-gray-500">PROVISIONED</span>
          </div>
          <div className="text-[9px] text-gray-500 uppercase mt-2 pt-2 border-t border-[#EAEAE8] flex justify-between">
            <span>Core Suite</span>
            <span className="font-bold text-[#FF5A00]">100% READY</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="text-gray-400 uppercase text-[9px] font-black tracking-widest block">Active Instances</div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-sans font-black text-emerald-600">{activeAppsCount}</span>
            <span className="text-[10px] text-gray-500">/ {apps.length} ONLINE</span>
          </div>
          <div className="text-[9px] text-gray-500 uppercase mt-2 pt-2 border-t border-[#EAEAE8] flex justify-between">
            <span>Standby Ready</span>
            <span className="font-bold text-amber-600">{standbyAppsCount} IDLE</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="text-gray-400 uppercase text-[9px] font-black tracking-widest block">Average System Health</div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-sans font-black text-[#FF5A00]">{averageHealth}%</span>
            <span className="text-[10px] text-gray-500">NOMINAL</span>
          </div>
          <div className="text-[9px] text-gray-500 uppercase mt-2 pt-2 border-t border-[#EAEAE8] flex justify-between">
            <span>Threshold Range</span>
            <span className="font-bold text-emerald-600">{`> 95.0%`}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="text-gray-400 uppercase text-[9px] font-black tracking-widest block">Connected Ecosystem Vendors</div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-sans font-black text-[#1A1A1A]">{totalVendorsSum}</span>
            <span className="text-[10px] text-gray-500">ACTIVE BINDS</span>
          </div>
          <div className="text-[9px] text-gray-500 uppercase mt-2 pt-2 border-t border-[#EAEAE8] flex justify-between">
            <span>Avg Tenant density</span>
            <span className="font-bold text-gray-700">{(totalVendorsSum / (activeAppsCount || 1)).toFixed(1)} / NODE</span>
          </div>
        </div>

      </div>

      {/* 3. INFORMATION ALERT BINDER */}
      <div className="bg-[#FF5A00]/5 border-l-4 border-l-[#FF5A00] border border-[#D1D1CF] p-4 text-xs text-gray-700 font-sans leading-relaxed shadow-sm">
        <strong>SIMULATED WORKSPACE GATES:</strong> This is an operational visualization board for seiGEN's suite of integrated cloud applications. Activation gates write mock tokens to local storage and send audit heartbeats to the primary iTred log manager.
      </div>

      {/* 4. VISUAL FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D1D1CF] pb-2 font-mono text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="text-gray-500 uppercase font-bold mr-1">Filter Scope:</span>
          {(['ALL', 'ACTIVE', 'STANDBY', 'INACTIVE'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveVisualFilter(f)}
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-all rounded-none cursor-pointer ${
                activeVisualFilter === f
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white text-gray-600 border border-[#D1D1CF] hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-gray-400 uppercase font-semibold">
          SYSTEM CLOCK SYNCED • UTC SEC_TIME
        </div>
      </div>

      {/* 5. APPLICATION MASTER GRID */}
      <div id="ecosystem_app_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map(app => {
          const isActive = app.status === 'Active' || app.status === 'Degraded';
          return (
            <div
              key={app.id}
              className={`bg-white border-2 border-[#1A1A1A] flex flex-col justify-between relative rounded-none hover:shadow-md transition-all ${
                !isActive ? 'opacity-85 border-dashed bg-gray-50/50' : 'bg-white'
              }`}
            >
              {/* TOP HEADER */}
              <div className="p-5 border-b border-[#D1D1CF] space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">{app.category}</span>
                  
                  {/* Status label */}
                  <span className={`px-2 py-0.5 font-mono font-black text-[9px] uppercase inline-flex items-center border ${
                    app.status === 'Active' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                    app.status === 'Standby' ? 'bg-amber-50 border-amber-300 text-amber-700' :
                    app.status === 'Degraded' ? 'bg-rose-50 border-rose-300 text-rose-700' :
                    'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 mr-1.5 rounded-none ${
                      app.status === 'Active' ? 'bg-green-500' :
                      app.status === 'Standby' ? 'bg-amber-500 animate-pulse' :
                      app.status === 'Degraded' ? 'bg-rose-500 animate-bounce' :
                      'bg-gray-400'
                    }`} />
                    {app.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black font-sans text-[#1A1A1A] uppercase tracking-wide flex items-center space-x-1.5">
                    <Cpu className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF5A00]' : 'text-gray-400'}`} />
                    <span>{app.name}</span>
                  </h3>
                  <p className="text-xs text-gray-500 font-sans leading-tight line-clamp-2 min-h-[32px]">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* CORE METADATA SECTION */}
              <div className="p-5 bg-[#F4F4F1] border-b border-[#D1D1CF] font-mono text-xs space-y-3">
                
                {/* 1. Status & License */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-300/60">
                  <span className="text-gray-400 text-[9px] font-bold uppercase">License Key</span>
                  <div className="flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[#1A1A1A] font-bold font-mono text-[10px]">
                      {app.status === 'Inactive' ? 'UNLICENSED' : app.license}
                    </span>
                  </div>
                </div>

                {/* 2. Version */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-300/60">
                  <span className="text-gray-400 text-[9px] font-bold uppercase">Software Version</span>
                  <div className="flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[#1A1A1A] font-bold text-[10px]">{app.version}</span>
                  </div>
                </div>

                {/* 3. Health percentage bar */}
                <div className="space-y-1.5 pb-2 border-b border-gray-300/60">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 text-[9px] font-bold uppercase">System Health Node</span>
                    <span className={`font-bold ${app.health > 98 ? 'text-emerald-700' : app.health > 0 ? 'text-amber-700' : 'text-gray-500'}`}>
                      {app.health > 0 ? `${app.health}% NOMINAL` : '0% DEACTIVATED'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        app.health > 98 ? 'bg-emerald-500' : app.health > 50 ? 'bg-amber-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${app.health}%` }}
                    />
                  </div>
                </div>

                {/* 4. Connected Merchant Tenants Count */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[9px] font-bold uppercase">Connected Vendors</span>
                  <div className="flex items-center space-x-1 text-[#1A1A1A] font-bold text-[10px]">
                    <Users className="w-3.5 h-3.5 text-[#FF5A00]" />
                    <span>{app.connectedVendors} Merchant Nodes</span>
                  </div>
                </div>

              </div>

              {/* ACTION COMMAND BAR */}
              <div className="p-4 bg-white flex space-x-2">
                {/* Diagnostics Ping */}
                <button
                  disabled={app.status === 'Inactive' || pingingAppId !== null}
                  onClick={() => handlePingApp(app)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 font-mono font-bold text-[10px] border uppercase transition-colors rounded-none ${
                    app.status === 'Inactive'
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                      : pingingAppId === app.id
                      ? 'border-[#FF5A00] bg-orange-50 text-[#FF5A00] cursor-wait'
                      : 'border-[#1A1A1A] text-gray-700 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <Activity className={`w-3.5 h-3.5 ${pingingAppId === app.id ? 'animate-spin' : ''}`} />
                  <span>{pingingAppId === app.id ? 'PINGING...' : 'PING DIAGNOSTIC'}</span>
                </button>

                {/* Toggle Activation */}
                <button
                  onClick={() => handleToggleActivation(app.id)}
                  className={`flex-1 py-2 font-mono font-bold text-[10px] uppercase transition-all duration-150 border rounded-none cursor-pointer text-center ${
                    isActive
                      ? 'bg-[#1A1A1A] hover:bg-red-600 border-[#1A1A1A] hover:border-red-600 text-white shadow-sm'
                      : 'bg-[#FF5A00] hover:bg-[#E04F00] border-[#FF5A00] hover:border-[#E04F00] text-white font-black shadow-md'
                  }`}
                >
                  {isActive ? 'SUSPEND INST' : 'ACTIVATE INST'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* 6. REAL-TIME ECOSYSTEM MAP DIAGRAM & TELEMETRY SECTION */}
      <div id="ecosystem_topography_diagnostic" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Topography Map Diagram (Visual Architecture visualization) */}
        <div className="lg:col-span-7 bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="font-mono text-xs space-y-1 border-b border-[#D1D1CF] pb-3">
            <span className="bg-[#FF5A00] text-white font-bold px-1.5 py-0.2 text-[9px] uppercase inline-block font-sans">
              Network Topography
            </span>
            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide">
              Ecosystem Ingress topology map
            </h3>
            <p className="text-[10px] text-gray-500">REAL-TIME INTRALEDGER SIGNALLING PATHS</p>
          </div>

          {/* Centralized Hub Graphic and spokes */}
          <div className="py-8 flex flex-col items-center justify-center relative min-h-[240px] bg-[#F4F4F1] border border-[#D1D1CF]">
            {/* Core Central Server Node */}
            <div className="relative z-10 w-24 h-24 bg-[#1A1A1A] border-4 border-[#FF5A00] flex flex-col items-center justify-center text-center shadow-lg p-2">
              <Boxes className="w-8 h-8 text-white animate-pulse" />
              <span className="text-[10px] font-mono font-black text-white mt-1 uppercase tracking-tighter leading-none">
                seiGEN CORE
              </span>
              <span className="text-[7px] font-mono text-gray-400 leading-none mt-0.5">GATEWAY:3000</span>
            </div>

            {/* Simulated spoke lines and app positions */}
            <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-12 pointer-events-none">
              <div className="flex flex-col space-y-12">
                {/* iTredPOS */}
                <div className={`p-2 border text-[10px] font-mono font-bold transition-all ${
                  apps.find(a => a.id === 'app-pos')?.status === 'Active' 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 scale-105' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  iTredPOS
                </div>
                {/* iDeliver */}
                <div className={`p-2 border text-[10px] font-mono font-bold transition-all ${
                  apps.find(a => a.id === 'app-ideliver')?.status === 'Active' 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 scale-105' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  iDeliver
                </div>
                {/* CashPlan */}
                <div className={`p-2 border text-[10px] font-mono font-bold transition-all ${
                  apps.find(a => a.id === 'app-cashplan')?.status === 'Active' 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 scale-105' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  CashPlan
                </div>
              </div>

              <div className="flex flex-col space-y-12 text-right">
                {/* Vendor Discovery */}
                <div className={`p-2 border text-[10px] font-mono font-bold transition-all ${
                  apps.find(a => a.id === 'app-discovery')?.status === 'Active' 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 scale-105' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  Vendor Discovery
                </div>
                {/* PoolWise */}
                <div className={`p-2 border text-[10px] font-mono font-bold transition-all ${
                  apps.find(a => a.id === 'app-poolwise')?.status === 'Active' 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 scale-105' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  PoolWise
                </div>
                {/* Executive Desk */}
                <div className={`p-2 border text-[10px] font-mono font-bold transition-all ${
                  apps.find(a => a.id === 'app-execdesk')?.status === 'Active' 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 scale-105' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  Executive Desk
                </div>
              </div>
            </div>

            {/* Connecting visual overlay signals */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-11/12 border-t border-dashed border-[#FF5A00]/25 h-0" />
              <div className="absolute w-0 h-11/12 border-l border-dashed border-[#FF5A00]/25" />
            </div>

          </div>

          <div className="text-[10px] text-gray-500 font-mono flex justify-between uppercase">
            <span>TRANSMISSION PROTOCOL: AMQP OVER SSL</span>
            <span>DATA SEGMENT: INTRACORP-NET</span>
          </div>

        </div>

        {/* Diagnostic Telemetry Stream Monitor */}
        <div className="lg:col-span-5 bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col justify-between space-y-4 font-mono">
          <div className="text-xs space-y-1 border-b border-[#D1D1CF] pb-3">
            <span className="bg-[#1A1A1A] text-white font-bold px-1.5 py-0.2 text-[9px] uppercase inline-block font-sans">
              Telemetry Log
            </span>
            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide">
              Live Gateway Packet Monitor
            </h3>
            <p className="text-[10px] text-gray-500">OUTBOUND AMQP SIGNALS STREAM</p>
          </div>

          <div className="flex-1 bg-gray-950 p-4 rounded-none border border-[#2A2A2A] text-[9.5px] text-[#8E9299] space-y-2.5 overflow-y-auto max-h-[220px] font-mono leading-relaxed">
            {pingResult ? (
              <div className="space-y-1">
                <div className="text-[#FF5A00]">{"[OUTBOUND_REQ_INIT]"} triggering active ping sweep to segment: {pingResult.id}...</div>
                <div className="text-emerald-500">{"[INGRESS_ACK]"} returned clearance signal in {pingResult.latency}ms</div>
                <div className="text-white">{"[PAYLOAD]"} Message: "{pingResult.message}"</div>
                <div>{"[INTEGRITY_INDEX]"} verification checksum → PASS</div>
              </div>
            ) : (
              <div className="text-gray-600 italic">
                Awaiting telemetry request...
                <br />
                Click "PING DIAGNOSTIC" on any active application card to capture and decode live gateway packets in this console.
              </div>
            )}
            
            <div className="text-[8.5px] border-t border-[#2A2A2A] pt-2 text-gray-600">
              {"[CORE_DAEMON_ONLINE]"} Listening on interface 0.0.0.0:3000...
              <br />
              {"[SEIGEN_SECURITY_OK]"} TLS session authenticated securely
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-300 p-2.5 text-[9px] text-[#1A1A1A] leading-normal font-sans">
            <strong>DESTRUCTION ALERT:</strong> Deactivating an instance flushes all simulated bound merchant caches instantly. Make sure billing settlement runs are quiet before de-registering slots.
          </div>
        </div>

      </div>

    </div>
  );
}
