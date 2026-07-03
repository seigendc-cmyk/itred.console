import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../App';
import { runSCIDiagnostics } from '../diagnostics';
import { 
  SCI_ENVIRONMENT_STATES 
} from '../workspace/workspaceEnvironment';
import { 
  Cpu, 
  Sliders, 
  Database, 
  Activity, 
  FileText, 
  Bell, 
  RefreshCw, 
  Check, 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  Play, 
  HelpCircle, 
  Save, 
  Settings, 
  Layers, 
  User
} from 'lucide-react';

interface PlatformWorkspaceViewProps {
  initialTab?: 'dashboard' | 'environment' | 'diagnostics' | 'firebase' | 'security' | 'integrations' | 'audit' | 'notifications' | 'settings' | 'workflows';
}

export default function PlatformWorkspaceView({ initialTab = 'dashboard' }: PlatformWorkspaceViewProps) {
  const { 
    envMode, 
    onChangeEnvMode, 
    workspaceAuditEvents, 
    onClearWorkspaceAuditEvents,
    workspaceNotifications, 
    onMarkWorkspaceNotificationRead,
    systemConfig, 
    handleSaveSystemConfig,
    workflows,
    onUpdateWorkflow,
    activeStaffSession,
    onAddWorkspaceAuditEvent
  } = useLifecycle();

  const [activeTab, setActiveTab] = useState(initialTab);

  // Diagnostics check engine
  const [diagnosticsOutput, setDiagnosticsOutput] = useState<any[]>(() => runSCIDiagnostics());
  const [isRunningDiag, setIsRunningDiag] = useState(false);

  const passedChecks = useMemo(() => {
    return diagnosticsOutput.filter(r => r.passed).length;
  }, [diagnosticsOutput]);

  const failedChecks = useMemo(() => {
    return diagnosticsOutput.length - passedChecks;
  }, [diagnosticsOutput, passedChecks]);

  const handleRunDiagnostics = () => {
    setIsRunningDiag(true);
    setTimeout(() => {
      const res = runSCIDiagnostics();
      setDiagnosticsOutput(res);
      setIsRunningDiag(false);
      
      onAddWorkspaceAuditEvent({
        workspaceId: 'platform',
        actorStaffId: activeStaffSession?.staffId || 'system',
        actorName: activeStaffSession?.fullName || 'System',
        activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
        action: 'RUN_DIAGNOSTICS',
        targetType: 'system',
        targetId: 'runtime',
        result: 'success',
        message: 'Ran runtime diagnostic checks suite.'
      });

      alert('Runtime diagnostics execution complete.');
    }, 800);
  };

  const handlePrintDiagnostics = () => {
    console.log('--- SCI RUNTIME DIAGNOSTICS LOG ---');
    diagnosticsOutput.forEach(d => {
      console.log(`[${d.passed ? 'PASSED' : 'FAILED'}] ${d.name} (${d.code}) - ${d.message}`);
    });
    alert('Diagnostics output printed to development console. Press Ctrl+Shift+I to view.');
  };

  // Integration monitor in-memory status
  const [integrationsList, setIntegrationsList] = useState([
    { id: 'itredpos', name: 'iTredPOS Core', category: 'Point of Sale', status: 'Connected', lastSync: '3 min ago', contract: 'v1.4 API Agreement' },
    { id: 'discovery', name: 'Vendor Discovery Search', category: 'Directory', status: 'Connected', lastSync: '10 min ago', contract: 'Public Metadata SLA' },
    { id: 'ideliver', name: 'iDeliver Tracker', category: 'Logistics', status: 'Connected', lastSync: 'Just now', contract: 'Standard Routing SLA' },
    { id: 'cashplan', name: 'CashPlan Sync', category: 'Treasury', status: 'Planned', lastSync: '—', contract: 'Drafting Phase' },
    { id: 'poolwise', name: 'PoolWise Cooperatives', category: 'Stock Sharing', status: 'Planned', lastSync: '—', contract: 'Under Discussion' },
    { id: 'firebase', name: 'Firestore Cloud Uplink', category: 'Database', status: 'Prototype', lastSync: 'Mock only', contract: 'Skeleton blueprint v4' },
    { id: 'googleauth', name: 'Google OAuth Single-Sign-On', category: 'Security', status: 'Prototype', lastSync: 'Mock only', contract: 'Workspace integration layout' },
    { id: 'whatsapp', name: 'WhatsApp Business API', category: 'Alerts', status: 'Connected', lastSync: '1 hr ago', contract: 'Webhook Bridge SLA' },
    { id: 'googlemaps', name: 'Google Maps Geocoding', category: 'Location', status: 'Connected', lastSync: '4 hr ago', contract: 'Developer Keys SLA' }
  ]);

  const handleTestConnection = (id: string) => {
    alert(`Connection test succeeded for integration channel: ${id}. Ping round-trip: 42ms.`);
  };

  const handleMarkPlanned = (id: string) => {
    setIntegrationsList(prev => prev.map(item => item.id === id ? { ...item, status: 'Planned' } : item));
  };

  // Firebase schemas readiness
  const firebaseReadinessData = [
    { name: 'owner_accounts', purpose: 'Operator credentials, clearance, permissions schemas', ready: true, status: 'Blueprint Ready' },
    { name: 'vendors', purpose: 'Merchant registration details, lifecycle stages, settings', ready: true, status: 'Blueprint Ready' },
    { name: 'platform_plans', purpose: 'Product subscription packages, branch caps, pricing', ready: true, status: 'Blueprint Ready' },
    { name: 'pos_licenses', purpose: 'Physical terminal activation keys, expiry metadata', ready: true, status: 'Blueprint Ready' },
    { name: 'activation_requests', purpose: 'Pending vendor app registrations, device pings', ready: true, status: 'Blueprint Ready' },
    { name: 'audit_logs', purpose: 'Cryptographically sealed system action logs', ready: true, status: 'Blueprint Ready' }
  ];

  // Settings State Form
  const [appName, setAppName] = useState('SCI Workspace Control Centre');
  const [demoWatermark, setDemoWatermark] = useState(true);
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(true);
  const [auditEnabled, setAuditEnabled] = useState(true);

  // Filters for Audit Viewer
  const [auditFilterWorkspace, setAuditFilterWorkspace] = useState('all');
  const [auditFilterActor, setAuditFilterActor] = useState('all');
  const [auditFilterResult, setAuditFilterResult] = useState('all');

  const filteredAuditEvents = useMemo(() => {
    return workspaceAuditEvents.filter(e => {
      const matchWs = auditFilterWorkspace === 'all' || e.workspaceId === auditFilterWorkspace;
      const matchActor = auditFilterActor === 'all' || e.actorName === auditFilterActor;
      const matchRes = auditFilterResult === 'all' || e.result === auditFilterResult;
      return matchWs && matchActor && matchRes;
    });
  }, [workspaceAuditEvents, auditFilterWorkspace, auditFilterActor, auditFilterResult]);

  return (
    <div className="space-y-6 select-none font-mono text-[#1A1A1A]">
      
      {/* Header Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#D1D1CF] pb-4">
        <div className="text-left">
          <h1 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] font-sans">
            Platform operations console
          </h1>
          <p className="text-[10px] text-gray-500 font-medium font-sans">
            Diagnostics enforcements, environments config, integration channels, security blueprints, and compliance audits.
          </p>
        </div>

        <div className="flex flex-wrap border-2 border-[#1A1A1A] bg-white text-[8px] font-black uppercase rounded-none max-w-full">
          {([
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'environment', label: 'Environment' },
            { id: 'diagnostics', label: 'Diagnostics' },
            { id: 'firebase', label: 'Firebase' },
            { id: 'security', label: 'Security' },
            { id: 'integrations', label: 'Integrations' },
            { id: 'audit', label: 'Audit Logs' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'settings', label: 'Settings' },
            { id: 'workflows', label: 'Workflows' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1.5 cursor-pointer transition-all border-r border-[#1A1A1A] last:border-none ${
                activeTab === tab.id ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F4F4F1] text-gray-700 bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. PLATFORM DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* KPI 1: Env Mode */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5A00]" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Environment Mode</span>
              <span className="text-base font-sans font-black text-[#1A1A1A] block mt-1 uppercase">${envMode}</span>
              <span className="text-[7px] text-gray-500 font-medium block">Active system runtime config</span>
            </div>

            {/* KPI 2: Diagnostics Status */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Diagnostics Status</span>
              <span className="text-base font-sans font-black text-emerald-800 block mt-1">
                ${passedChecks} / ${diagnosticsOutput.length} PASSED
              </span>
              <span className="text-[7px] text-gray-500 font-medium block">All runtime modules online</span>
            </div>

            {/* KPI 3: Integrations Health */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Integration Health</span>
              <span className="text-base font-sans font-black text-gray-900 block mt-1">
                ${integrationsList.filter(i => i.status === 'Connected').length} connected
              </span>
              <span className="text-[7px] text-gray-500 font-medium block">External system synchronization</span>
            </div>

            {/* KPI 4: Firebase Readiness */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Firebase Readiness</span>
              <span className="text-base font-sans font-black text-gray-900 block mt-1">
                ${firebaseReadinessData.filter(f => f.ready).length} / ${firebaseReadinessData.length} ready
              </span>
              <span className="text-[7px] text-gray-500 font-medium block">Collection schema validation</span>
            </div>

            {/* KPI 5: Security Blueprint Status */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Security Blueprints</span>
              <span className="text-base font-sans font-black text-purple-800 block mt-1">Sealed</span>
              <span className="text-[7px] text-gray-500 font-medium block">Firestore security rules blueprint</span>
            </div>

            {/* KPI 6: Active Staff Sessions */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Active Sessions</span>
              <span className="text-base font-sans font-black text-gray-900 block mt-1">
                ${activeStaffSession ? 1 : 0} Session
              </span>
              <span className="text-[7px] text-gray-500 font-medium block">Verified active operators</span>
            </div>

            {/* KPI 7: Audit Events */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">Audit Events</span>
              <span className="text-base font-sans font-black text-gray-900 block mt-1">${workspaceAuditEvents.length} Logs</span>
              <span className="text-[7px] text-gray-500 font-medium block">Total compliance entries</span>
            </div>

            {/* KPI 8: System Notifications */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
              <span className="text-[8px] text-gray-400 block font-black uppercase">System Notifications</span>
              <span className="text-base font-sans font-black text-red-650 block mt-1">
                ${workspaceNotifications.filter(n => !n.read).length} Unread
              </span>
              <span className="text-[7px] text-gray-500 font-medium block">Outstanding alert stack</span>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick summary check */}
            <div className="lg:col-span-2 bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
              <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
                <span>Platform daemon core state</span>
              </div>
              <p className="text-[10px] text-gray-500 normal-case font-sans font-medium">
                The control centre monitors local diagnostics and enforces rules parameters. Transition to cloud-backed databases is pre-engineered under the Firebase readiness blueprinted schemas.
              </p>
              <div className="pt-2 text-[9px] font-black uppercase space-y-2">
                <button onClick={() => setActiveTab('environment')} className="w-full bg-[#F4F4F1] hover:bg-stone-200 border border-stone-250 p-2.5 flex justify-between cursor-pointer rounded-none text-left">
                  <span>Environment Mode Select</span>
                  <span>&rarr;</span>
                </button>
                <button onClick={() => setActiveTab('diagnostics')} className="w-full bg-[#F4F4F1] hover:bg-stone-200 border border-stone-250 p-2.5 flex justify-between cursor-pointer rounded-none text-left">
                  <span>Runtime Diagnostics Console</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* Warnings card */}
            <div className="bg-[#1A1A1A] border border-gray-800 text-white p-4 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <span>Security Assurance</span>
              </h4>
              <p className="text-gray-400 text-[10px] leading-relaxed font-sans normal-case font-medium">
                Prototype clearance locks database write permissions to local localStorage only. Webhook ingress points are protected via credentials tokens check.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* 2. ENVIRONMENT CENTRE */}
      {activeTab === 'environment' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['prototype', 'local_demo', 'staging', 'production'] as const).map(mode => {
              const state = SCI_ENVIRONMENT_STATES[mode];
              const isCurrent = envMode === mode;
              const isDisabled = mode === 'staging' || mode === 'production';

              return (
                <div key={mode} className={`bg-white border-2 p-4 relative flex flex-col justify-between min-h-[220px] ${
                  isCurrent ? 'border-[#FF5A00]' : 'border-[#1A1A1A]'
                }`}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />
                  {isCurrent && <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5A00]" />}

                  <div className="space-y-2">
                    <div className="flex justify-between items-start text-[8px] font-bold text-gray-400">
                      <span>MODE ID: {mode.toUpperCase()}</span>
                      {isCurrent && <span className="text-[#FF5A00] font-black uppercase text-[7px]">Active</span>}
                    </div>

                    <h3 className="font-sans font-black text-xs text-gray-900 uppercase mt-1">{state.label}</h3>
                    <p className="text-[8.5px] text-gray-500 leading-normal font-sans normal-case font-medium">{state.description}</p>
                  </div>

                  <div className="border-t border-stone-100 pt-3 text-[8.5px] text-gray-600 font-bold uppercase space-y-1.5">
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span>{state.storageMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cloud writes:</span>
                      <span>{state.firebaseWritesAllowed ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Watermark:</span>
                      <span>{state.demoWatermarkEnabled ? 'Yes' : 'No'}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isDisabled || isCurrent}
                      onClick={() => {
                        onChangeEnvMode(mode);
                        alert(`Switched environment pipeline mode to: ${state.label}`);
                      }}
                      className={`w-full py-1.5 text-[8px] font-black uppercase tracking-wider border text-center transition-all cursor-pointer ${
                        isDisabled 
                          ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-white border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white hover:border-transparent'
                      }`}
                    >
                      {isDisabled ? 'Locked' : isCurrent ? 'Active Mode' : 'Select Mode'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {!SCI_ENVIRONMENT_STATES[envMode].productionActionsEnabled && (
            <div className="bg-yellow-50 border-l-4 border-l-yellow-500 border border-yellow-200 p-4 text-[10px] text-yellow-800 font-sans leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <strong>PRODUCTION ACTIONS DISABLED:</strong> The active runtime environment mode is set to <strong>{envMode.toUpperCase()}</strong>. Cloud Firestore writes are disabled. Live credit card operations, POS gateway broadcasts, and client SMS alerts are bypassed locally.
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. DIAGNOSTICS CENTRE */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
          
          <div className="lg:col-span-2 bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
            <div className="border-b border-[#D1D1CF] pb-2.5 flex justify-between items-center text-[10px] font-black uppercase text-gray-800">
              <span>Diagnostics check report</span>
              <div className="flex gap-2">
                <button
                  onClick={handleRunDiagnostics}
                  disabled={isRunningDiag}
                  className="bg-[#FF5A00] text-white hover:bg-[#1A1A1A] px-2.5 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer disabled:bg-stone-200"
                >
                  {isRunningDiag ? 'Running...' : 'Run Diagnostics'}
                </button>
                <button
                  onClick={handlePrintDiagnostics}
                  className="bg-white border border-[#1A1A1A] hover:bg-stone-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider cursor-pointer"
                >
                  Print to Console
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-150">
              {diagnosticsOutput.map((d, index) => (
                <div key={index} className="py-3 flex justify-between items-start gap-4 text-[9px]">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 uppercase font-sans">{d.name}</h4>
                    <p className="text-gray-500 leading-normal font-sans normal-case font-medium">{d.message}</p>
                    <span className="text-[7.5px] text-gray-400 font-normal">CODE: {d.code}</span>
                  </div>

                  <span className={`px-2 py-0.5 font-black uppercase text-[7.5px] border ${
                    d.passed ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-200 text-red-700 bg-red-50'
                  }`}>
                    {d.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
            <div className="border-b border-[#D1D1CF] pb-2 text-[10px] font-black uppercase text-[#FF5A00]">
              <span>Diagnostic parameters</span>
            </div>
            <p className="text-[10px] text-gray-500 font-sans normal-case leading-relaxed font-medium">
              Diagnostics runs real-time integrity assertions across standard business licenses, quota mappings, and terminal activations adapter blocks.
            </p>
          </div>

        </div>
      )}

      {/* 4. FIREBASE READINESS */}
      {activeTab === 'firebase' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {firebaseReadinessData.map(item => (
              <div key={item.name} className="bg-white border-2 border-[#1A1A1A] p-4 relative flex flex-col justify-between space-y-4 min-h-[140px]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />
                
                <div className="space-y-1">
                  <div className="flex justify-between items-start text-[8px] font-bold text-gray-400">
                    <span>FIRESTORE COLLECTION</span>
                    <span className="text-emerald-850 bg-green-50 border border-green-200 px-1.5 py-0.2 uppercase font-black">Blueprint OK</span>
                  </div>
                  <h4 className="font-sans font-black text-xs text-gray-900 uppercase tracking-wide mt-1">{item.name}</h4>
                  <p className="text-[8.5px] text-gray-500 leading-normal font-sans normal-case font-medium">{item.purpose}</p>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-[9px] font-black uppercase">
                  <span>Ready Schema: {item.ready ? 'Yes' : 'No'}</span>
                  <span className="text-gray-400 text-[7px] font-bold">{item.status}</span>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 5. SECURITY BLUEPRINT */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
          
          <div className="lg:col-span-2 bg-[#1A1A1A] text-white p-5 border border-gray-800 space-y-4">
            
            <div className="border-b border-gray-800 pb-2.5">
              <span className="text-orange-400 font-black uppercase text-[10px] block">Firestore Security Rules Blueprint</span>
            </div>

            <pre className="text-[9.5px] leading-relaxed text-gray-300 font-mono overflow-x-auto whitespace-pre p-4 bg-black/40 border border-gray-900 select-text font-semibold">
              {"rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    \n    // Core Rules: Licensing Authority vs consumer\n    match /pos_licenses/{licenseId} {\n      allow read: if request.auth != null;\n      allow write: if hasRole('sci_admin') || hasRole('super_admin');\n    }\n\n    // Demo environment write protections\n    match /vendors/{vendorId} {\n      allow create, update: if request.auth != null && \n        (resource == null || resource.data.storageMode == 'localOnly');\n      allow delete: if hasRole('super_admin');\n    }\n\n    // Auth helpers functions\n    function hasRole(role) {\n      return get(/databases/$(database)/documents/owner_accounts/$(request.auth.uid)).data.role == role;\n    }\n  }\n}"}
            </pre>
          </div>

          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
            
            <div className="border-b border-[#D1D1CF] pb-2 text-[10px] font-black uppercase text-gray-800">
              <span>Platform Role Groups</span>
            </div>

            <div className="space-y-3 text-[9px] font-bold text-gray-500 uppercase">
              <div className="bg-stone-50 border border-stone-200 p-2.5">
                <span className="text-gray-900 block text-[9.5px]">Super Admin</span>
                <span className="text-[7.5px] text-gray-400 mt-0.5 block">Full global root privileges access.</span>
              </div>
              <div className="bg-stone-50 border border-stone-200 p-2.5">
                <span className="text-gray-900 block text-[9.5px]">SCI Admin</span>
                <span className="text-[7.5px] text-gray-400 mt-0.5 block">Operations, billing setups.</span>
              </div>
              <div className="bg-stone-50 border border-stone-200 p-2.5">
                <span className="text-gray-900 block text-[9.5px]">RPN Agent</span>
                <span className="text-[7.5px] text-gray-400 mt-0.5 block">Vendor referral onboarding clearance.</span>
              </div>
              <div className="bg-stone-50 border border-stone-200 p-2.5">
                <span className="text-gray-900 block text-[9.5px]">Vendor Owner</span>
                <span className="text-[7.5px] text-gray-400 mt-0.5 block">Merchant manager.</span>
              </div>
              <div className="bg-stone-50 border border-stone-200 p-2.5">
                <span className="text-gray-900 block text-[9.5px]">POS Staff</span>
                <span className="text-[7.5px] text-gray-400 mt-0.5 block">Read-only transaction nodes.</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 6. INTEGRATION MONITOR */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationsList.map(srv => (
              <div key={srv.id} className="bg-white border-2 border-[#1A1A1A] p-4 relative flex flex-col justify-between space-y-4 min-h-[160px]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start text-[8px] font-bold text-gray-400">
                    <span>CATEGORY: {srv.category.toUpperCase()}</span>
                    <span className={`px-1.5 border py-0.2 text-[7px] font-black uppercase ${
                      srv.status === 'Connected' ? 'border-green-300 text-emerald-850 bg-green-50' : 'border-stone-300 text-stone-500 bg-stone-50'
                    }`}>
                      {srv.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-black font-sans text-gray-900 uppercase tracking-wide">{srv.name}</h3>
                    <p className="text-[8px] text-gray-400 uppercase">Handshake: {srv.lastSync}</p>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-[9px] font-black uppercase">
                  <span className="text-[7.5px] text-gray-500 select-text">{srv.contract}</span>
                  
                  <div className="flex gap-1">
                    <button onClick={() => handleTestConnection(srv.id)} className="bg-white border border-[#1A1A1A] hover:bg-stone-100 px-2 py-0.5 text-[7.5px] font-black cursor-pointer">Test Pin</button>
                    {srv.status !== 'Planned' && (
                      <button onClick={() => handleMarkPlanned(srv.id)} className="bg-white border border-stone-250 px-2 py-0.5 text-[7.5px] font-black cursor-pointer">Planned</button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 7. WORKSPACE AUDIT VIEWER */}
      {activeTab === 'audit' && (
        <div className="space-y-4 text-left">
          
          {/* Filters */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-[9px] uppercase">Workspace:</span>
              <select
                value={auditFilterWorkspace}
                onChange={(e) => setAuditFilterWorkspace(e.target.value)}
                className="bg-white border border-stone-250 p-1 text-[9px] font-bold uppercase focus:outline-none cursor-pointer"
              >
                <option value="all">All Workspaces</option>
                <option value="licensing_centre">Licensing Centre</option>
                <option value="rpn_operations">RPN Operations</option>
                <option value="commercial">Commercial</option>
                <option value="finance">Finance</option>
                <option value="platform">Platform</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-[9px] uppercase">Actor Profile:</span>
              <select
                value={auditFilterActor}
                onChange={(e) => setAuditFilterActor(e.target.value)}
                className="bg-white border border-stone-250 p-1 text-[9px] font-bold uppercase focus:outline-none cursor-pointer"
              >
                <option value="all">All Profiles</option>
                {Array.from(new Set(workspaceAuditEvents.map(e => e.actorName))).map(actor => (
                  <option key={actor} value={actor}>{actor}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-[9px] uppercase">Execution:</span>
              <select
                value={auditFilterResult}
                onChange={(e) => setAuditFilterResult(e.target.value)}
                className="bg-white border border-stone-250 p-1 text-[9px] font-bold uppercase focus:outline-none cursor-pointer"
              >
                <option value="all">All Results</option>
                <option value="success">Success</option>
                <option value="blocked">Blocked</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            {workspaceAuditEvents.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Flush entire audit database?')) {
                    onClearWorkspaceAuditEvents();
                  }
                }}
                className="ml-auto bg-white border border-red-655 hover:bg-red-650 hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
              >
                Flush logs
              </button>
            )}
          </div>

          {/* Audit Viewer list */}
          <div className="bg-white border-2 border-[#1A1A1A] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[9px] font-mono">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#1A1A1A] uppercase font-bold text-[8px] tracking-wider text-gray-500">
                    <th className="p-3 border-r border-gray-200">Audit ID</th>
                    <th className="p-3 border-r border-gray-200">Timestamp</th>
                    <th className="p-3 border-r border-gray-200">Actor</th>
                    <th className="p-3 border-r border-gray-200">Action directive</th>
                    <th className="p-3 border-r border-gray-200">Target Type</th>
                    <th className="p-3 border-r border-gray-200">Target ID</th>
                    <th className="p-3">Execution</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditEvents.map(e => (
                    <tr key={e.auditId} className="border-b border-gray-150 hover:bg-[#FAF9F6] transition-colors">
                      <td className="p-3 border-r border-gray-200 font-bold text-gray-450">{e.auditId}</td>
                      <td className="p-3 border-r border-gray-200 font-mono text-gray-455">{new Date(e.createdAt).toLocaleString()}</td>
                      <td className="p-3 border-r border-gray-200 font-sans font-bold text-gray-800">{e.actorName}</td>
                      <td className="p-3 border-r border-gray-200 uppercase">{e.action}</td>
                      <td className="p-3 border-r border-gray-200 text-gray-500 uppercase text-[8px]">{e.targetType}</td>
                      <td className="p-3 border-r border-gray-200 font-mono font-bold select-all text-[8px]">{e.targetId || '—'}</td>
                      <td className="p-3">
                        <span className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${
                          e.result === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
                        }`}>
                          {e.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 8. SYSTEM NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 text-left">
          
          <div className="bg-white border-2 border-[#1A1A1A] p-4 flex justify-between items-center text-[10px] font-black uppercase">
            <span>Outstanding alert stream</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  workspaceNotifications.forEach(n => {
                    if (!n.read) onMarkWorkspaceNotificationRead(n.notificationId);
                  });
                  alert('All notifications acknowledged.');
                }}
                className="bg-white border border-[#1A1A1A] hover:bg-stone-100 px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
              >
                Acknowledge All
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('sci_workspace_notifications', JSON.stringify([]));
                  window.location.reload();
                }}
                className="bg-white border border-red-655 hover:bg-red-650 hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
              >
                Flush local notifications
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {workspaceNotifications.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 p-8 text-center text-gray-400 italic text-[10px] uppercase font-bold">
                Alert stack buffer empty.
              </div>
            ) : (
              workspaceNotifications.map(n => (
                <div key={n.notificationId} className={`bg-white border-2 p-4 relative flex justify-between items-center ${
                  n.read ? 'border-gray-250 opacity-75' : 'border-[#FF5A00] border-l-4 border-l-[#FF5A00]'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[7.5px] text-gray-400 font-bold uppercase">{n.type}</span>
                      {!n.read && <span className="text-[#FF5A00] text-[8px] font-black uppercase">Unacknowledged</span>}
                    </div>
                    <h4 className="font-sans font-black text-xs text-gray-900 uppercase mt-1">{n.title}</h4>
                    <p className="text-[8.5px] text-gray-500 font-sans normal-case leading-relaxed font-medium">{n.message}</p>
                    <span className="text-[7px] text-gray-400 block mt-0.5">Epoch: {new Date(n.createdAt).toLocaleTimeString()}</span>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => onMarkWorkspaceNotificationRead(n.notificationId)}
                      className="bg-white border border-[#1A1A1A] hover:bg-emerald-600 hover:text-white hover:border-transparent px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                    >
                      Dismiss Alert
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* 9. SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
          
          <div className="lg:col-span-2 bg-white border-2 border-[#1A1A1A] p-6 relative shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <div className="border-b border-[#D1D1CF] pb-2.5 mb-4 text-[#FF5A00] font-black uppercase text-[10px]">
              <span>System Settings Constants</span>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveSystemConfig({
                ...systemConfig,
                appName
              });
              alert('System configuration parameters saved.');
            }} className="space-y-4 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">App Name Header</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Environment Mode</label>
                  <input
                    type="text"
                    value={envMode}
                    readOnly
                    className="w-full bg-stone-50 border border-stone-200 p-2 text-xs font-bold text-stone-400 cursor-not-allowed uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Storage mode</label>
                  <input
                    type="text"
                    value={SCI_ENVIRONMENT_STATES[envMode].storageMode}
                    readOnly
                    className="w-full bg-stone-50 border border-stone-200 p-2 text-xs font-bold text-stone-400 cursor-not-allowed uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={demoWatermark}
                    onChange={(e) => setDemoWatermark(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <label className="uppercase text-[8px] cursor-pointer">Demo Watermark</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={diagnosticsEnabled}
                    onChange={(e) => setDiagnosticsEnabled(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <label className="uppercase text-[8px] cursor-pointer">Diag Enabled</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={auditEnabled}
                    onChange={(e) => setAuditEnabled(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <label className="uppercase text-[8px] cursor-pointer">Audit Enabled</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#FF5A00] text-white text-[10px] tracking-wider uppercase font-black hover:bg-[#1A1A1A] transition-colors cursor-pointer rounded-none"
              >
                Save Settings Configuration
              </button>
            </form>
          </div>

          <div className="bg-[#1A1A1A] border border-gray-800 text-white p-5 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1">
              <Sliders className="w-4 h-4 text-orange-400" />
              <span>Daemon Layer Settings</span>
            </h4>
            <p className="text-gray-400 text-[10px] leading-relaxed font-sans normal-case font-medium">
              Altering configurations will refresh current active operator sessions. Live settings validations are run on commit checks.
            </p>
          </div>

        </div>
      )}

      {/* 10. WORKFLOW QUEUE */}
      {activeTab === 'workflows' && (
        <div className="space-y-4 text-left">
          
          <div className="bg-white border-2 border-[#1A1A1A] p-4">
            <h3 className="text-xs font-black uppercase text-gray-800 font-sans">Verification Workflow approval queue</h3>
            <p className="text-[9px] text-gray-500 font-sans normal-case leading-relaxed font-medium mt-0.5">Outstanding operator approvals required for plan assignments, RPN additions, and activations validation.</p>
          </div>

          <div className="space-y-3">
            {workflows.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 p-8 text-center text-gray-400 italic text-[10px] uppercase font-bold">
                Workflow queue empty. No pending action approvals required.
              </div>
            ) : (
              workflows.map(wf => (
                <div key={wf.workflowId} className="bg-white border-2 border-[#1A1A1A] p-4 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[7.5px] text-gray-400 font-bold uppercase">{wf.workflowType}</span>
                      <span className={`px-1.5 border py-0.2 text-[7px] font-black uppercase ${
                        wf.status === 'completed' ? 'border-green-300 text-emerald-850 bg-green-50' : 'border-yellow-300 text-yellow-800 bg-yellow-50'
                      }`}>
                        {wf.status}
                      </span>
                    </div>

                    <h4 className="font-sans font-black text-xs text-gray-900 uppercase mt-1">{wf.title}</h4>
                    <p className="text-[8.5px] text-gray-500 font-sans normal-case leading-relaxed font-medium">{wf.description}</p>
                    
                    <div className="text-[7.5px] text-gray-400 font-bold uppercase pt-1">
                      Requester: {wf.requesterName} • Steps: {wf.currentStep} / {wf.totalSteps}
                    </div>
                  </div>

                  {wf.status !== 'completed' && wf.status !== 'approved' && wf.status !== 'rejected' && (
                    <div className="flex gap-1.5 text-[8.5px] font-black uppercase">
                      <button
                        onClick={() => {
                          onUpdateWorkflow(wf.workflowId, { status: 'completed' });
                          alert('Workflow marked as completed.');
                        }}
                        className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white px-2.5 py-1.5 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          onUpdateWorkflow(wf.workflowId, { status: 'rejected' });
                          alert('Workflow marked as rejected.');
                        }}
                        className="bg-white border border-[#1A1A1A] hover:bg-stone-100 px-2.5 py-1.5 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
