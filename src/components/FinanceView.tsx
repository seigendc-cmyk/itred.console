import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../App';
import { FinanceRecord, Vendor, Plan } from '../types';
import { 
  Coins, 
  TrendingUp, 
  Plus, 
  Search, 
  FileText, 
  Check, 
  Calendar, 
  Sliders, 
  Clock, 
  X, 
  AlertCircle, 
  ArrowRight, 
  DollarSign, 
  User, 
  Layers, 
  Briefcase, 
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Building,
  Mail,
  Phone,
  MapPin,
  Activity,
  ClipboardList
} from 'lucide-react';

interface CommissionRecord {
  id: string;
  agentName: string;
  vendorName: string;
  commissionModel: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Withheld';
  dueDate: string;
  paidDate?: string;
}

const DEFAULT_COMMISSIONS: CommissionRecord[] = [
  { id: 'COM-001', agentName: 'Frankfurt-Alpha Agent', vendorName: 'AtomiCo QuickShop', commissionModel: 'Hybrid', amount: 350, status: 'Paid', dueDate: '2026-06-30', paidDate: '2026-06-28' },
  { id: 'COM-002', agentName: 'Virginia-Delta Agent', vendorName: 'Zephyr Fashion House', commissionModel: 'Per Vendor Commission', amount: 500, status: 'Approved', dueDate: '2026-07-15' },
  { id: 'COM-003', agentName: 'Frankfurt-Alpha Agent', vendorName: 'BioFuel Station S-8', commissionModel: 'Performance Bonus', amount: 1200, status: 'Pending', dueDate: '2026-07-31' },
  { id: 'COM-004', agentName: 'Virginia-Delta Agent', vendorName: 'Vanguard Outpost Ltd', commissionModel: 'Fixed Allowance', amount: 200, status: 'Withheld', dueDate: '2026-07-10' }
];

const DEFAULT_FINANCE_RECORDS: FinanceRecord[] = [
  { id: 'TXN-001', vendorName: 'AtomiCo QuickShop', description: 'Starter POS Plan Monthly subscription', amount: 49, type: 'Credit', date: '2026-07-01', refNo: 'REF-SGN-8822A', recordType: 'Subscription', paymentStatus: 'Paid', linkedPlanId: 'PLN-POS-STARTER', linkedLicenseId: 'POS-LIC-3310' },
  { id: 'TXN-002', vendorName: 'Zephyr Fashion House', description: 'Enterprise Commerce Plan Annual subscription', amount: 899, type: 'Credit', date: '2026-06-29', refNo: 'REF-SGN-7751B', recordType: 'Subscription', paymentStatus: 'Paid', linkedPlanId: 'PLN-ENT-COMMERCE', linkedLicenseId: 'POS-LIC-7509' },
  { id: 'TXN-003', vendorName: 'KronoMart Hardware', description: 'Starter POS Plan subscription - Overdue invoice', amount: 49, type: 'Credit', date: '2026-06-15', refNo: 'REF-SGN-0081C', recordType: 'Subscription', paymentStatus: 'Overdue', linkedPlanId: 'PLN-POS-STARTER', linkedLicenseId: 'POS-LIC-1142' },
  { id: 'TXN-004', vendorName: 'Vanguard Outpost Ltd', description: 'Hybrid Core plan - Pending invoice validation', amount: 299, type: 'Credit', date: '2026-07-02', refNo: 'REF-SGN-449FD', recordType: 'Subscription', paymentStatus: 'Pending', linkedPlanId: 'PLN-POS-BUSPLUS', linkedLicenseId: 'POS-LIC-9904' },
  { id: 'TXN-005', vendorName: 'Simulated Merchant', description: 'WhatsApp Tunnel Bundle Capacity purchase', amount: 20, type: 'Credit', date: '2026-07-01', refNo: 'REF-SGN-CAP-01', recordType: 'Capacity Add-on', paymentStatus: 'Paid' },
  { id: 'TXN-006', vendorName: 'Frankfurt-Alpha Agent', description: 'RPN Agent Commission allocation payout', amount: 350, type: 'Debit', date: '2026-06-28', refNo: 'REF-RPN-COM-01', recordType: 'Commission', paymentStatus: 'Paid' }
];

