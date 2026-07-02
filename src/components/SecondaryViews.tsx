import React, { useState } from 'react';
import { 
  AppNotification, 
  AuditLog, 
  SystemConfig, 
  IntegrationService 
} from '../types';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Search, 
  Sliders, 
  Save, 
  Activity, 
  Link2, 
  Link2Off, 
  ShieldAlert, 
  Database,
  Cpu
} from 'lucide-react';

/* ==========================================================================
   1. NOTIFICATIONS VIEW
   ========================================================================== */
interface NotificationsViewProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
  onToggleRead: (notifId: string) => void;
}

export function NotificationsView({
  notifications,
  onMarkAllRead,
  onClearNotifications,
  onToggleRead
}: NotificationsViewProps) {
  const [filter, setFilter] = useState<'all' | 'alert' | 'warning' | 'success' | 'info'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div id="notifications_view" className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="border-b border-[#D1D1CF] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider">System Alerts & Notifications</h1>
          <p className="text-xs text-gray-500 mt-0.5">LIVE NODE BROADCAST LOGGER & TELEMETRY EVENTS</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onMarkAllRead}
            className="flex items-center space-x-1.5 border border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors rounded-none cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Acknowledge All</span>
          </button>
          <button
            onClick={onClearNotifications}
            className="flex items-center space-x-1.5 border border-red-600 hover:bg-red-600 text-red-600 hover:text-white bg-white text-xs font-semibold px-3 py-1.5 transition-colors rounded-none cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Flush Buffer</span>
          </button>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap border-b border-[#D1D1CF] gap-1">
        {(['all', 'alert', 'warning', 'success', 'info'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 font-bold uppercase transition-all rounded-none ${
              filter === type
                ? 'bg-[#1A1A1A] text-white border-t border-x border-[#1A1A1A]'
                : 'text-gray-500 hover:bg-[#F4F4F1] hover:text-[#1A1A1A]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Notification Stream Card Stack */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 uppercase bg-white border border-[#D1D1CF]">
            ALERTS BUFFER EMPTY IN THIS SEVERITY SPECTRUM
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => onToggleRead(n.id)}
              className={`p-4 border bg-white relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer transition-all hover:bg-[#F4F4F1] shadow-sm ${
                !n.read 
                  ? 'border-2 border-[#1A1A1A] border-l-4 border-l-[#FF5A00]' 
                  : 'border-[#D1D1CF] opacity-75'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className={`px-2 py-0.5 font-bold text-[9px] uppercase tracking-wide shrink-0 ${
                  n.type === 'alert' ? 'bg-red-100 text-red-800' :
                  n.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  n.type === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {n.type}
                </span>
                <div>
                  <div className="font-bold text-[#1A1A1A] text-sm font-sans uppercase">
                    {n.title}
                  </div>
                  <p className="text-gray-600 font-sans mt-0.5 text-xs">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-1.5 uppercase">
                    RECEIVED: {new Date(n.timestamp).toLocaleString()} • ID: {n.id}
                  </span>
                </div>
              </div>

              {/* Status flag */}
              <div className="flex items-center space-x-2 shrink-0 sm:justify-end">
                <span className={`px-1.5 py-0.5 text-[9px] font-bold ${
                  n.read ? 'bg-gray-200 text-gray-600' : 'bg-[#FF5A00]/20 text-[#FF5A00]'
                }`}>
                  {n.read ? 'ACKNOWLEDGED' : 'PENDING ACTION'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


/* ==========================================================================
   2. AUDIT LOGS VIEW
   ========================================================================== */
interface AuditLogsViewProps {
  logs: AuditLog[];
  searchQuery: string;
  onActorFilter: (actor: string) => void;
  selectedActor: string;
}

export function AuditLogsView({
  logs,
  searchQuery,
  onActorFilter,
  selectedActor
}: AuditLogsViewProps) {
  
  // Extract unique actors for filter options
  const uniqueActors = Array.from(new Set(logs.map(l => l.actor)));

  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase();
    const actorMatch = selectedActor === 'all' || log.actor === selectedActor;
    const searchMatch =
      log.action.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.id.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q);
    return actorMatch && searchMatch;
  });

  return (
    <div id="audit_logs_view" className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="border-b border-[#D1D1CF] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider">Audit Security Log</h1>
          <p className="text-xs text-gray-500 mt-0.5">TAMPER-PROOF OPERATION SIGNALS & KEEPER TRACE INDEX</p>
        </div>
        
        {/* Actor Selector dropdown mock */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-gray-500 text-[10px] uppercase">ACTOR ROUTE:</span>
          <select
            value={selectedActor}
            onChange={(e) => onActorFilter(e.target.value)}
            className="bg-[#F4F4F1] border border-[#D1D1CF] px-2 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none uppercase font-semibold"
          >
            <option value="all">ALL SECURITY ROUTES</option>
            {uniqueActors.map(actor => (
              <option key={actor} value={actor}>{actor.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#D1D1CF]">
        <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] flex justify-between items-center text-gray-500 font-bold">
          <span className="uppercase">RECORDED OPERATIONS EVENTS ({filteredLogs.length})</span>
          <span>COMPLIANCE STATUS: SEALED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EAEAE8] border-b border-[#D1D1CF] text-gray-600 uppercase tracking-wider">
                <th className="p-3">SIGNAL ID</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">ACTOR PROFILE</th>
                <th className="p-3">ACTION DIRECTIVE</th>
                <th className="p-3">TARGET OBJECT REF</th>
                <th className="p-3 text-right">EXECUTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1D1CF]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 uppercase">
                    NO COMPLIANCE SIGNALS LOGGED MATCHING SELECTION
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F4F4F1] transition-colors">
                    <td className="p-3 align-middle font-bold text-[#1A1A1A]">
                      {log.id}
                    </td>
                    <td className="p-3 align-middle text-gray-500">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="p-3 align-middle">
                      <span className="bg-gray-200 text-[#1A1A1A] px-1.5 py-0.5 font-bold uppercase text-[10px]">
                        {log.actor}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-[#1A1A1A] font-semibold uppercase">
                      {log.action}
                    </td>
                    <td className="p-3 align-middle text-gray-600">
                      {log.target}
                    </td>
                    <td className="p-3 align-middle text-right">
                      <span className={`px-1.5 py-0.5 font-bold text-[9px] uppercase ${
                        log.status === 'Success' ? 'bg-green-100 text-green-800' :
                        log.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
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


/* ==========================================================================
   3. SYSTEM SETTINGS VIEW
   ========================================================================== */
interface SystemSettingsViewProps {
  config: SystemConfig;
  onSaveConfig: (updatedConfig: SystemConfig) => void;
}

export function SystemSettingsView({ config, onSaveConfig }: SystemSettingsViewProps) {
  const [formConfig, setFormConfig] = useState<SystemConfig>({ ...config });
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div id="system_settings_view" className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="border-b border-[#D1D1CF] pb-4">
        <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider">System Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">CORE DAEMON CONSTANTS & SECURE SUITE GATEWAY PARAMETERS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form panel */}
        <div className="lg:col-span-2 bg-white border-2 border-[#1A1A1A] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-sm font-bold uppercase text-[#1A1A1A] border-b border-[#D1D1CF] pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#FF5A00]" />
              OPERATIONAL HARDENING ADJUSTMENTS
            </h2>

            {successMsg && (
              <div className="bg-green-100 border border-green-300 text-green-800 p-3 text-xs uppercase font-bold">
                DAEMON PARAMETERS UPDATED SUCCESSFULLY — HOT SWAP ENFORCED
              </div>
            )}

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* System Mode */}
              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase text-[10px] block font-bold">SYSTEM PIPELINE MODE</label>
                <select
                  value={formConfig.systemMode}
                  onChange={(e) => setFormConfig({ ...formConfig, systemMode: e.target.value as any })}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none uppercase font-semibold"
                >
                  <option value="Active">ACTIVE — REGULAR CLEARANCE</option>
                  <option value="Maintenance">MAINTENANCE — LOCK NEW KEYING</option>
                  <option value="Recovery">RECOVERY — RECONCILE LEDGERS</option>
                </select>
              </div>

              {/* Version info - Read Only */}
              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase text-[10px] block font-bold">seiGEN DAEMON LAYER VERSION</label>
                <input
                  type="text"
                  value={formConfig.seiGenVersion}
                  readOnly
                  className="w-full bg-[#EAEAE8]/50 border border-[#D1D1CF] p-2 text-xs text-gray-500 rounded-none cursor-not-allowed"
                />
              </div>

              {/* Heartbeat rate */}
              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase text-[10px] block font-bold">POS HEARTBEAT INTERVAL (SEC)</label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={formConfig.posHeartbeatInterval}
                  onChange={(e) => setFormConfig({ ...formConfig, posHeartbeatInterval: parseInt(e.target.value) || 30 })}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold"
                />
              </div>

              {/* Debug toggles */}
              <div className="space-y-1.5">
                <label className="text-gray-500 uppercase text-[10px] block font-bold">TRACE VERBOSE DEBUGGING</label>
                <select
                  value={formConfig.debugLogs ? 'true' : 'false'}
                  onChange={(e) => setFormConfig({ ...formConfig, debugLogs: e.target.value === 'true' })}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none uppercase font-semibold"
                >
                  <option value="false">MUTED — LOG SECURE ONLY</option>
                  <option value="true">VERBOSE — LOG VERBOSE PIPE</option>
                </select>
              </div>

              {/* Gateway IP */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-gray-500 uppercase text-[10px] block font-bold">SYS DEPLOYMENT INGRESS GATEWAY BIND IP</label>
                <input
                  type="text"
                  value={formConfig.gatewayIp}
                  onChange={(e) => setFormConfig({ ...formConfig, gatewayIp: e.target.value })}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold"
                />
              </div>

            </div>

            <button
              type="submit"
              className="flex items-center justify-center space-x-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white text-xs font-mono py-2 px-4 uppercase tracking-wider font-semibold transition-colors rounded-none w-full cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>COMMIT CONSTANTS SECURELY</span>
            </button>
          </form>
        </div>

        {/* Security reference card */}
        <div className="bg-[#1A1A1A] border border-gray-800 text-white p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-white uppercase border-b border-gray-800 pb-1.5 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-[#FF5A00]" />
            INTELLIGENCE SUMMARY
          </h3>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Variables written to this console adjust the operation parameters of the <strong>ingress routing nodes</strong> instantly. Hot reloading is completed within a single transmission epoch (~1500ms).
          </p>
          <div className="p-3 bg-red-950/20 border border-red-900/30 text-[10px] text-red-400 font-sans">
            <strong>CRITICAL ASSURANCE:</strong> Altering deployment IP bindings will disrupt legacy micro-POS agents until manual key rebinds are completed. Execute with absolute validation.
          </div>
        </div>

      </div>
    </div>
  );
}


/* ==========================================================================
   4. INTEGRATIONS VIEW
   ========================================================================== */
interface IntegrationsViewProps {
  services: IntegrationService[];
  onToggleService: (serviceId: string) => void;
}

export function IntegrationsView({ services, onToggleService }: IntegrationsViewProps) {
  return (
    <div id="integrations_view" className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="border-b border-[#D1D1CF] pb-4">
        <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider">Ecosystem Integrations</h1>
        <p className="text-xs text-gray-500 mt-0.5">THIRD-PARTY LEDGER LINKING, ROUTING CHANNELS & SETTLEMENT SCHEMAS</p>
      </div>

      <div className="bg-[#FF5A00]/10 border-l-4 border-l-[#FF5A00] border border-[#D1D1CF] p-4 text-xs text-gray-700 font-sans leading-relaxed shadow-sm">
        <strong>THIRD-PARTY SYNC COMPLIANCE:</strong> Ingress relays poll synced external gateways every 300 seconds. Disconnecting a service immediately suspends outbound settlement flows until manual sync reauthorization.
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-[#D1D1CF] p-5 space-y-4 flex flex-col justify-between relative rounded-none hover:border-[#1A1A1A] transition-all shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-gray-400 font-bold uppercase">{srv.id}</span>
                <span className={`px-2 py-0.5 font-bold text-[9px] uppercase inline-flex items-center border ${
                  srv.status === 'Connected' ? 'bg-green-50 border-green-200 text-green-700' :
                  srv.status === 'Disconnected' ? 'bg-gray-100 border-gray-200 text-gray-500' :
                  'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 mr-1.5 rounded-none ${
                    srv.status === 'Connected' ? 'bg-green-500' :
                    srv.status === 'Disconnected' ? 'bg-gray-400' :
                    'bg-red-500'
                  }`} />
                  {srv.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold font-sans text-[#1A1A1A] uppercase tracking-wide">
                  {srv.name}
                </h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  Category: <strong className="text-gray-700 uppercase font-semibold">{srv.category}</strong>
                </p>
              </div>

              <div className="text-[10px] text-gray-400 uppercase font-bold">
                LAST LEDGER HANDSHAKE: <strong className="text-gray-600 font-bold">{srv.lastSync}</strong>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="pt-4 border-t border-[#D1D1CF] flex justify-between items-center">
              <span className="text-[9px] text-gray-400 uppercase">SYNC CAPABLE</span>
              <button
                onClick={() => onToggleService(srv.id)}
                className={`flex items-center space-x-1 px-3 py-1 text-[10px] font-bold border uppercase transition-colors cursor-pointer rounded-none ${
                  srv.status === 'Connected'
                    ? 'border-red-600 text-red-600 hover:bg-red-50'
                    : 'border-green-600 text-green-600 hover:bg-green-50'
                }`}
              >
                {srv.status === 'Connected' ? (
                  <>
                    <Link2Off className="w-3 h-3" />
                    <span>Sever Channel</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3 h-3" />
                    <span>Bind Channel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
