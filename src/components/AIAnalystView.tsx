import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  ShieldAlert, 
  Users, 
  HelpCircle, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText,
  DollarSign,
  ArrowRight,
  Cpu,
  User,
  Layers,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { useLifecycle } from '../App';
import { AuditLog, Vendor, FinanceRecord } from '../types';

// Simple regex-based Markdown formatter for reports to keep them clean, lightweight, and fast
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div className="space-y-3 font-sans text-xs leading-relaxed text-[#2D2D2D]">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={index} className="text-xs font-bold uppercase tracking-wider text-[#FF5A00] mt-4 mb-1">
              {trimmed.substring(4)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={index} className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] border-b border-[#D1D1CF] pb-1 mt-6 mb-2">
              {trimmed.substring(3)}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={index} className="text-base font-black uppercase tracking-widest text-[#1A1A1A] bg-[#F4F4F1] p-2 border-l-4 border-[#FF5A00] mt-6 mb-3">
              {trimmed.substring(2)}
            </h2>
          );
        }

        // Bullet Points
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.substring(2);
          return (
            <div key={index} className="flex items-start space-x-2 pl-2">
              <span className="text-[#FF5A00] font-black shrink-0 mt-1">•</span>
              <span>{formatBoldText(content)}</span>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={index} className="flex items-start space-x-2 pl-2">
              <span className="text-[#1A1A1A] font-bold shrink-0">{numMatch[1]}.</span>
              <span>{formatBoldText(numMatch[2])}</span>
            </div>
          );
        }

        // Empty lines
        if (trimmed === '') {
          return <div key={index} className="h-2" />;
        }

        // Standard Paragraph text with custom bold parsing
        return (
          <p key={index} className="text-[#2D2D2D]">
            {formatBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Format **text** into JSX bold tags
function formatBoldText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-[#1A1A1A]">{part}</strong>;
    }
    return part;
  });
}