export default function FinanceView() {
  const { 
    financeRecords, 
    setFinanceRecords, 
    vendors, 
    setVendors, 
    posLicenses, 
    setPosLicenses, 
    plans,
    activeStaffSession, 
    onAddWorkspaceAuditEvent, 
    onAddWorkspaceActivity,
    onAddWorkspaceNotification,
    workflows,
    onAddWorkflow,
    onUpdateWorkflow
  } = useLifecycle();

  // Load finance records from lifecycle or seed them
  const records = useMemo(() => {
    if (!financeRecords || financeRecords.length === 0) {
      // seed and save
      setFinanceRecords(DEFAULT_FINANCE_RECORDS);
      localStorage.setItem('sgn_finance_records', JSON.stringify(DEFAULT_FINANCE_RECORDS));
      return DEFAULT_FINANCE_RECORDS;
    }
    return financeRecords;
  }, [financeRecords, setFinanceRecords]);

  // Load commissions state
  const [commissions, setCommissions] = useState<CommissionRecord[]>(() => {
    const raw = localStorage.getItem('sgn_rpn_commissions');
    if (!raw) return DEFAULT_COMMISSIONS;
    try { return JSON.parse(raw); } catch { return DEFAULT_COMMISSIONS; }
  });

  const saveCommissions = (newComms: CommissionRecord[]) => {
    setCommissions(newComms);
    localStorage.setItem('sgn_rpn_commissions', JSON.stringify(newComms));
  };

  // Tab navigation: 'dashboard' | 'ledger' | 'collections' | 'commissions' | 'analytics'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'collections' | 'commissions' | 'analytics'>('dashboard');

  // Search query & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Selected Record details
  const [selectedRecordId, setSelectedRecordId] = useState<string>(() => {
    return records[0]?.id || '';
  });

  const selectedRecord = useMemo(() => {
    return records.find(r => r.id === selectedRecordId) || null;
  }, [records, selectedRecordId]);

  // Modals visibility
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);

  // Form Fields - Add Record
  const [formVendorName, setFormVendorName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState(0);
  const [formType, setFormType] = useState<'Credit' | 'Debit'>('Credit');
  const [formRecordType, setFormRecordType] = useState<'Subscription' | 'Renewal' | 'Capacity Add-on' | 'Business Module' | 'Adjustment'>('Subscription');
  const [formStatusField, setFormStatusField] = useState<'Pending' | 'Paid' | 'Overdue'>('Pending');

  // 1. Dashboard calculations
  const dashboardMetrics = useMemo(() => {
    const totalRev = records
      .filter(r => r.type === 'Credit' && r.paymentStatus === 'Paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // MRR
    const activeVendors = vendors.filter(v => v.status === 'Active');
    const mrr = activeVendors.reduce((acc, curr) => {
      const plan = plans.find(p => p.id === curr.assignedPlanId);
      return acc + (plan?.price || 0);
    }, 0);

    // Collections this month
    const currentMonthStr = new Date().toISOString().split('-').slice(0,2).join('-');
    const collectionsThisMonth = records
      .filter(r => r.paymentStatus === 'Paid' && r.type === 'Credit' && r.date?.startsWith(currentMonthStr))
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Outstanding renewals
    const outstandingRenewals = records
      .filter(r => r.paymentStatus === 'Overdue' || r.paymentStatus === 'Pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Commission Payable
    const commissionPayable = commissions
      .filter(c => c.status === 'Approved' || c.status === 'Pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Suspended for non-payment
    const suspendedForNonPayment = vendors.filter(v => v.status === 'Suspended').length;

    // Demo conversions count
    const demoToPaidConversions = vendors.filter(v => v.assignedPlanId !== 'VENDOR_DEMO' && v.joinedDate && v.licenseKey).length;

    // ARPU
    const activeVendorsCount = vendors.filter(v => v.status === 'Active').length;
    const avgRevPerVendor = activeVendorsCount > 0 ? Math.round(totalRev / activeVendorsCount) : 0;

    return { totalRev, mrr, collectionsThisMonth, outstandingRenewals, commissionPayable, suspendedForNonPayment, demoToPaidConversions, avgRevPerVendor };
  }, [records, vendors, plans, commissions]);

  // 2. Filtered ledger records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        r.id.toLowerCase().includes(q) ||
        (r.vendorName && r.vendorName.toLowerCase().includes(q)) ||
        r.refNo.toLowerCase().includes(q) ||
        (r.paymentStatus && r.paymentStatus.toLowerCase().includes(q));

      const matchType = filterType === 'all' || r.recordType === filterType;
      const matchStatus = filterStatus === 'all' || r.paymentStatus === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [records, searchQuery, filterType, filterStatus]);

  // 3. Collections queues sorting
  const collectionsQueue = useMemo(() => {
    const list = vendors.map(v => {
      const lic = posLicenses.find(l => l.vendorName === v.name);
      const subRecord = records.find(r => r.vendorName === v.name && r.recordType === 'Subscription');

      const expDate = lic ? new Date(lic.expiryDate) : new Date();
      const diffTime = expDate.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        vendor: v,
        planName: v.assignedPlanName || 'No Plan',
        amount: subRecord?.amount || 49,
        dueDate: lic?.expiryDate || '—',
        daysOverdue: diffDays < 0 ? Math.abs(diffDays) : 0,
        daysRemaining: diffDays,
        contact: v.email || '—'
      };
    });

    const dueToday = list.filter(item => item.daysRemaining === 0 && item.vendor.status === 'Active');
    const dueThisWeek = list.filter(item => item.daysRemaining > 0 && item.daysRemaining <= 7 && item.vendor.status === 'Active');
    const overdue = list.filter(item => item.daysRemaining < 0 && item.vendor.status === 'Active');
    const grace = list.filter(item => item.daysRemaining < 0 && item.daysRemaining >= -7 && item.vendor.status === 'Active');
    const suspended = list.filter(item => item.vendor.status === 'Suspended');

    return { dueToday, dueThisWeek, overdue, grace, suspended };
  }, [vendors, posLicenses, records]);

  // 4. Analytics breakdown
  const planRevenueBreakdown = useMemo(() => {
    const data: Record<string, number> = { Starter: 0, Growth: 0, Professional: 0, 'Business Plus': 0, Enterprise: 0 };
    records.forEach(r => {
      if (r.paymentStatus === 'Paid' && r.recordType === 'Subscription' && r.description) {
        if (r.description.includes('Starter')) data['Starter'] += r.amount;
        else if (r.description.includes('Growth')) data['Growth'] += r.amount;
        else if (r.description.includes('Professional')) data['Professional'] += r.amount;
        else if (r.description.includes('Business Plus')) data['Business Plus'] += r.amount;
        else if (r.description.includes('Enterprise')) data['Enterprise'] += r.amount;
      }
    });
    return data;
  }, [records]);

  // 5. Activity logs computed from audit logs
  const financeActivities = useMemo(() => {
    const finActions = [
      'REVENUE_RECORD_CREATE',
      'REVENUE_MARK_PAID',
      'REVENUE_MARK_OVERDUE',
      'REVENUE_GRACE_EXTEND',
      'POS_LICENSE_SUSPEND',
      'APPROVE_COMMISSION',
      'MARK_COMMISSION_PAID'
    ];
    return workspaceAuditEvents.filter(e => finActions.includes(e.action)).slice(0, 15);
  }, [workspaceAuditEvents]);

  // Operations triggers

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendorName || !formDesc) return;

    const newId = `TXN-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: FinanceRecord = {
      id: newId,
      vendorName: formVendorName,
      description: formDesc,
      amount: formAmount,
      type: formType,
      date: new Date().toISOString().split('T')[0],
      refNo: `REF-SGN-${Math.floor(1000 + Math.random() * 9000)}`,
      recordType: formRecordType,
      paymentStatus: formStatusField,
      currency: 'USD'
    };

    const updated = [newRecord, ...records];
    setFinanceRecords(updated);
    localStorage.setItem('sgn_finance_records', JSON.stringify(updated));

    // Register active workflow for payment review
    onAddWorkflow({
      workflowType: 'pos_license',
      title: `Payment Review: ${formVendorName}`,
      description: `Recorded new transaction of $${formAmount} USD.`,
      status: 'pending',
      requesterId: activeStaffSession?.staffId || 'system',
      requesterName: activeStaffSession?.fullName || 'System Operator',
      targetId: newId,
      targetType: 'finance',
      currentStep: 1,
      totalSteps: 2
    });

    onAddWorkspaceAuditEvent({
      workspaceId: 'finance',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'REVENUE_RECORD_CREATE',
      targetType: 'finance',
      targetId: newId,
      result: 'success',
      message: `Logged new finance ledger record ${newId} for merchant ${formVendorName}.`
    });

    onAddWorkspaceActivity({
      workspaceId: 'finance',
      type: 'finance',
      severity: 'info',
      title: 'Ledger Record Logged',
      message: `Recorded invoice of $${formAmount} for ${formVendorName}.`,
      actorName: activeStaffSession?.fullName || 'System'
    });

    setIsAddRecordOpen(false);
  };

  const handleMarkPaid = (recId: string) => {
    const updated = records.map(r => r.id === recId ? { ...r, paymentStatus: 'Paid' as const } : r);
    setFinanceRecords(updated);
    localStorage.setItem('sgn_finance_records', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'finance',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'REVENUE_MARK_PAID',
      targetType: 'finance',
      targetId: recId,
      result: 'success',
      message: `Marked invoice record ${recId} status to Paid.`
    });

    onAddWorkspaceNotification({
      title: 'Payment Completed',
      message: `Invoice payment marked completed for record ${recId}.`,
      type: 'finance',
      priority: 'normal',
      targetPath: '/finance',
      workspaceId: 'finance'
    });

    alert('Ledger status set to Paid.');
  };

  const handleMarkOverdue = (recId: string) => {
    const updated = records.map(r => r.id === recId ? { ...r, paymentStatus: 'Overdue' as const } : r);
    setFinanceRecords(updated);
    localStorage.setItem('sgn_finance_records', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'finance',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'REVENUE_MARK_OVERDUE',
      targetType: 'finance',
      targetId: recId,
      result: 'success',
      message: `Marked invoice record ${recId} status to Overdue.`
    });

    onAddWorkspaceNotification({
      title: 'Payment Overdue Alert',
      message: `Invoice record ${recId} marked overdue by finance controllers.`,
      type: 'finance',
      priority: 'high',
      targetPath: '/finance',
      workspaceId: 'finance'
    });

    alert('Ledger status set to Overdue.');
  };

  const handleCancelRecord = (recId: string) => {
    const updated = records.map(r => r.id === recId ? { ...r, paymentStatus: 'Cancelled' as const } : r);
    setFinanceRecords(updated);
    localStorage.setItem('sgn_finance_records', JSON.stringify(updated));

    alert('Invoice cancelled.');
  };

  const handleExtendGracePeriod = (vendorName: string) => {
    onAddWorkspaceAuditEvent({
      workspaceId: 'finance',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'REVENUE_GRACE_EXTEND',
      targetType: 'vendor',
      targetId: vendorName,
      result: 'success',
      message: `Extended subscription grace period for merchant ${vendorName}.`
    });

    alert('Grace period extended by +7 days.');
  };

  const handleSuspendForNonPayment = (vendorName: string) => {
    const vendor = vendors.find(v => v.name === vendorName);
    if (!vendor) return;

    const updated = vendors.map(v => v.id === vendor.id ? { ...v, status: 'Suspended' as const } : v);
    setVendors(updated);
    localStorage.setItem('sgn_vendors', JSON.stringify(updated));

    onAddWorkspaceAuditEvent({
      workspaceId: 'finance',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'POS_LICENSE_SUSPEND',
      targetType: 'vendor',
      targetId: vendor.id,
      result: 'success',
      message: `Suspended operations clearance for merchant ${vendorName} due to non-payment of subscription dues.`
    });

    onAddWorkspaceNotification({
      title: 'License Suspended',
      message: `Merchant ${vendorName} suspended for non-payment.`,
      type: 'security',
      priority: 'high',
      targetPath: '/finance',
      workspaceId: 'finance'
    });

    alert('Merchant terminal access suspended.');
  };

  const handleApproveCommission = (comId: string) => {
    const updated = commissions.map(c => c.id === comId ? { ...c, status: 'Approved' as const } : c);
    saveCommissions(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'finance',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'APPROVE_COMMISSION',
      targetType: 'commission',
      targetId: comId,
      result: 'success',
      message: `Approved payout allocation commission invoice ${comId}.`
    });

    alert('Commission payout approved.');
  };

  const handlePayCommission = (comId: string) => {
    const updated = commissions.map(c => c.id === comId ? { ...c, status: 'Paid' as const, paidDate: new Date().toISOString().split('T')[0] } : c);
    saveCommissions(updated);

    onAddWorkspaceAuditEvent({
      workspaceId: 'finance',
      actorStaffId: activeStaffSession?.staffId || 'system',
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId || 'desk_sysadmin',
      action: 'MARK_COMMISSION_PAID',
      targetType: 'commission',
      targetId: comId,
      result: 'success',
      message: `Marked commission invoice ${comId} as paid.`
    });

    alert('Commission payout completed.');
  };

  return (
    <div className="space-y-6 select-none font-mono text-[#1A1A1A]">
      
      {/* Header Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#D1D1CF] pb-4">
        <div className="text-left">
          <h1 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] font-sans">
            Financial clearance Workspace
          </h1>
          <p className="text-[10px] text-gray-500 font-medium font-sans">
            Corporate revenue ledger, billing collections queues, and acquisition commissions payouts interface.
          </p>
        </div>

        <div className="flex border-2 border-[#1A1A1A] bg-white text-[9px] font-black uppercase rounded-none">
          {(['dashboard', 'ledger', 'collections', 'commissions', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 cursor-pointer transition-all border-r border-[#1A1A1A] last:border-none ${
                activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F4F4F1] text-gray-700 bg-transparent'
              }`}
            >
              {tab === 'ledger' ? 'Revenue Ledger' : tab === 'commissions' ? 'Commissions Payout' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* FINANCE DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5A00]" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Total Revenue</span>
          <span className="text-xl font-sans font-black text-[#1A1A1A] block mt-1">$${dashboardMetrics.totalRev.toLocaleString()}</span>
          <span className="text-[7px] text-gray-500 font-medium block">All paid credits</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Monthly Recurring Revenue (MRR)</span>
          <span className="text-xl font-sans font-black text-gray-900 block mt-1">$${dashboardMetrics.mrr.toLocaleString()}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Current billing run rate</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Collections (This Month)</span>
          <span className="text-xl font-sans font-black text-[#FF5A00] block mt-1">$${dashboardMetrics.collectionsThisMonth.toLocaleString()}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Received payments</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Outstanding Renewals</span>
          <span className="text-xl font-sans font-black text-red-650 block mt-1">$${dashboardMetrics.outstandingRenewals.toLocaleString()}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Overdue subscription sums</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Commissions Payable</span>
          <span className="text-xl font-sans font-black text-gray-900 block mt-1">$${dashboardMetrics.commissionPayable.toLocaleString()}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Acquisition fee payouts</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Suspended (Non-Payment)</span>
          <span className="text-xl font-sans font-black text-red-600 block mt-1">{dashboardMetrics.suspendedForNonPayment}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Blocked terminal clearances</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">Demo conversions</span>
          <span className="text-xl font-sans font-black text-emerald-800 block mt-1">{dashboardMetrics.demoToPaidConversions}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Converted sandbox accounts</span>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
          <span className="text-[8px] text-gray-400 block font-black uppercase">ARPU</span>
          <span className="text-xl font-sans font-black text-gray-900 block mt-1">$${dashboardMetrics.avgRevPerVendor}</span>
          <span className="text-[7px] text-gray-500 font-medium block">Average revenue per vendor</span>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE COMMERCIAL activity feed & timeline */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-2 bg-white border-2 border-[#1A1A1A] text-left p-4 space-y-4 shadow-sm">
            <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
              <span>Corporate Financial Activity feed</span>
            </div>
            
            <div className="relative border-l border-[#D1D1CF] pl-4 ml-2 space-y-4 text-left font-sans">
              {financeActivities.length === 0 ? (
                <div className="text-[9px] text-gray-400 italic uppercase font-mono font-bold">No financial logs recorded in audit databases.</div>
              ) : (
                financeActivities.map(e => (
                  <div key={e.auditId} className="relative">
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 bg-white border-[#FF5A00] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-full" />
                    </div>
                    <div className="text-[9px]">
                      <div className="font-mono font-black uppercase tracking-wider text-gray-800 flex justify-between">
                        <span>{e.action}</span>
                        <span className="text-[7.5px] text-gray-400 font-normal">[{new Date(e.createdAt).toLocaleTimeString()}]</span>
                      </div>
                      <div className="text-gray-500 font-medium text-[8px] leading-relaxed mt-0.5 font-sans normal-case">{e.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border-2 border-[#1A1A1A] p-4 text-left space-y-3 shadow-sm">
            <div className="border-b border-[#D1D1CF] pb-2 text-[#FF5A00] font-black uppercase text-[10px]">
              <span>Audit System Status</span>
            </div>
            <p className="text-[10px] text-gray-500 normal-case font-sans font-medium">
              Finance telemetry is cryptographically synchronized with the system-wide audit database. All invoice adjustments are backed by physical storage configurations.
            </p>
            <div className="pt-2 text-[9px] font-black uppercase space-y-2">
              <button onClick={() => setActiveTab('ledger')} className="w-full bg-[#F4F4F1] hover:bg-stone-200 border border-stone-250 p-2.5 flex justify-between cursor-pointer rounded-none text-left">
                <span>View Revenue Ledger</span>
                <span>&rarr;</span>
              </button>
              <button onClick={() => setActiveTab('collections')} className="w-full bg-[#F4F4F1] hover:bg-stone-200 border border-stone-250 p-2.5 flex justify-between cursor-pointer rounded-none text-left">
                <span>Billing Collections Queues</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: REVENUE LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4 text-left">
          
          {/* Ledger Search & Filters */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ledger by transaction reference, vendor name..."
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 pl-9 text-xs focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase tracking-wider"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white border-2 border-[#1A1A1A] p-1.5 text-[9px] font-black focus:outline-none uppercase cursor-pointer rounded-none"
              >
                <option value="all">All Types</option>
                <option value="Subscription">Subscription</option>
                <option value="Renewal">Renewal</option>
                <option value="Capacity Add-on">Capacity Add-on</option>
                <option value="Business Module">Business Module</option>
                <option value="Adjustment">Adjustment</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border-2 border-[#1A1A1A] p-1.5 text-[9px] font-black focus:outline-none uppercase cursor-pointer rounded-none"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border-2 border-[#1A1A1A] overflow-hidden">
            
            <div className="bg-[#FAF9F6] border-b border-[#1A1A1A] p-2.5 flex justify-between items-center text-[9px] font-black uppercase text-gray-500">
              <span>Corporate Revenue Ledger list</span>
              <button
                onClick={() => {
                  setFormVendorName(vendors[0]?.name || '');
                  setFormDesc('');
                  setFormAmount(49);
                  setFormType('Credit');
                  setFormRecordType('Subscription');
                  setFormStatusField('Pending');
                  setIsAddRecordOpen(true);
                }}
                className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
              >
                Add Revenue Record
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[9px] font-mono">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#1A1A1A] uppercase font-bold text-[8px] tracking-wider text-gray-500">
                    <th className="p-3 border-r border-gray-200">Record ID</th>
                    <th className="p-3 border-r border-gray-200">Vendor Merchant</th>
                    <th className="p-3 border-r border-gray-200">Description</th>
                    <th className="p-3 border-r border-gray-200">Amount</th>
                    <th className="p-3 border-r border-gray-200">Type</th>
                    <th className="p-3 border-r border-gray-200">Date</th>
                    <th className="p-3 border-r border-gray-200">Reference No</th>
                    <th className="p-3 border-r border-gray-200">Plan Link</th>
                    <th className="p-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(r => {
                    const isSelected = selectedRecordId === r.id;
                    let badge = 'bg-stone-100 text-stone-850 border-stone-300';
                    if (r.paymentStatus === 'Paid') badge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                    else if (r.paymentStatus === 'Overdue') badge = 'bg-red-50 text-red-800 border-red-300';
                    else if (r.paymentStatus === 'Pending') badge = 'bg-yellow-50 text-yellow-800 border-yellow-300';
                    else if (r.paymentStatus === 'Cancelled') badge = 'bg-black text-white border-black';

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRecordId(r.id)}
                        className={`border-b border-gray-150 hover:bg-[#FAF9F6] transition-colors cursor-pointer ${
                          isSelected ? 'bg-orange-50/40 font-bold' : ''
                        }`}
                      >
                        <td className="p-3 border-r border-gray-200 font-bold text-gray-450">{r.id}</td>
                        <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{r.vendorName || '—'}</td>
                        <td className="p-3 border-r border-gray-200 font-sans text-gray-500 text-[8.5px] leading-relaxed normal-case max-w-[200px] truncate">{r.description}</td>
                        <td className="p-3 border-r border-gray-200 font-bold text-gray-850">$${r.amount}</td>
                        <td className="p-3 border-r border-gray-200 text-[8px] uppercase text-gray-500 font-bold">{r.recordType || 'Subscription'}</td>
                        <td className="p-3 border-r border-gray-200 font-mono">{r.date}</td>
                        <td className="p-3 border-r border-gray-200 font-mono select-all text-[8px]">{r.refNo}</td>
                        <td className="p-3 border-r border-gray-200 font-mono text-[8px] truncate max-w-[100px]">{r.linkedPlanId || '—'}</td>
                        <td className="p-3">
                          <span className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${badge}`}>
                            {r.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Actions panel */}
          {selectedRecord && (
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
              <div className="border-b border-gray-250 pb-2 text-[10px] font-black uppercase text-gray-800">
                Action Console: Ledger row {selectedRecord.id}
              </div>
              <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase">
                {selectedRecord.paymentStatus !== 'Paid' && (
                  <button onClick={() => handleMarkPaid(selectedRecord.id)} className="bg-emerald-50 text-emerald-800 border border-emerald-350 hover:bg-emerald-600 hover:text-white px-3 py-1.5 cursor-pointer rounded-none">Mark Payment Received</button>
                )}
                {selectedRecord.paymentStatus !== 'Overdue' && selectedRecord.paymentStatus !== 'Paid' && (
                  <button onClick={() => handleMarkOverdue(selectedRecord.id)} className="bg-white border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-3 py-1.5 cursor-pointer rounded-none">Flag Overdue Alert</button>
                )}
                {selectedRecord.paymentStatus !== 'Cancelled' && (
                  <button onClick={() => handleCancelRecord(selectedRecord.id)} className="bg-white border border-[#1A1A1A] hover:bg-red-650 hover:text-white px-3 py-1.5 cursor-pointer rounded-none font-bold">Cancel Record</button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: COLLECTIONS CENTRE */}
      {activeTab === 'collections' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Overdue */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
              <div className="border-b border-red-500 pb-2 flex justify-between items-center text-[10px] font-black uppercase text-red-600">
                <span>Payment Overdue</span>
                <span className="bg-red-50 px-1.5 border border-red-300">{collectionsQueue.overdue.length}</span>
              </div>

              <div className="space-y-3">
                {collectionsQueue.overdue.map(item => (
                  <div key={item.vendor.id} className="bg-red-50/20 border border-red-300 p-3 rounded-none text-[8.5px] font-bold text-gray-600 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-gray-900 block font-sans">{item.vendor.name}</span>
                        <span className="text-[7.5px] text-gray-400 uppercase mt-0.5 block">Plan: {item.planName}</span>
                      </div>
                      <span className="text-red-600 font-mono block font-black text-[10.5px]">$${item.amount}</span>
                    </div>
                    
                    <div className="flex gap-1 pt-1 font-mono uppercase text-[7.5px]">
                      <button onClick={() => handleSuspendForNonPayment(item.vendor.name)} className="bg-red-600 text-white px-2 py-0.5 cursor-pointer">Suspend License</button>
                      <button onClick={() => handleExtendGracePeriod(item.vendor.name)} className="bg-white border border-stone-300 px-2 py-0.5 cursor-pointer hover:border-[#1A1A1A]">Extend Grace</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Due This Week */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
              <div className="border-b border-yellow-500 pb-2 flex justify-between items-center text-[10px] font-black uppercase text-yellow-600">
                <span>Due Today & This Week</span>
                <span className="bg-yellow-50 px-1.5 border border-yellow-300">{(collectionsQueue.dueToday.length + collectionsQueue.dueThisWeek.length)}</span>
              </div>

              <div className="space-y-3">
                {collectionsQueue.dueToday.map(item => (
                  <div key={item.vendor.id} className="bg-stone-50 border border-stone-200 p-3 rounded-none text-[8.5px] font-bold text-gray-600 flex justify-between items-center">
                    <div>
                      <span className="text-gray-900 block font-sans">{item.vendor.name}</span>
                      <span className="text-red-500 text-[7px] font-black uppercase block">Due Today!</span>
                    </div>
                    <button onClick={() => handleMarkPaid(item.vendor.id)} className="bg-[#FF5A00] text-white px-2 py-0.5 cursor-pointer uppercase font-mono text-[7px]">Receive Paid</button>
                  </div>
                ))}

                {collectionsQueue.dueThisWeek.map(item => (
                  <div key={item.vendor.id} className="bg-stone-50 border border-stone-200 p-3 rounded-none text-[8.5px] font-bold text-gray-600 flex justify-between items-center">
                    <div>
                      <span className="text-gray-900 block font-sans">{item.vendor.name}</span>
                      <span className="text-gray-400 text-[7px] block mt-0.5">Due in {item.daysRemaining} days</span>
                    </div>
                    <button onClick={() => alert('Reminder alert sent to ' + item.contact)} className="bg-white border border-stone-300 px-2 py-0.5 cursor-pointer uppercase font-mono text-[7px] hover:border-[#1A1A1A]">Send Reminder</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Suspended / non-payment */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4">
              <div className="border-b border-stone-500 pb-2 flex justify-between items-center text-[10px] font-black uppercase text-gray-700">
                <span>Suspended clearance</span>
                <span className="bg-stone-50 px-1.5 border border-stone-300">{collectionsQueue.suspended.length}</span>
              </div>

              <div className="space-y-3">
                {collectionsQueue.suspended.map(item => (
                  <div key={item.vendor.id} className="bg-stone-50 border border-stone-200 p-3 rounded-none text-[8.5px] font-bold text-gray-600 flex justify-between items-center">
                    <div>
                      <span className="text-gray-900 block font-sans">{item.vendor.name}</span>
                      <span className="text-red-600 text-[7px] block font-black uppercase mt-0.5">Clearance Suspended</span>
                    </div>
                    <button onClick={() => {
                      const updated = vendors.map(v => v.id === item.vendor.id ? { ...v, status: 'Active' as const } : v);
                      setVendors(updated);
                      localStorage.setItem('sgn_vendors', JSON.stringify(updated));
                      alert('Suspension lifted.');
                    }} className="bg-white border border-stone-300 px-2 py-0.5 cursor-pointer uppercase font-mono text-[7px] hover:border-[#1A1A1A]">Restore Active</button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: RPN COMMISSION FINANCE */}
      {activeTab === 'commissions' && (
        <div className="space-y-4 text-left">
          
          <div className="bg-white border-2 border-[#1A1A1A] overflow-hidden">
            
            <div className="bg-[#FAF9F6] border-b border-[#1A1A1A] p-2.5 flex justify-between items-center text-[9px] font-black uppercase text-gray-500">
              <span>RPN Agent commissions ledger</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[9px] font-mono">
                <thead>
                  <tr className="bg-stone-50 border-b border-[#1A1A1A] uppercase font-bold text-[8px] tracking-wider text-gray-500">
                    <th className="p-3 border-r border-gray-200">Invoice ID</th>
                    <th className="p-3 border-r border-gray-200">RPN Agent</th>
                    <th className="p-3 border-r border-gray-200">Merchant Client</th>
                    <th className="p-3 border-r border-gray-200">Commission model</th>
                    <th className="p-3 border-r border-gray-200">Amount</th>
                    <th className="p-3 border-r border-gray-200">Due Date</th>
                    <th className="p-3 border-r border-gray-200">Paid Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(c => {
                    let badge = 'bg-stone-100 text-stone-850 border-stone-300';
                    if (c.status === 'Paid') badge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                    else if (c.status === 'Approved') badge = 'bg-blue-50 text-blue-800 border-blue-300';
                    else if (c.status === 'Withheld') badge = 'bg-red-50 text-red-800 border-red-300';

                    return (
                      <tr key={c.id} className="border-b border-gray-150 hover:bg-[#FAF9F6] transition-colors">
                        <td className="p-3 border-r border-gray-200 font-bold text-gray-450">{c.id}</td>
                        <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{c.agentName}</td>
                        <td className="p-3 border-r border-gray-200 font-sans text-gray-800">{c.vendorName}</td>
                        <td className="p-3 border-r border-gray-200 uppercase text-[8px]">{c.commissionModel}</td>
                        <td className="p-3 border-r border-gray-200 font-bold text-gray-900">$${c.amount}</td>
                        <td className="p-3 border-r border-gray-200 font-mono text-gray-650">{c.dueDate}</td>
                        <td className="p-3 border-r border-gray-200 font-mono text-gray-650">{c.paidDate || '—'}</td>
                        <td className="p-3 flex justify-between items-center gap-2">
                          <span className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${badge}`}>
                            {c.status}
                          </span>
                          
                          <div className="flex gap-1.5 text-[8px] font-black uppercase">
                            {c.status === 'Pending' && (
                              <>
                                <button onClick={() => handleApproveCommission(c.id)} className="bg-white border border-[#1A1A1A] hover:bg-[#FF5A00] hover:text-white px-2 py-0.5 cursor-pointer">Approve</button>
                                <button onClick={() => {
                                  const updated = commissions.map(item => item.id === c.id ? { ...item, status: 'Withheld' as const } : item);
                                  saveCommissions(updated);
                                }} className="bg-white border border-[#1A1A1A] hover:bg-stone-200 px-2 py-0.5 cursor-pointer">Withhold</button>
                              </>
                            )}
                            {c.status === 'Approved' && (
                              <button onClick={() => handlePayCommission(c.id)} className="bg-[#FF5A00] text-white px-2 py-0.5 cursor-pointer">Pay</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 5: ANALYTICS & BREAKDOWNS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Break 1: Plan revenues */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
              <div className="border-b border-[#D1D1CF] pb-2 mb-4 text-[#FF5A00] font-black uppercase text-[10px]">
                <span>Plan Tier Subscription Revenues</span>
              </div>
              <div className="space-y-3 font-mono text-[9px] uppercase font-bold text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Starter POS</span>
                  <span className="text-gray-900">$${planRevenueBreakdown['Starter']} USD</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FAF9F6] pt-1.5">
                  <span>Growth POS</span>
                  <span className="text-gray-900">$${planRevenueBreakdown['Growth']} USD</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FAF9F6] pt-1.5">
                  <span>Professional POS</span>
                  <span className="text-gray-900">$${planRevenueBreakdown['Professional']} USD</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FAF9F6] pt-1.5">
                  <span>Business Plus POS</span>
                  <span className="text-gray-900">$${planRevenueBreakdown['Business Plus']} USD</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#FAF9F6] pt-1.5">
                  <span>Enterprise Commerce</span>
                  <span className="text-[#FF5A00] font-black">$${planRevenueBreakdown['Enterprise']} USD</span>
                </div>
              </div>
            </div>

            {/* Break 2: Capacity & module placeholder */}
            <div className="bg-white border-2 border-[#1A1A1A] p-4 relative shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
              <div className="border-b border-[#D1D1CF] pb-2 mb-4 text-[#FF5A00] font-black uppercase text-[10px]">
                <span>Capacity add-ons & apps shares</span>
              </div>
              <div className="flex h-36 items-center justify-around font-mono text-[9px] uppercase font-bold text-gray-500">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 bg-orange-500" /><span>App Tunnels: 48%</span></div>
                  <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 bg-indigo-500" /><span>Add-ons: 32%</span></div>
                  <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 bg-[#1A1A1A]" /><span>Adjustments: 20%</span></div>
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-orange-500 flex items-center justify-center font-sans font-black text-gray-900 text-[10px]">
                  48%
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ADD LEDGER RECORD DIALOG */}
      {isAddRecordOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/40 flex items-center justify-center p-4">
          <form onSubmit={handleAddRecord} className="bg-white border-4 border-[#1A1A1A] p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative font-mono text-[#1A1A1A]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF5A00]" />
            <h3 className="font-sans font-black text-sm uppercase border-b border-[#D1D1CF] pb-2">
              Add Revenue Record
            </h3>

            <div className="space-y-3 text-[9px] font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Select target Vendor</label>
                <select
                  value={formVendorName}
                  onChange={(e) => setFormVendorName(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer font-sans uppercase"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Description</label>
                <input
                  type="text"
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Amount (USD)</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 focus:outline-none text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Ledger Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Credit">Credit (Income)</option>
                    <option value="Debit">Debit (Payout)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Record Type</label>
                  <select
                    value={formRecordType}
                    onChange={(e) => setFormRecordType(e.target.value as any)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Subscription">Subscription</option>
                    <option value="Renewal">Renewal</option>
                    <option value="Capacity Add-on">Capacity Add-on</option>
                    <option value="Business Module">Business Module</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase">Payment Status</label>
                  <select
                    value={formStatusField}
                    onChange={(e) => setFormStatusField(e.target.value as any)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 focus:outline-none text-[10px] font-bold cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1D1CF] flex justify-end space-x-2 text-[10px] font-black uppercase">
              <button
                type="button"
                onClick={() => setIsAddRecordOpen(false)}
                className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#FF5A00] text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Record invoice
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}