export default function AIAnalystView() {
  const { 
    auditLogs, 
    vendors, 
    financeRecords, 
    activationRequests, 
    rpnAgents, 
    currentAdmin, 
    currentCompany,
    systemConfig,
    addLogAndNotify 
  } = useLifecycle();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'analyst'>('analytics');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preset analytical prompt guides
  const PRESET_PROMPTS = [
    { 
      id: 'vendor_health',
      label: 'Vendor Health Audit', 
      icon: Users,
      desc: 'Verify onboarding speed, geographical load, suspended threats, and edge node routing efficiency.',
      promptText: 'Conduct a comprehensive Vendor Health Audit. Focus on verification timelines, regional distribution, RPN agent allocation, and security threats represented by any suspended status.'
    },
    { 
      id: 'staff_security',
      label: 'Staff Activity & Security Clearance', 
      icon: ShieldAlert,
      desc: 'Analyze operational load, command distribution, potential clearance breaches, and key rotations.',
      promptText: 'Perform a detailed Staff Activity & Security Clearance Audit. Map out operational logs by actor, identify clearance distribution bottlenecks, check cryptographic key rotation schedules, and highlight anomalous patterns.'
    },
    { 
      id: 'system_health',
      label: 'Console Logs & Signal Health', 
      icon: TrendingUp,
      desc: 'Audit real-time system failure loops, daemon logs, warning rates, and gateway mapping bounds.',
      promptText: 'Analyze system log files and warning logs. Check for systemic warnings or failure states, compute console action reliability indexes, identify critical error loops, and assess Gateway routing performance.'
    },
    { 
      id: 'financial_integrity',
      label: 'Financial Operational Integrity', 
      icon: DollarSign,
      desc: 'Review ledger trends, subscription recurring balances, debit/credit leak risks, and pricing slabs.',
      promptText: 'Audit the financial transaction log ledger. Review credit/debit balances, list high-revenue collections, highlight operational co-location costs, and evaluate subscription pricing slabs for optimal yield.'
    },
  ];

  // 1. CALCULATE HIGH-QUALITY METRICS FROM LIVE STATE
  const stats = useMemo(() => {
    const totalLogs = auditLogs.length;
    const successLogs = auditLogs.filter((l: AuditLog) => l.status === 'Success').length;
    const warningLogs = auditLogs.filter((l: AuditLog) => l.status === 'Warning').length;
    const failedLogs = auditLogs.filter((l: AuditLog) => l.status === 'Failed').length;
    const successRate = totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(1) : '100.0';

    // Actors logs count
    const actorCountsMap: Record<string, number> = {};
    auditLogs.forEach((l: AuditLog) => {
      actorCountsMap[l.actor] = (actorCountsMap[l.actor] || 0) + 1;
    });
    const staffActivityData = Object.entries(actorCountsMap).map(([name, count]) => ({
      name,
      count
    }));

    // Vendor Status counts
    const activeVendors = vendors.filter((v: Vendor) => v.status === 'Active').length;
    const pendingVendors = vendors.filter((v: Vendor) => v.status === 'Pending Verification').length;
    const suspendedVendors = vendors.filter((v: Vendor) => v.status === 'Suspended').length;

    // Financial calculations
    let credits = 0;
    let debits = 0;
    financeRecords.forEach((f: FinanceRecord) => {
      if (f.type === 'Credit') credits += f.amount;
      else if (f.type === 'Debit') debits += f.amount;
    });

    return {
      totalLogs,
      successLogs,
      warningLogs,
      failedLogs,
      successRate,
      staffActivityData,
      vendorStats: [
        { name: 'Active', value: activeVendors, color: '#10B981' },
        { name: 'Pending Verification', value: pendingVendors, color: '#F59E0B' },
        { name: 'Suspended', value: suspendedVendors, color: '#EF4444' }
      ],
      finance: {
        credits,
        debits,
        net: credits - debits
      },
      logStatusData: [
        { name: 'Success', value: successLogs, color: '#FF5A00' },
        { name: 'Warning', value: warningLogs, color: '#F59E0B' },
        { name: 'Failed', value: failedLogs, color: '#EF4444' }
      ]
    };
  }, [auditLogs, vendors, financeRecords]);

  // Handle AI analysis execution
  const executeAnalysis = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setReport(null);
    setPrompt(userPrompt);

    // Simulate progressive analytical stages for excellent user feedback
    const stages = [
      'Initializing iTred Log Indexers...',
      'Mapping Active Staff Security Directory...',
      'Collecting Live Vendor Compliance Metrics...',
      'Synthesizing Financial Ledger Balances...',
      'Engaging Google Gemini AI models...',
      'Formatting Strategic Ecosystem Dashboard Reports...'
    ];

    let currentStage = 0;
    setLoadingStatus(stages[0]);

    const interval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setLoadingStatus(stages[currentStage]);
      }
    }, 900);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          context: {
            currentAdmin,
            currentCompany,
            auditLogs,
            vendors,
            financeRecords,
            activationRequests,
            rpnAgents,
            systemConfig
          }
        })
      });

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok) {
        if (data.missingApiKey) {
          throw new Error('GEMINI_API_KEY is missing. Please add it in the Secrets panel in Settings.');
        }
        throw new Error(data.error || 'Server returned an error during analysis.');
      }

      setReport(data.text);

      // Recursive feedback loop: Log the analysis in the system audit logs!
      addLogAndNotify(
        currentAdmin.name,
        'AI_SECURITY_ANALYST',
        `Prompt: ${userPrompt.substring(0, 32)}...`,
        'Success',
        'success',
        'AI Diagnostics Completed',
        `AI successfully audited logs for console, staff, and vendors.`
      );

    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred during analysis.');
      addLogAndNotify(
        currentAdmin.name,
        'AI_SECURITY_ANALYST',
        'Failed AI Audit Request',
        'Failed',
        'alert',
        'AI Analysis Failed',
        err.message || 'Error occurred communicating with GenAI pipeline.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai_analyst_tab_container" className="space-y-6 font-mono text-xs text-[#1A1A1A]">
      {/* Top Section / Header */}
      <div className="border-b border-[#D1D1CF] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF5A00]" />
            AI Analyst & Dashboard Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            RECURSIVE SECURITY AUDITS & COGNITIVE ANALYTICS ENGINE
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex border border-[#D1D1CF] bg-white p-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 uppercase font-sans font-bold text-[10px] tracking-wider transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#1A1A1A] text-white'
                : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4F4F1]'
            }`}
          >
            Visual Dashboards
          </button>
          <button
            onClick={() => setActiveTab('analyst')}
            className={`px-3 py-1.5 uppercase font-sans font-bold text-[10px] tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analyst'
                ? 'bg-[#1A1A1A] text-white'
                : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4F4F1]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#FF5A00]" />
            AI Security Advisor
          </button>
        </div>
      </div>

      {/* VIEW A: VISUAL DASHBOARD INDEX */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Quick AI Diagnostics Banner */}
          <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-[#FF5A00]/5 -skew-x-12" />
            <div className="space-y-2 max-w-2xl font-mono">
              <div className="flex items-center space-x-2 text-[#FF5A00] font-black tracking-widest text-[10px] uppercase">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>COGNITIVE LOG DECONVOLUTION ENGINE</span>
              </div>
              <h2 className="text-base font-black font-sans uppercase tracking-tight">
                Audit Your Logged Activities Instantly With Gemini AI
              </h2>
              <p className="text-xs font-sans text-gray-500 leading-relaxed">
                Analyze console security profiles, staff action logs, compliance verifications, and financial ledger balances with the integrated Gemini AI. Detect hidden threats, verify operational constraints, and export custom reports.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('analyst')}
              className="bg-[#FF5A00] hover:bg-black text-white px-5 py-3 font-sans font-black uppercase tracking-wider transition-all text-xs cursor-pointer shadow-md"
            >
              LAUNCH AI SECURITY ADVISOR →
            </button>
          </div>

          {/* KPI Mini-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col justify-between">
              <div className="text-[10px] text-gray-400 uppercase font-bold">LOGS VOLUME INDEX</div>
              <div className="text-2xl font-black text-[#1A1A1A] font-sans mt-2 flex items-baseline gap-2">
                {stats.totalLogs}
                <span className="text-xs font-mono text-gray-500 font-normal">SIGNALS</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 font-mono border-t border-[#F4F4F1] pt-1">
                SEALED AUDIT RECORDS
              </div>
            </div>

            <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col justify-between">
              <div className="text-[10px] text-gray-400 uppercase font-bold">CONSOLE STABILITY RATE</div>
              <div className="text-2xl font-black text-[#FF5A00] font-sans mt-2">
                {stats.successRate}%
              </div>
              <div className="text-[10px] text-gray-500 mt-2 font-mono border-t border-[#F4F4F1] pt-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-[#FF5A00] rounded-full animate-pulse" /> {stats.successLogs} SUCCESSFUL COMMANDS
              </div>
            </div>

            <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col justify-between">
              <div className="text-[10px] text-gray-400 uppercase font-bold">INCIDENTS ALERTS</div>
              <div className="text-2xl font-black text-red-600 font-sans mt-2 flex items-baseline gap-2">
                {stats.warningLogs + stats.failedLogs}
                <span className="text-xs font-mono text-gray-500 font-normal">ANOMALIES</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 font-mono border-t border-[#F4F4F1] pt-1 text-red-500">
                {stats.failedLogs} FAILED EXECUTIONS
              </div>
            </div>

            <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col justify-between">
              <div className="text-[10px] text-gray-400 uppercase font-bold">FINANCIAL NET YIELD</div>
              <div className="text-2xl font-black text-green-600 font-sans mt-2">
                ${stats.finance.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-gray-500 mt-2 font-mono border-t border-[#F4F4F1] pt-1">
                REVENUE MINUS DEBITS
              </div>
            </div>
          </div>

          {/* Interactive Dynamic Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Console Stability (Log Status Breakdown) */}
            <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col h-80">
              <div className="border-b border-[#D1D1CF] pb-2 mb-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-xs">Console Signal Health Distribution</span>
                <span className="text-[10px] text-gray-400">REAL-TIME TELEMETRY</span>
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.logStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.logStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ fontFamily: 'monospace', fontSize: '10px', backgroundColor: '#F4F4F1', border: '1px solid #D1D1CF' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconSize={10} 
                      formatter={(value) => <span className="text-[10px] uppercase font-bold text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Staff Activity Metrics */}
            <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col h-80">
              <div className="border-b border-[#D1D1CF] pb-2 mb-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-xs">Staff Command Action Index</span>
                <span className="text-[10px] text-gray-400">OPERATIONAL LOADS</span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.staffActivityData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#EAEAE8" />
                    <XAxis dataKey="name" stroke="#1A1A1A" tick={{ fontFamily: 'monospace', fontSize: '9px' }} />
                    <YAxis stroke="#1A1A1A" tick={{ fontFamily: 'monospace', fontSize: '9px' }} />
                    <Tooltip 
                      contentStyle={{ fontFamily: 'monospace', fontSize: '10px', backgroundColor: '#F4F4F1', border: '1px solid #D1D1CF' }}
                    />
                    <Bar dataKey="count" fill="#1A1A1A" name="Audit Signals Handled">
                      {stats.staffActivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FF5A00' : '#1A1A1A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Vendor Onboarding & Health Status */}
            <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col h-80">
              <div className="border-b border-[#D1D1CF] pb-2 mb-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-xs">Merchant Verification Slabs</span>
                <span className="text-[10px] text-gray-400">COMPLIANCE STATS</span>
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.vendorStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.vendorStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ fontFamily: 'monospace', fontSize: '10px', backgroundColor: '#F4F4F1', border: '1px solid #D1D1CF' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconSize={10} 
                      formatter={(value) => <span className="text-[10px] uppercase font-bold text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Financial Ledger balance Overview */}
            <div className="bg-white border border-[#D1D1CF] p-4 flex flex-col h-80">
              <div className="border-b border-[#D1D1CF] pb-2 mb-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-xs">Financial Transactions ledger breakdown</span>
                <span className="text-[10px] text-gray-400">LEDGER AUDIT</span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Total Credits', value: stats.finance.credits, fill: '#10B981' },
                    { name: 'Total Debits', value: stats.finance.debits, fill: '#EF4444' },
                    { name: 'Net Balance', value: stats.finance.net, fill: '#FF5A00' },
                  ]}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#EAEAE8" />
                    <XAxis dataKey="name" stroke="#1A1A1A" tick={{ fontFamily: 'monospace', fontSize: '9px' }} />
                    <YAxis stroke="#1A1A1A" tick={{ fontFamily: 'monospace', fontSize: '9px' }} />
                    <Tooltip 
                      contentStyle={{ fontFamily: 'monospace', fontSize: '10px', backgroundColor: '#F4F4F1', border: '1px solid #D1D1CF' }}
                    />
                    <Bar dataKey="value" fill="#FF5A00" name="Amount ($)">
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                      <Cell fill="#FF5A00" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: AI security ADVISOR CHAT & ANALYSIS GENERATOR */}
      {activeTab === 'analyst' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Preset Prompts Sidebar: Left Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#D1D1CF] p-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b border-[#D1D1CF] pb-2 mb-3">
                Pre-configured AI Diagnostics
              </h3>
              <p className="text-[10px] text-gray-400 leading-normal mb-4 font-sans">
                Trigger targeted audits powered by Gemini AI analyzing live telemetry logs, staff roles, and merchant status indices.
              </p>

              <div className="space-y-3">
                {PRESET_PROMPTS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => executeAnalysis(preset.promptText)}
                      disabled={loading}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] hover:border-[#FF5A00] p-3 text-left transition-all rounded-none uppercase font-mono disabled:opacity-50 cursor-pointer group hover:bg-white"
                    >
                      <div className="flex items-center space-x-2 text-[#1A1A1A] group-hover:text-[#FF5A00]">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="font-bold text-[10px] tracking-wide">{preset.label}</span>
                      </div>
                      <div className="text-[9px] text-gray-500 lowercase normal-case tracking-normal mt-1 leading-normal font-sans font-light">
                        {preset.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Data Context Stats card */}
            <div className="bg-white border border-[#D1D1CF] p-4 space-y-3 font-mono text-[10px]">
              <h3 className="font-black uppercase tracking-wider text-gray-500 border-b border-[#D1D1CF] pb-2">
                Live Data Context Payload
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Audit Records:</span>
                <span className="font-bold">{auditLogs.length} events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Staff Profiles:</span>
                <span className="font-bold">3 operators</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Vendor Entities:</span>
                <span className="font-bold">{vendors.length} merchants</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Edge Routing nodes:</span>
                <span className="font-bold">{rpnAgents.length} RPNs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Ledger txns:</span>
                <span className="font-bold">{financeRecords.length} postings</span>
              </div>
              <div className="text-[8px] bg-[#F4F4F1] text-gray-500 p-2 leading-normal">
                NOTE: This local simulation state is fed directly into the Gemini model context, so any logs added, status modifications, or licensing actions you make in other parts of the console will immediately influence the AI's answers!
              </div>
            </div>
          </div>

          {/* Chat Console: Right Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Input Form Box */}
            <div className="bg-[#1A1A1A] text-white p-6 border-4 border-[#1A1A1A] shadow-md relative">
              <div className="absolute right-4 top-4 text-[#FF5A00] font-bold text-[10px] tracking-widest flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                <span>ONLINE PORT 3000 API GATEWAY</span>
              </div>
              
              <h2 className="text-xs font-black uppercase tracking-widest text-[#FF5A00] mb-2 font-mono">
                Ask Custom Systems Security Questions
              </h2>
              <p className="text-[10px] text-gray-400 mb-4 leading-normal font-sans font-light">
                Inspect a staff member, probe a vendor's suspicious transactions, query system latency indices, or ask the AI to model compliance workflows.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeAnalysis(prompt);
                }}
                className="flex border border-[#3A3A3A] bg-[#2A2A2A] overflow-hidden"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Audit S. Kaelis actions or check Suspended vendor vulnerability..."
                  className="flex-1 bg-transparent px-4 py-3 text-xs text-white focus:outline-none placeholder-gray-500 font-mono"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="bg-[#FF5A00] hover:bg-white text-white hover:text-[#1A1A1A] px-5 transition-all uppercase font-bold text-xs tracking-wider cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Results Canvas */}
            <div className="bg-white border border-[#D1D1CF] min-h-[400px] p-6 flex flex-col justify-between relative shadow-sm">
              <div className="border-b border-[#D1D1CF] pb-3 mb-4 flex justify-between items-center text-gray-400 text-[10px]">
                <span className="uppercase font-bold">Generated AI Operational security Audit</span>
                <span className="uppercase">Index Ref: SGN-SEC-{Math.floor(1000 + Math.random() * 9000)}</span>
              </div>

              {/* Loader with custom states */}
              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-[#F4F4F1] border-t-[#FF5A00] rounded-full animate-spin" />
                    <Sparkles className="w-5 h-5 text-[#FF5A00] absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black uppercase text-[#1A1A1A] tracking-wider">AI ANALYST COMPUTING</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-1 animate-pulse">{loadingStatus}</div>
                  </div>
                </div>
              )}

              {/* Error Warning */}
              {errorMsg && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-3 bg-red-50 border border-red-200 p-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div className="text-red-700 font-bold uppercase tracking-wider text-xs">Analysis Failed</div>
                  <div className="text-red-600 font-sans text-xs max-w-md">{errorMsg}</div>
                  <div className="text-[10px] text-gray-500 max-w-sm mt-2">
                    Make sure your API secret keys are correctly configured in **Settings &gt; Secrets** of the AI Studio workspace.
                  </div>
                </div>
              )}

              {/* Report Display */}
              {!loading && !errorMsg && report && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex-1 space-y-4 pb-4"
                >
                  <div className="bg-[#F4F4F1] p-3 border-l-4 border-[#1A1A1A] text-[10px] text-gray-600 font-sans leading-relaxed">
                    <div className="font-bold uppercase tracking-widest text-[#1A1A1A] mb-1 font-mono text-xs">Audit Parameters:</div>
                    <strong>Audited Operator:</strong> {currentAdmin.name} ({currentAdmin.role}) <br />
                    <strong>Timestamp:</strong> {new Date().toLocaleString()} <br />
                    <strong>Live Input Scope:</strong> {auditLogs.length} logs, {vendors.length} vendors, {financeRecords.length} ledger logs.
                  </div>
                  
                  <div className="prose max-w-none border border-[#EAEAE8] p-4 bg-white overflow-y-auto max-h-[500px]">
                    <SimpleMarkdown text={report} />
                  </div>
                </motion.div>
              )}

              {/* Initial / Welcome State */}
              {!loading && !errorMsg && !report && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 text-gray-400">
                  <div className="w-14 h-14 bg-[#F4F4F1] border border-[#D1D1CF] rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#FF5A00]" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase text-[#1A1A1A] tracking-wider">Awaiting Diagnostics Trigger</div>
                    <p className="text-[10px] text-gray-500 font-sans max-w-md">
                      Type a custom security question in the terminal above, or click one of our preset quick-audit triggers on the left margin to generate a comprehensive AI operational advisory report.
                    </p>
                  </div>
                </div>
              )}

              {/* Disclaimer / Sealed Stamp */}
              <div className="border-t border-[#D1D1CF] pt-3 mt-4 flex justify-between items-center text-[9px] text-gray-400">
                <span>SYSTEM STATUS: COMPLIANT WITH AUDITING GUIDES</span>
                <span className="text-[#FF5A00] font-bold">SEALED ANALYTICAL RECORD</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
