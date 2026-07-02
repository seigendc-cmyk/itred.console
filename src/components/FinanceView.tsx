import React, { useState, useMemo } from 'react';
import { useLifecycle } from '../App';
import { FinanceRecord, Vendor, Plan, BankAccount } from '../types';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  FileText, 
  Check, 
  Calendar, 
  Filter, 
  Clock, 
  Tag, 
  Printer, 
  X, 
  AlertCircle, 
  ArrowRight, 
  DollarSign, 
  User, 
  Layers, 
  Briefcase, 
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Bookmark,
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  Download,
  Trash2,
  FileSpreadsheet,
  BookOpen,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

interface VendorBill {
  id: string;
  vendorId: string;
  vendorName: string;
  category: 'Plan Subscription' | 'Marketing Campaign' | 'Stocktake' | 'Training' | 'Hardware Audit' | 'Support' | 'Other';
  planId?: string;
  planName?: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Voided';
  issueDate: string;
  dueDate: string;
  notes?: string;
  refNo: string;
}

const INITIAL_BILLS: VendorBill[] = [
  { 
    id: 'BILL-1001', 
    vendorId: 'V-802', 
    vendorName: 'NexaRetail Solutions', 
    category: 'Plan Subscription', 
    planId: 'PLN-HYB-01',
    planName: 'Growth POS', 
    description: 'Ecosystem standard retail deployment - Growth POS License recurring subscription fee',
    amount: 1200.00, 
    status: 'Paid', 
    issueDate: '2026-06-15', 
    dueDate: '2026-07-15', 
    refNo: 'REF-BILL-88201',
    notes: 'Standard renewal cycle completed via automatic ledger debit authorization.'
  },
  { 
    id: 'BILL-1002', 
    vendorId: 'V-451', 
    vendorName: 'Vanguard Outpost Ltd', 
    category: 'Marketing Campaign', 
    description: 'Q3 Ecosystem Promo: Local geo-targeted digital advertising banner campaign',
    amount: 450.00, 
    status: 'Unpaid', 
    issueDate: '2026-06-20', 
    dueDate: '2026-07-20', 
    refNo: 'REF-BILL-44502',
    notes: 'Awaiting promotional deployment performance report from NexaMedia node.'
  },
  { 
    id: 'BILL-1003', 
    vendorId: 'V-209', 
    vendorName: 'AtomiCo QuickShop', 
    category: 'Stocktake', 
    description: 'Mid-year physical stocktake verification and POS inventory synchronization assistance',
    amount: 350.00, 
    status: 'Paid', 
    issueDate: '2026-06-10', 
    dueDate: '2026-06-25', 
    refNo: 'REF-BILL-22103',
    notes: 'Conducted on-site. Verified by auditor Tomoko Sato.'
  },
  { 
    id: 'BILL-1004', 
    vendorId: 'V-774', 
    vendorName: 'Zephyr Fashion House', 
    category: 'Training', 
    description: 'SGN Terminal Operation & Cashier Security Certificate Course',
    amount: 600.00, 
    status: 'Unpaid', 
    issueDate: '2026-06-28', 
    dueDate: '2026-07-28', 
    refNo: 'REF-BILL-77404',
    notes: 'In-person course for 4 terminal operators at Milan regional office.'
  },
  { 
    id: 'BILL-1005', 
    vendorId: 'V-102', 
    vendorName: 'BioFuel Station S-8', 
    category: 'Hardware Audit', 
    description: 'Remote cryptographic gateway security evaluation and TPM physical health audit',
    amount: 250.00, 
    status: 'Paid', 
    issueDate: '2026-05-25', 
    dueDate: '2026-06-10', 
    refNo: 'REF-BILL-10205',
    notes: 'Successfully passed with high marks on compliance and hardware signatures.'
  }
];

export default function FinanceView() {
  const { 
    financeRecords, 
    setFinanceRecords, 
    vendors, 
    plans, 
    currentAdmin, 
    addLogAndNotify 
  } = useLifecycle();

  // Active Tab: 'ledger' | 'history' | 'generate' | 'vendor_ledger'
  const [activeTab, setActiveTab] = useState<'ledger' | 'history' | 'generate' | 'vendor_ledger'>('ledger');



  // --- Bank & Cash Accounts Setup ---
  interface Account {
    id: string;
    name: string;
    type: 'Bank' | 'Cash';
    institution?: string;
    accountNumber?: string;
    initialBalance: number;
    currentBalance: number;
    status: 'Active' | 'Inactive';
  }

  const INITIAL_ACCOUNTS: Account[] = [
    { id: 'ACC-001', name: 'Chase Operating Account', type: 'Bank', institution: 'JPMorgan Chase', accountNumber: '•••• 8820', initialBalance: 25000, currentBalance: 25000, status: 'Active' },
    { id: 'ACC-002', name: 'Main Office Petty Cash', type: 'Cash', institution: 'Cash Drawer', accountNumber: 'N/A', initialBalance: 1200, currentBalance: 1200, status: 'Active' },
    { id: 'ACC-003', name: 'Stripe Settlement', type: 'Bank', institution: 'Stripe Inc.', accountNumber: '•••• 1042', initialBalance: 8450, currentBalance: 8450, status: 'Active' }
  ];

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('seigen_bank_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ACCOUNTS;
      }
    }
    localStorage.setItem('seigen_bank_accounts', JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  });

  const saveAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('seigen_bank_accounts', JSON.stringify(newAccounts));
  };

  const getAccountBalance = (account: Account) => {
    const credits = financeRecords
      .filter((r: any) => (r.accountId || 'ACC-001') === account.id && r.type === 'Credit')
      .reduce((sum, r) => sum + r.amount, 0);
    const debits = financeRecords
      .filter((r: any) => (r.accountId || 'ACC-001') === account.id && r.type === 'Debit')
      .reduce((sum, r) => sum + r.amount, 0);
    return account.initialBalance + credits - debits;
  };

  // State to filter ledger by Account
  const [selectedFilterAccountId, setSelectedFilterAccountId] = useState<string>('All');

  // New Account Modal State
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [addAccName, setAddAccName] = useState('');
  const [addAccType, setAddAccType] = useState<'Bank' | 'Cash'>('Bank');
  const [addAccInstitution, setAddAccInstitution] = useState('');
  const [addAccNumber, setAddAccNumber] = useState('');
  const [addAccInitialBalance, setAddAccInitialBalance] = useState('');

  // Log Payout Floating Form State
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [payoutAccountId, setPayoutAccountId] = useState('ACC-001');
  const [payoutPayee, setPayoutPayee] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutCategory, setPayoutCategory] = useState('Operational Cost');
  const [payoutDate, setPayoutDate] = useState('2026-07-02');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutDescription, setPayoutDescription] = useState('');

  // Log Receipt Floating Form State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptAccountId, setReceiptAccountId] = useState('ACC-001');
  const [receiptSource, setReceiptSource] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptCategory, setReceiptCategory] = useState('Subscriptions');
  const [receiptDate, setReceiptDate] = useState('2026-07-02');
  const [receiptRef, setReceiptRef] = useState('');
  const [receiptDescription, setReceiptDescription] = useState('');

  // Selected checkout account destination state
  const [checkoutAccountId, setCheckoutAccountId] = useState('ACC-001');

  // Bills State
  const [bills, setBills] = useState<VendorBill[]>(() => {
    const saved = localStorage.getItem('seigen_vendor_bills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BILLS;
      }
    }
    localStorage.setItem('seigen_vendor_bills', JSON.stringify(INITIAL_BILLS));
    return INITIAL_BILLS;
  });

  const saveBills = (newBills: VendorBill[]) => {
    setBills(newBills);
    localStorage.setItem('seigen_vendor_bills', JSON.stringify(newBills));
  };

  // Bill Generation Form State
  const [formVendorId, setFormVendorId] = useState('');
  const [formCategory, setFormCategory] = useState<VendorBill['category']>('Plan Subscription');
  const [formPlanId, setFormPlanId] = useState('');
  const [formCustomDescription, setFormCustomDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('2026-07-02');
  const [formDueDate, setFormDueDate] = useState('2026-08-02');
  const [formNotes, setFormNotes] = useState('');

  // Invoice Detailed Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<VendorBill | null>(null);

  // Apply Payment / Checkout Form States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'Ledger' | 'ACH' | 'Cash' | 'Voucher'>('Ledger');
  const [checkoutRepresentative, setCheckoutRepresentative] = useState('');
  const [checkoutRef, setCheckoutRef] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('2026-07-02');
  const [checkoutMemo, setCheckoutMemo] = useState('');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);

  // Vendor Ledger Tab States
  const [selectedLedgerVendorId, setSelectedLedgerVendorId] = useState('');

  // Filter States for History
  const [filterVendor, setFilterVendor] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPlan, setFilterPlan] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-fill price or description when Plan changes
  const handlePlanChange = (planId: string) => {
    setFormPlanId(planId);
    const plan = plans.find((p: Plan) => p.id === planId);
    if (plan) {
      setFormAmount(plan.price.toString());
      setFormCustomDescription(`${plan.name} Plan subscription recurring monthly licensing fee`);
    }
  };

  // Pre-fill default values on loading generator tab
  const handleSelectGenerateTab = () => {
    setActiveTab('generate');
    const activeVendors = vendors.filter((v: Vendor) => v.status === 'Active' || v.status === 'Ready');
    if (activeVendors.length > 0 && !formVendorId) {
      setFormVendorId(activeVendors[0].id);
    } else if (vendors.length > 0 && !formVendorId) {
      setFormVendorId(vendors[0].id);
    }

    if (plans.length > 0 && !formPlanId) {
      const firstPlan = plans[0];
      setFormPlanId(firstPlan.id);
      setFormAmount(firstPlan.price.toString());
      setFormCustomDescription(`${firstPlan.name} Plan subscription recurring monthly licensing fee`);
    }
  };

  // Submit Handler to Generate Bill
  const handleGenerateBill = (e: React.FormEvent) => {
    e.preventDefault();

    const vendor = vendors.find((v: Vendor) => v.id === formVendorId);
    if (!vendor) {
      alert('Please select a valid merchant vendor.');
      return;
    }

    const price = parseFloat(formAmount);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid billing amount.');
      return;
    }

    const plan = plans.find((p: Plan) => p.id === formPlanId);

    const randBillId = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
    const randRefNo = `REF-BILL-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBill: VendorBill = {
      id: randBillId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      category: formCategory,
      planId: formCategory === 'Plan Subscription' ? formPlanId : undefined,
      planName: formCategory === 'Plan Subscription' && plan ? plan.name : undefined,
      description: formCustomDescription.trim() || `${formCategory} Professional Service`,
      amount: price,
      status: 'Unpaid',
      issueDate: formIssueDate,
      dueDate: formDueDate,
      notes: formNotes.trim() || 'Internal iTred System clearing generated invoice.',
      refNo: randRefNo
    };

    const updatedBills = [newBill, ...bills];
    saveBills(updatedBills);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Console',
        'GENERATE_VENDOR_BILL',
        `${vendor.name} • ${randBillId}`,
        'Success',
        'success',
        'Vendor Bill Generated',
        `Invoice ${randBillId} issued to ${vendor.name} for $${price.toFixed(2)} [Category: ${formCategory}].`
      );
    }

    // Reset Form Fields
    setFormCustomDescription('');
    setFormNotes('');
    
    // Switch to history tab to view generated invoice
    setActiveTab('history');
  };

  // Open Checkout drawer inside Invoice lightbox
  const handleOpenCheckout = (bill: VendorBill) => {
    setCheckoutPaymentMethod('Ledger');
    setCheckoutRepresentative(currentAdmin?.name || 'Authorized Admin Node');
    setCheckoutRef(`PMT-TXN-${Math.floor(10000 + Math.random() * 90000)}`);
    setCheckoutDate(new Date().toISOString().split('T')[0]);
    setCheckoutMemo(`Settle Invoice ${bill.id} for $${bill.amount.toFixed(2)}`);
    setIsCheckoutOpen(true);
    setIsCheckoutSuccess(false);
  };

  // Process and Confirm Checkout Payment
  const handleProcessCheckout = (bill: VendorBill) => {
    const updated = bills.map(b => b.id === bill.id ? { ...b, status: 'Paid' as const } : b);
    saveBills(updated);

    // Create central ledger record
    const newTxnId = `TXN-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: FinanceRecord = {
      id: newTxnId,
      description: `${bill.vendorName} - Settle Bill ${bill.id} via ${checkoutPaymentMethod} [${bill.category}]`,
      amount: bill.amount,
      type: 'Credit',
      date: checkoutDate,
      refNo: checkoutRef,
      accountId: checkoutAccountId,
      accountName: accounts.find(a => a.id === checkoutAccountId)?.name || 'Chase Operating Account'
    } as any;

    setFinanceRecords((prev: FinanceRecord[]) => [newRecord, ...prev]);

    if (addLogAndNotify) {
      addLogAndNotify(
        checkoutRepresentative || 'Clearing Node',
        'SETTLE_VENDOR_BILL',
        `${bill.vendorName} • ${bill.id}`,
        'Success',
        'success',
        'Vendor Invoice Paid & Settled',
        `Settlement complete for Invoice ${bill.id} via ${checkoutPaymentMethod}. Added credit entry of $${bill.amount.toFixed(2)} to Ecosystem Ledger.`
      );
    }

    // Sync selected invoice if modal is open
    if (selectedInvoice && selectedInvoice.id === bill.id) {
      setSelectedInvoice({ ...selectedInvoice, status: 'Paid' });
    }

    setIsCheckoutOpen(false);
    setIsCheckoutSuccess(true);
  };

  // --- Handlers for Floating Payout & Receipt Forms ---
  const handleSubmitPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    const selectedAcc = accounts.find(a => a.id === payoutAccountId);
    if (!selectedAcc) {
      alert('Please select a valid account.');
      return;
    }

    const newTxnId = `TXN-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: FinanceRecord = {
      id: newTxnId,
      description: `[Payout] To: ${payoutPayee} — ${payoutDescription} (${payoutCategory})`,
      amount: amt,
      type: 'Debit',
      date: payoutDate,
      refNo: payoutRef,
      accountId: payoutAccountId,
      accountName: selectedAcc.name,
      subType: 'Payout'
    } as any;

    setFinanceRecords((prev: FinanceRecord[]) => [newRecord, ...prev]);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Clearing Node',
        'LOG_PAYOUT',
        `${payoutPayee} • $${amt.toFixed(2)}`,
        'Success',
        'success',
        'Payout Successfully Logged',
        `Logged payout of $${amt.toFixed(2)} to ${payoutPayee} from "${selectedAcc.name}".`
      );
    }

    // Reset and Close
    setIsPayoutOpen(false);
    setPayoutPayee('');
    setPayoutAmount('');
    setPayoutDescription('');
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(receiptAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid receipt amount.');
      return;
    }
    const selectedAcc = accounts.find(a => a.id === receiptAccountId);
    if (!selectedAcc) {
      alert('Please select a valid account.');
      return;
    }

    const newTxnId = `TXN-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: FinanceRecord = {
      id: newTxnId,
      description: `[Receipt] From: ${receiptSource} — ${receiptDescription} (${receiptCategory})`,
      amount: amt,
      type: 'Credit',
      date: receiptDate,
      refNo: receiptRef,
      accountId: receiptAccountId,
      accountName: selectedAcc.name,
      subType: 'Receipt'
    } as any;

    setFinanceRecords((prev: FinanceRecord[]) => [newRecord, ...prev]);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Clearing Node',
        'LOG_RECEIPT',
        `${receiptSource} • $${amt.toFixed(2)}`,
        'Success',
        'success',
        'Receipt Successfully Logged',
        `Logged other receipt of $${amt.toFixed(2)} from ${receiptSource} into "${selectedAcc.name}".`
      );
    }

    // Reset and Close
    setIsReceiptOpen(false);
    setReceiptSource('');
    setReceiptAmount('');
    setReceiptDescription('');
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAccName.trim()) {
      alert('Please enter an account name.');
      return;
    }
    const initialBal = parseFloat(addAccInitialBalance);
    if (isNaN(initialBal) || initialBal < 0) {
      alert('Please enter a valid initial balance.');
      return;
    }

    const newId = `ACC-${Math.floor(100 + Math.random() * 900)}`;
    const newAccount: Account = {
      id: newId,
      name: addAccName.trim(),
      type: addAccType,
      institution: addAccInstitution.trim() || (addAccType === 'Bank' ? 'General Bank' : 'Physical Vault'),
      accountNumber: addAccNumber.trim() || 'N/A',
      initialBalance: initialBal,
      currentBalance: initialBal,
      status: 'Active'
    };

    const updated = [...accounts, newAccount];
    saveAccounts(updated);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Clearing Node',
        'CREATE_BANK_ACCOUNT',
        `${newAccount.name} (${newId})`,
        'Success',
        'success',
        'Financial Account Created',
        `Account "${newAccount.name}" has been registered in the system with opening balance $${initialBal.toFixed(2)}.`
      );
    }

    setAddAccName('');
    setAddAccType('Bank');
    setAddAccInstitution('');
    setAddAccNumber('');
    setAddAccInitialBalance('');
    setIsAddAccountOpen(false);
  };

  // Void or Revoke Invoice
  const handleVoidBill = (bill: VendorBill) => {
    const confirmVoid = window.confirm(`AUDIT REVOKE COMPLIANCE: Are you absolutely sure you want to void and revoke Invoice ${bill.id} ($${bill.amount.toFixed(2)}) for ${bill.vendorName}? This will permanently void active outstanding balances.`);
    if (!confirmVoid) return;

    const updated = bills.map(b => b.id === bill.id ? { ...b, status: 'Voided' as const } : b);
    saveBills(updated);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Clearing Node',
        'VOID_VENDOR_BILL',
        `${bill.vendorName} • ${bill.id}`,
        'Warning',
        'warning',
        'Vendor Invoice Voided/Revoked',
        `Invoice ${bill.id} was voided and flagged as inactive/voided in administrative audit trail logs.`
      );
    }

    if (selectedInvoice && selectedInvoice.id === bill.id) {
      setSelectedInvoice({ ...selectedInvoice, status: 'Voided' });
    }
  };

  // Quick Action: Mark as Paid directly
  const handleQuickMarkAsPaid = (bill: VendorBill) => {
    const updated = bills.map(b => b.id === bill.id ? { ...b, status: 'Paid' as const } : b);
    saveBills(updated);

    // Create central ledger record
    const newTxnId = `TXN-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: FinanceRecord = {
      id: newTxnId,
      description: `${bill.vendorName} - Settle Bill ${bill.id} [${bill.category}]`,
      amount: bill.amount,
      type: 'Credit',
      date: new Date().toISOString().split('T')[0],
      refNo: bill.refNo,
      accountId: 'ACC-001',
      accountName: 'Chase Operating Account'
    } as any;

    setFinanceRecords((prev: FinanceRecord[]) => [newRecord, ...prev]);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Clearing Node',
        'SETTLE_VENDOR_BILL',
        `${bill.vendorName} • ${bill.id}`,
        'Success',
        'success',
        'Vendor Invoice Paid & Settled',
        `Settlement complete for Invoice ${bill.id}. Added credit entry of $${bill.amount.toFixed(2)} to Ecosystem Ledger.`
      );
    }
  };

  // Filter bills for history
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesVendor = filterVendor === 'All' || bill.vendorId === filterVendor;
      const matchesCategory = filterCategory === 'All' || bill.category === filterCategory;
      const matchesPlan = filterPlan === 'All' || bill.planName === filterPlan;
      const matchesStatus = filterStatus === 'All' || bill.status === filterStatus;
      
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        bill.vendorName.toLowerCase().includes(search) ||
        bill.id.toLowerCase().includes(search) ||
        bill.description.toLowerCase().includes(search) ||
        bill.refNo.toLowerCase().includes(search);

      return matchesVendor && matchesCategory && matchesPlan && matchesStatus && matchesSearch;
    });
  }, [bills, filterVendor, filterCategory, filterPlan, filterStatus, searchQuery]);

  // Billing Stats for History Tab
  const billingStats = useMemo(() => {
    let totalBilled = 0;
    let totalCollected = 0;
    let totalUnpaid = 0;
    let totalVoided = 0;

    filteredBills.forEach(b => {
      if (b.status === 'Voided') {
        totalVoided += b.amount;
      } else {
        totalBilled += b.amount;
        if (b.status === 'Paid') {
          totalCollected += b.amount;
        } else {
          totalUnpaid += b.amount;
        }
      }
    });

    // Breakdown metrics (excluding voided)
    const categoriesList = ['Plan Subscription', 'Marketing Campaign', 'Stocktake', 'Training', 'Hardware Audit', 'Support', 'Other'];
    const breakdowns = categoriesList.map(cat => {
      const amt = filteredBills
        .filter(b => b.category === cat && b.status !== 'Voided')
        .reduce((sum, b) => sum + b.amount, 0);
      return { category: cat, amount: amt };
    }).filter(item => item.amount > 0);

    return {
      totalBilled,
      totalCollected,
      totalUnpaid,
      totalVoided,
      breakdowns
    };
  }, [filteredBills]);

  // Selected Vendor Statement Calculations
  const vendorLedgerData = useMemo(() => {
    if (!selectedLedgerVendorId) return null;
    const vendor = vendors.find((v: Vendor) => v.id === selectedLedgerVendorId);
    if (!vendor) return null;

    const vendorBills = bills.filter(b => b.vendorId === selectedLedgerVendorId);
    
    let invoiced = 0;
    let paid = 0;
    let outstanding = 0;
    let voidedAmt = 0;

    vendorBills.forEach(b => {
      if (b.status === 'Voided') {
        voidedAmt += b.amount;
      } else {
        invoiced += b.amount;
        if (b.status === 'Paid') {
          paid += b.amount;
        } else {
          outstanding += b.amount;
        }
      }
    });

    return {
      vendor,
      bills: vendorBills,
      invoiced,
      paid,
      outstanding,
      voidedAmt
    };
  }, [bills, vendors, selectedLedgerVendorId]);

  // General Aggregates from context ledger
  const filteredFinanceRecords = useMemo(() => {
    return financeRecords.filter((rec: any) => {
      if (selectedFilterAccountId === 'All') return true;
      const recAccId = rec.accountId || 'ACC-001';
      return recAccId === selectedFilterAccountId;
    });
  }, [financeRecords, selectedFilterAccountId]);

  const totalCredit = useMemo(() => {
    return filteredFinanceRecords
      .filter((r: any) => r.type === 'Credit')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredFinanceRecords]);

  const totalDebit = useMemo(() => {
    return filteredFinanceRecords
      .filter((r: any) => r.type === 'Debit')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredFinanceRecords]);

  const netBalance = useMemo(() => {
    if (selectedFilterAccountId === 'All') {
      return accounts.reduce((sum, acc) => sum + getAccountBalance(acc), 0);
    } else {
      const selectedAcc = accounts.find(a => a.id === selectedFilterAccountId);
      return selectedAcc ? getAccountBalance(selectedAcc) : 0;
    }
  }, [accounts, financeRecords, selectedFilterAccountId]);

  // Print Vendor Ledger Statement Logic
  const handlePrintLedgerStatement = () => {
    if (!vendorLedgerData) return;
    const { vendor, bills: vBills, invoiced, paid, outstanding, voidedAmt } = vendorLedgerData;

    const win = window.open("", "_blank");
    if (win) {
      const rowsHtml = vBills.map(b => `
        <tr style="border-bottom: 1px solid #D1D1CF; ${b.status === 'Voided' ? 'text-decoration: line-through; color: #9CA3AF;' : ''}">
          <td style="padding: 10px; font-weight: bold;">${b.id}</td>
          <td style="padding: 10px;">${b.refNo}</td>
          <td style="padding: 10px;">${b.issueDate}</td>
          <td style="padding: 10px;">${b.category}</td>
          <td style="padding: 10px;">${b.description}</td>
          <td style="padding: 10px; font-weight: bold; text-transform: uppercase;">${b.status}</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">$${b.amount.toFixed(2)}</td>
        </tr>
      `).join('');

      win.document.write(`
        <html>
          <head>
            <title>Statement Ledger - ${vendor.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'JetBrains Mono', monospace; padding: 40px; background: white; color: #1A1A1A; font-size: 11px; }
              .font-sans { font-family: 'Inter', sans-serif; }
              .text-right { text-align: right; }
              .uppercase { text-transform: uppercase; }
              .font-bold { font-weight: bold; }
              .mt-4 { margin-top: 16px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background: #1A1A1A; color: white; padding: 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }
              .summary-box { display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px; margin-top: 20px; margin-bottom: 20px; }
              .summary-card { border: 1px solid #1A1A1A; padding: 12px; }
              .summary-title { font-size: 8px; color: #6B7280; text-transform: uppercase; font-weight: bold; }
              .summary-val { font-size: 16px; font-weight: 900; margin-top: 4px; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div style="border-bottom: 3px solid #1A1A1A; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h1 class="font-sans" style="margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase;">seiGEN iTred Clearing</h1>
                <p style="margin: 2px 0 0 0; color: #6B7280; font-weight: bold; font-size: 9px;">Ecosystem Billing & Consolidated Account Statement</p>
              </div>
              <div style="text-align: right;">
                <h2 class="font-sans" style="margin: 0; font-size: 14px; font-weight: 900; color: #FF5A00;">ACCOUNT LEDGER</h2>
                <p style="margin: 2px 0 0 0; font-size: 9px; font-weight: bold; color: #4B5563;">DATE GENERATED: 2026-07-02</p>
              </div>
            </div>

            <div style="margin-top: 20px; display: flex; justify-content: space-between; background: #F4F4F1; border: 1px solid #D1D1CF; padding: 15px;">
              <div>
                <span style="font-size: 8px; color: #9CA3AF; font-weight: bold; display: block; text-transform: uppercase;">Statement Client (Vendor):</span>
                <span class="font-sans" style="font-size: 12px; font-weight: bold; display: block; color: #1A1A1A; margin-top: 3px;">${vendor.name}</span>
                <span style="display: block; color: #4B5563; font-size: 9px; margin-top: 2px;">
                  Vendor Code: ${vendor.code} | Join Date: ${vendor.joinedDate}<br/>
                  Email Node: ${vendor.email || 'N/A'}<br/>
                  Registered Location: ${vendor.location}
                </span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 8px; color: #9CA3AF; font-weight: bold; display: block; text-transform: uppercase;">Billing Clearance Node:</span>
                <span class="font-sans" style="font-size: 10px; font-weight: bold; display: block; color: #1A1A1A; margin-top: 3px;">seiGEN_PROD_CLEARING_04</span>
                <span style="display: block; color: #4B5563; font-size: 9px; margin-top: 2px;">
                  Audit Signature: KMS-VANCE-2026<br/>
                  Compliance Level: ROTATIONAL DEBT
                </span>
              </div>
            </div>

            <div class="summary-box">
              <div class="summary-card">
                <div class="summary-title">Consolidated Invoiced</div>
                <div class="summary-val" style="color: #1A1A1A;">$${invoiced.toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-title">Cleared Payments</div>
                <div class="summary-val" style="color: #15803D;">$${paid.toFixed(2)}</div>
              </div>
              <div class="summary-card" style="background-color: #FFFBEB;">
                <div class="summary-title" style="color: #B45309;">Outstanding Dues</div>
                <div class="summary-val" style="color: #B45309;">$${outstanding.toFixed(2)}</div>
              </div>
              <div class="summary-card" style="background-color: #FEF2F2;">
                <div class="summary-title" style="color: #B91C1C;">Voided & Revoked</div>
                <div class="summary-val" style="color: #B91C1C;">$${voidedAmt.toFixed(2)}</div>
              </div>
            </div>

            <h3 class="font-sans" style="text-transform: uppercase; font-size: 10px; font-weight: 900; margin-bottom: 8px;">Consolidated Ledger Entries</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 12%;">DOC ID</th>
                  <th style="width: 15%;">REFERENCE</th>
                  <th style="width: 12%;">ISSUE DATE</th>
                  <th style="width: 18%;">CLASSIFICATION</th>
                  <th style="width: 25%;">DESCRIPTION</th>
                  <th style="width: 10%;">STATUS</th>
                  <th style="width: 13%; text-align: right;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div style="margin-top: 40px; border-top: 1px dashed #D1D1CF; padding-top: 20px; display: flex; justify-content: space-between; font-size: 8px; color: #9CA3AF;">
              <div>
                AUTHENTICATION SHA256 SHA256-SGN-STATEMENT-${vendor.id}<br/>
                RECONCILIATION ACCURACY ASSURED BY SGN NODE INTEGRATION
              </div>
              <div style="text-align: right;">
                PRINT DATE: 2026-07-02 | GENERATED BY: ${currentAdmin?.name || 'Administrator'}<br/>
                OFFICIAL INTERNAL DOCUMENT — STRICTLY CONFIDENTIAL
              </div>
            </div>

            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  // Helper to open PDF print checkout receipt
  const handlePrintReceipt = (bill: VendorBill) => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Clearance Receipt - ${bill.id}</title>
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'JetBrains Mono', monospace; padding: 40px; background: white; color: #1A1A1A; font-size: 11px; text-align: center; }
              .font-sans { font-family: 'Inter', sans-serif; }
              .text-left { text-align: left; }
              .border { border: 1px solid #1A1A1A; padding: 20px; margin: 0 auto; max-width: 450px; }
              .line { border-bottom: 1px dashed #1A1A1A; margin: 15px 0; }
              .total { font-size: 18px; font-weight: 900; color: #15803D; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div class="border text-left">
              <h2 class="font-sans text-center" style="margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase;">seiGEN TRANSACTION RECEIPT</h2>
              <p class="text-center" style="margin: 4px 0 0 0; font-size: 9px; color: #6B7280; font-weight: bold;">LEDGER CLEARANCE & ACCOUNT SETTLEMENT</p>
              
              <div class="line"></div>
              
              <table style="width: 100%; font-size: 10px;">
                <tr><td><strong>TRANSACTION ID:</strong></td><td style="text-align: right;">${checkoutRef}</td></tr>
                <tr><td><strong>INVOICE REF:</strong></td><td style="text-align: right;">${bill.id}</td></tr>
                <tr><td><strong>SETTLED CLIENT:</strong></td><td style="text-align: right;">${bill.vendorName}</td></tr>
                <tr><td><strong>CLEARING DATE:</strong></td><td style="text-align: right;">${checkoutDate}</td></tr>
                <tr><td><strong>METHOD:</strong></td><td style="text-align: right; text-transform: uppercase;">${checkoutPaymentMethod}</td></tr>
                <tr><td><strong>REPRESENTATIVE:</strong></td><td style="text-align: right;">${checkoutRepresentative}</td></tr>
              </table>
              
              <div class="line"></div>
              
              <div style="font-size: 9px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #4B5563;">Reconciled Service Line:</div>
              <div style="background: #F4F4F1; padding: 10px; font-size: 10px; border: 1px solid #D1D1CF;">
                <strong>[${bill.category}]</strong> ${bill.description}
              </div>
              
              <div class="line"></div>
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; font-size: 11px;">AMOUNT SETTLED (USD):</span>
                <span class="total font-sans">$${bill.amount.toFixed(2)}</span>
              </div>
              
              <div class="line"></div>
              
              <p class="text-center" style="font-size: 8px; color: #9CA3AF; margin: 0; line-height: 1.4;">
                CR-LEDGER BALANCE RECONCILED SUCCESSFULLY<br/>
                VERIFIED LOCKSIGN: SHA256-SIGN-RECV-${bill.id}<br/>
                OPERATIONS CENTRAL COMPLIANCE ASSURED
              </p>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div id="finance_view" className="space-y-6 font-mono text-xs">
      
      {/* HEADER WITH CONSOLE SWITCHER */}
      <div id="finance_header" className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b-4 border-[#1A1A1A] pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-[#FF5A00]" />
            <h1 className="text-xl font-black font-sans text-[#1A1A1A] uppercase tracking-wider">Ecosystem Finance Ledger</h1>
          </div>
          <p className="text-xs text-gray-500">CENTRAL CLEARING ACCOUNTABILITY ENGINE — ROTATIONAL SETTLEMENTS & DEBT DEPLOYMENT</p>
        </div>

        {/* TOP TAB CONTROL SWITCHER */}
        <div className="flex border-2 border-[#1A1A1A] bg-[#EAEAE8] p-0.5 gap-0.5 shrink-0 self-start lg:self-center">
          <button
            id="tab_trigger_ledger"
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'ledger' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            1. Central Ledger
          </button>
          <button
            id="tab_trigger_history"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            2. Billing & Job History
          </button>
          <button
            id="tab_trigger_generate"
            onClick={handleSelectGenerateTab}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'generate' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <Plus className="w-3 h-3 text-[#FF5A00] mr-0.5" />
            <span>3. Generate Bill</span>
          </button>
          <button
            id="tab_trigger_vendor_ledger"
            onClick={() => {
              setActiveTab('vendor_ledger');
              if (vendors.length > 0 && !selectedLedgerVendorId) {
                setSelectedLedgerVendorId(vendors[0].id);
              }
            }}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'vendor_ledger' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-3 h-3 text-[#FF5A00] mr-0.5" />
            <span>4. Vendor Statement</span>
          </button>
        </div>
      </div>


      {/* ==========================================================================
         A. TAB 1: CENTRAL TRANSACTIONS LEDGER VIEW
         ========================================================================== */}
      {activeTab === 'ledger' && (
        <div id="finance_tab_ledger_content" className="space-y-6 animate-fade-in">

          {/* Bank & Cash Accounts section */}
          <div className="bg-white border-2 border-[#1A1A1A] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#D1D1CF] pb-3 gap-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#FF5A00]" />
                  <span>Bank & Cash Accounts</span>
                </h3>
                <p className="text-[10px] text-gray-500">Attach and track funds across active financial institutions and physical vaults.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setPayoutRef(`PMT-REF-${Math.floor(10000 + Math.random() * 90000)}`);
                    setPayoutDate(new Date().toISOString().split('T')[0]);
                    setIsPayoutOpen(true);
                  }}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Log Payout</span>
                </button>
                <button
                  onClick={() => {
                    setReceiptRef(`REC-REF-${Math.floor(10000 + Math.random() * 90000)}`);
                    setReceiptDate(new Date().toISOString().split('T')[0]);
                    setIsReceiptOpen(true);
                  }}
                  className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Log Receipt</span>
                </button>
                <button
                  onClick={() => setIsAddAccountOpen(true)}
                  className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-gray-800 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Account</span>
                </button>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(account => {
                const liveBalance = getAccountBalance(account);
                return (
                  <div key={account.id} className="border border-[#D1D1CF] p-3 hover:border-[#1A1A1A] transition-colors bg-[#F9F9F7] space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-gray-400 font-bold uppercase font-mono">{account.id}</div>
                        <div className="text-xs font-black text-[#1A1A1A] uppercase">{account.name}</div>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 uppercase ${
                        account.type === 'Bank' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {account.type}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline border-t border-dashed border-[#D1D1CF] pt-2">
                      <span className="text-[9px] text-gray-400 uppercase font-medium">Available Balance:</span>
                      <span className="text-sm font-extrabold text-[#1A1A1A] font-mono">
                        ${liveBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-[9px] text-gray-500 font-mono flex justify-between items-center bg-white/60 px-2 py-1 border border-gray-100">
                      <span>{account.institution || 'N/A'}</span>
                      <span>{account.accountNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Central aggregate cards */}
          <div id="finance_aggregates_grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Credit */}
            <div className="bg-white border-2 border-[#1A1A1A] p-5 flex items-start justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">TOTAL SETTLED CREDITS</span>
                <div className="text-3xl font-black text-green-700 font-sans">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <span className="text-[9px] text-gray-400 block uppercase font-medium">Inbound merchant clearance fee streams</span>
              </div>
              <div className="p-2.5 bg-green-50 border border-green-200 text-green-700">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Total Debit */}
            <div className="bg-white border-2 border-[#1A1A1A] p-5 flex items-start justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">TOTAL DEBITS / COSTS</span>
                <div className="text-3xl font-black text-red-700 font-sans">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <span className="text-[9px] text-gray-400 block uppercase font-medium">Infrastructure node operation fees</span>
              </div>
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            {/* Net Balance */}
            <div className="bg-[#1A1A1A] border-2 border-[#1A1A1A] p-5 flex items-start justify-between text-white shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">NET CONSOLE POOL LIQUIDITY</span>
                <div className="text-3xl font-black text-[#FF5A00] font-sans">${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <span className="text-[9px] text-gray-500 block uppercase font-medium font-mono">Audited vault system balance</span>
              </div>
              <div className="p-2.5 bg-[#2D3136] border border-gray-700 text-[#FF5A00]">
                <Coins className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Core Table */}
          <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
            <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 uppercase font-bold select-none">
              <div className="flex items-center space-x-3">
                <span>Active Clearing Ledger ({filteredFinanceRecords.length} items)</span>
                <span className="text-[10px] text-green-700 font-bold flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                  Ledger Live
                </span>
              </div>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-[10px] text-gray-500 font-bold">FILTER BY ACCOUNT:</span>
                <select
                  value={selectedFilterAccountId}
                  onChange={(e) => setSelectedFilterAccountId(e.target.value)}
                  className="bg-white border border-[#D1D1CF] p-1 text-[11px] font-bold focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A] outline-none"
                >
                  <option value="All">Consolidated Accounts</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — ${getAccountBalance(acc).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAEAE8] border-b border-[#D1D1CF] text-gray-600 uppercase tracking-wider">
                    <th className="p-3">TRANSACTION ID</th>
                    <th className="p-3">CLEARING REF</th>
                    <th className="p-3">LEDGER DESCRIPTION</th>
                    <th className="p-3">ACCOUNT</th>
                    <th className="p-3">SETTLED DATE</th>
                    <th className="p-3">CLASSIFICATION</th>
                    <th className="p-3 text-right">TRANSACTED AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1CF]">
                  {filteredFinanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400 uppercase font-bold bg-gray-50">
                        NO FINANCIAL RECORD ENTRIES IN CURRENT CONSOLE INDEX
                      </td>
                    </tr>
                  ) : (
                    filteredFinanceRecords.map((rec: FinanceRecord) => (
                      <tr key={rec.id} className="hover:bg-[#F9F9F8] transition-colors">
                        <td className="p-3 align-middle font-bold text-[#1A1A1A]">
                          {rec.id}
                        </td>
                        <td className="p-3 align-middle font-semibold text-gray-500 uppercase">
                          {rec.refNo}
                        </td>
                        <td className="p-3 align-middle font-sans font-semibold text-[#1A1A1A]">
                          {rec.description}
                        </td>
                        <td className="p-3 align-middle font-mono text-[10px] font-bold text-gray-600 uppercase">
                          {rec.accountId ? (accounts.find(a => a.id === rec.accountId)?.name || 'Chase Operating Account') : 'Chase Operating Account'}
                        </td>
                        <td className="p-3 align-middle text-gray-500">
                          {rec.date}
                        </td>
                        <td className="p-3 align-middle">
                          <span className={`px-2 py-0.5 font-bold text-[9px] uppercase border inline-flex items-center ${
                            rec.type === 'Credit'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}>
                            {rec.type}
                          </span>
                        </td>
                        <td className={`p-3 align-middle text-right font-black text-sm ${
                          rec.type === 'Credit' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {rec.type === 'Credit' ? '+' : '-'}${rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#1A1A1A] text-white border border-[#2A2A2A] p-4 text-[11px] leading-relaxed font-mono">
            <span className="text-[#FF5A00] font-black uppercase flex items-center space-x-1 mb-1">
              <Check className="w-4 h-4 shrink-0" />
              <span>seiGEN CORE COMPLIANCE STATEMENT</span>
            </span>
            All transactions above are posted in real-time to the distributed merchant clearing buffer. Credits are immediately settled to central pool reserves, and Debits are reconciled against infrastructure operating targets hourly.
          </div>
        </div>
      )}


      {/* ==========================================================================
         B. TAB 2: BILLING & JOB HISTORY DASHBOARD
         ========================================================================== */}
      {activeTab === 'history' && (
        <div id="finance_tab_history_content" className="space-y-6 animate-fade-in">
          
          {/* HISTORY METRIC PANEL */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm">
              <div className="text-[9px] text-gray-500 uppercase font-black">TOTAL ACTIVE BILLS</div>
              <div className="text-2xl font-black text-[#1A1A1A] mt-1 font-sans">
                ${billingStats.totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5 uppercase">
                {filteredBills.filter(b => b.status !== 'Voided').length} active invoices
              </div>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm">
              <div className="text-[9px] text-green-700 uppercase font-black">COLLECTED REVENUE</div>
              <div className="text-2xl font-black text-green-700 mt-1 font-sans">
                ${billingStats.totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5 uppercase">
                {filteredBills.filter(b => b.status === 'Paid').length} paid settlements
              </div>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm">
              <div className="text-[9px] text-amber-700 uppercase font-black">OUTSTANDING RECEIVABLES</div>
              <div className="text-2xl font-black text-amber-600 mt-1 font-sans">
                ${billingStats.totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5 uppercase font-mono">
                {filteredBills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue').length} pending payment
              </div>
            </div>

            <div className="bg-gray-50 border-2 border-[#D1D1CF] p-4 shadow-sm">
              <div className="text-[9px] text-gray-400 uppercase font-black">VOIDED / REVOKED</div>
              <div className="text-2xl font-black text-gray-400 mt-1 font-sans">
                ${billingStats.totalVoided.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5 uppercase font-mono">
                {filteredBills.filter(b => b.status === 'Voided').length} voided/revoked bills
              </div>
            </div>

          </div>

          {/* DYNAMIC CATEGORY BREAKDOWN BARS */}
          <div className="bg-[#EAEAE8] border border-[#D1D1CF] p-4 space-y-3 shadow-sm">
            <h3 className="text-[10px] uppercase font-black text-[#1A1A1A] tracking-wider flex items-center">
              <Tag className="w-3.5 h-3.5 text-[#FF5A00] mr-1.5" />
              <span>Bill Allocation Breakdown by Plan & Professional Jobs</span>
            </h3>

            {billingStats.breakdowns.length === 0 ? (
              <div className="text-[10px] text-gray-500 italic">No active job allocations recorded under current filter.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {billingStats.breakdowns.map((b) => {
                  const percentage = billingStats.totalBilled > 0 ? (b.amount / billingStats.totalBilled) * 100 : 0;
                  return (
                    <div key={b.category} className="bg-white border border-[#D1D1CF] p-2.5 font-mono">
                      <div className="flex justify-between items-center mb-1 text-[9px]">
                        <span className="font-extrabold uppercase text-gray-600">{b.category}</span>
                        <span className="font-bold text-[#1A1A1A]">${b.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-none overflow-hidden border border-gray-200">
                        <div 
                          className="bg-[#FF5A00] h-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-[8px] text-gray-400 mt-0.5">{percentage.toFixed(0)}% of active total</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FILTERING CONTROLS */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-[#D1D1CF] pb-2">
              <Filter className="w-4 h-4 text-[#FF5A00]" />
              <h3 className="text-[10px] font-black uppercase text-[#1A1A1A]">Ledger History Search & Filter</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Filter by Merchant */}
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase font-bold">Filter Merchant:</label>
                <select
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                >
                  <option value="All">All Merchants (All Vendors)</option>
                  {vendors.map((v: Vendor) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                  ))}
                </select>
              </div>

              {/* Filter by Job Category */}
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase font-bold">Filter Job/Task Category:</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                >
                  <option value="All">All Classifications / Jobs</option>
                  <option value="Plan Subscription">Plan Subscription</option>
                  <option value="Marketing Campaign">Marketing Campaign</option>
                  <option value="Stocktake">Stocktake Service</option>
                  <option value="Training">Staff Training</option>
                  <option value="Hardware Audit">Hardware Audit</option>
                  <option value="Support">Professional Support</option>
                  <option value="Other">Other / Custom jobs</option>
                </select>
              </div>

              {/* Filter by Subscription Pricing Plan */}
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase font-bold">Filter Subscription Plan:</label>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                >
                  <option value="All">All Plan Templates</option>
                  {plans.map((p: Plan) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 uppercase font-bold">Clearing Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00]"
                >
                  <option value="All">All statuses (Paid / Unpaid / Voided)</option>
                  <option value="Paid">Paid (Ledger Cleared)</option>
                  <option value="Unpaid">Unpaid (Outstanding)</option>
                  <option value="Overdue">Overdue (Warning Active)</option>
                  <option value="Voided">Voided / Revoked</option>
                </select>
              </div>

            </div>

            <div className="relative pt-2">
              <Search className="absolute left-3 top-5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="SEARCH FOR VENDOR, REF NO, BILL ID, OR DETAILED DESCRIPTION..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] py-2 pl-9 pr-4 text-xs font-semibold uppercase focus:outline-none focus:border-[#FF5A00]"
              />
            </div>
          </div>

          {/* LIST TABLE */}
          <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
            <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] font-bold text-gray-500 flex justify-between items-center">
              <span className="uppercase">BILLING ARCHIVE & COMPLIANCE HISTORY ({filteredBills.length} BILLS FOUND)</span>
              <span className="text-[9px] text-gray-400 font-mono">seiGEN AUDITED ARCHIVE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAEAE8] border-b border-[#D1D1CF] text-gray-600 uppercase tracking-wider">
                    <th className="p-3">INVOICE ID</th>
                    <th className="p-3">MERCHANT VENDOR</th>
                    <th className="p-3">JOB CLASSIFICATION</th>
                    <th className="p-3">SERVICE DESCRIPTION</th>
                    <th className="p-3">ISSUE / DUE</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">TOTAL PRICE</th>
                    <th className="p-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1CF]">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-gray-400 uppercase font-bold bg-gray-50">
                        NO ACCOUNTING BILL RECORDS MATCHING FILTER PARAMETERS
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr 
                        key={bill.id} 
                        className={`hover:bg-[#F9F9F8] transition-colors ${bill.status === 'Voided' ? 'bg-gray-50 text-gray-400 line-through' : ''}`}
                      >
                        <td className="p-3 align-middle font-bold text-[#1A1A1A]">
                          <div className="flex flex-col space-y-0.5">
                            <span>{bill.id}</span>
                            <span className="text-[8px] font-normal text-gray-400 font-mono">{bill.refNo}</span>
                          </div>
                        </td>
                        
                        <td className="p-3 align-middle">
                          <div className="flex items-center space-x-1.5 font-sans font-bold text-[#1A1A1A]">
                            <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{bill.vendorName}</span>
                          </div>
                        </td>

                        <td className="p-3 align-middle">
                          <div className="flex flex-col space-y-1">
                            <span className={`px-2 py-0.5 rounded-sm font-extrabold text-[8px] uppercase border inline-flex items-center w-max ${
                              bill.status === 'Voided' ? 'bg-gray-100 border-gray-300 text-gray-400' :
                              bill.category === 'Plan Subscription' ? 'bg-orange-50 border-orange-200 text-[#FF5A00]' :
                              bill.category === 'Marketing Campaign' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                              bill.category === 'Stocktake' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                              bill.category === 'Training' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                              bill.category === 'Hardware Audit' ? 'bg-cyan-50 border-cyan-200 text-cyan-700' :
                              'bg-gray-50 border-gray-200 text-gray-700'
                            }`}>
                              {bill.category}
                            </span>
                            {bill.planName && (
                              <span className="text-[9px] text-gray-400 font-bold uppercase">
                                Plan: {bill.planName}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 align-middle font-sans text-gray-600 max-w-xs truncate">
                          {bill.description}
                        </td>

                        <td className="p-3 align-middle text-gray-500">
                          <div className="space-y-0.5 font-mono text-[10px]">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 text-gray-300 mr-1 shrink-0" />
                              <span>IN: {bill.issueDate}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 text-gray-300 mr-1 shrink-0" />
                              <span className="font-bold text-gray-600">DUE: {bill.dueDate}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 align-middle">
                          <span className={`px-2 py-1 font-black text-[9px] uppercase inline-flex items-center border ${
                            bill.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-300' :
                            bill.status === 'Unpaid' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            bill.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-300' :
                            'bg-gray-100 text-gray-400 border-gray-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 mr-1.5 ${
                              bill.status === 'Paid' ? 'bg-green-500' :
                              bill.status === 'Unpaid' ? 'bg-amber-500' :
                              bill.status === 'Overdue' ? 'bg-red-500' :
                              'bg-gray-400'
                            }`} />
                            {bill.status}
                          </span>
                        </td>

                        <td className="p-3 align-middle text-right font-black text-[#1A1A1A] font-sans">
                          ${bill.amount.toFixed(2)}
                        </td>

                        <td className="p-3 align-middle">
                          <div className="flex items-center justify-center space-x-1.5">
                            {bill.status !== 'Paid' && bill.status !== 'Voided' && (
                              <>
                                <button
                                  onClick={() => handleQuickMarkAsPaid(bill)}
                                  className="px-2 py-1 bg-green-700 hover:bg-green-800 text-white font-bold text-[9px] uppercase transition-colors shrink-0 cursor-pointer rounded-none border border-transparent"
                                  title="Approve Payment"
                                >
                                  Pay
                                </button>
                                <button
                                  onClick={() => handleVoidBill(bill)}
                                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[9px] uppercase transition-colors shrink-0 cursor-pointer rounded-none border border-transparent flex items-center space-x-1"
                                  title="Void Bill"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Void</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedInvoice(bill);
                                setIsCheckoutOpen(false);
                                setIsCheckoutSuccess(false);
                              }}
                              className="px-2 py-1 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-bold text-[9px] uppercase transition-colors shrink-0 cursor-pointer rounded-none"
                              title="Print View"
                            >
                              Preview
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


      {/* ==========================================================================
         C. TAB 3: GENERATE DETAILED VENDOR BILL
         ========================================================================== */}
      {activeTab === 'generate' && (
        <div id="finance_tab_generate_content" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* FORM PANEL (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleGenerateBill} className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-6">
              
              <div className="border-b border-[#D1D1CF] pb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-[#FF5A00]" />
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#1A1A1A]">Vendor Bill Generation Form</h2>
                    <p className="text-[10px] text-gray-500">DEBIT OR FEE ASSIGNMENT CONSOLE</p>
                  </div>
                </div>
                <div className="bg-[#FF5A00]/10 text-[#FF5A00] font-mono px-2.5 py-0.5 text-[9px] font-bold uppercase border border-[#FF5A00]/20">
                  Secured SGN-Billing
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* select vendor */}
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-black">1. Target Merchant Vendor:</label>
                  <select
                    value={formVendorId}
                    onChange={(e) => setFormVendorId(e.target.value)}
                    required
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase"
                  >
                    <option value="" disabled>-- CHOOSE MERCHANT --</option>
                    {vendors.map((v: Vendor) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.id}) — [{v.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* select job category */}
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-black">2. Job Category / Billing Type:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setFormCategory(cat);
                      if (cat !== 'Plan Subscription') {
                        setFormPlanId('');
                        setFormAmount('');
                        setFormCustomDescription('');
                      } else if (plans.length > 0) {
                        handlePlanChange(plans[0].id);
                      }
                    }}
                    required
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase"
                  >
                    <option value="Plan Subscription">Plan Subscription</option>
                    <option value="Marketing Campaign">Marketing Campaign</option>
                    <option value="Stocktake">Stocktake Service</option>
                    <option value="Training">Staff Training Course</option>
                    <option value="Hardware Audit">Hardware Audit</option>
                    <option value="Support">Professional Support</option>
                    <option value="Other">Other / Custom Job</option>
                  </select>
                </div>

                {/* plan selection (only shown if Plan Subscription) */}
                {formCategory === 'Plan Subscription' && (
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-gray-500 uppercase font-black">2a. Associate Subscription Pricing Plan:</label>
                    <select
                      value={formPlanId}
                      onChange={(e) => handlePlanChange(e.target.value)}
                      required
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-bold uppercase"
                    >
                      <option value="" disabled>-- SELECT PLAN SLAB --</option>
                      {plans.map((p: Plan) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price}/Mo [Terminals: {p.maxTerminals || 'Unlimited'}]
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* bill description */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-gray-500 uppercase font-black">3. Service Description / Job details:</label>
                  <input
                    type="text"
                    value={formCustomDescription}
                    onChange={(e) => setFormCustomDescription(e.target.value)}
                    required
                    placeholder={
                      formCategory === 'Marketing Campaign' ? 'e.g. Q3 geo-marketing advertising push and flyer design bundle' :
                      formCategory === 'Stocktake' ? 'e.g. End of year physical inventory count and variance audit sync' :
                      formCategory === 'Training' ? 'e.g. Advanced cashier cashier checkout terminal certification course' :
                      'e.g. Custom professional technical service invoice description'
                    }
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs font-semibold focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                {/* amount */}
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-black">4. Billed Price Settle Amount ($ USD):</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 500.00"
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] py-2.5 pl-7 pr-3 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                </div>

                {/* issue date */}
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-black">5. Billing Issue Date:</label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    required
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none focus:border-[#FF5A00] uppercase"
                  />
                </div>

                {/* due date */}
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-black">6. Payment Settle Due Date:</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs focus:outline-none focus:border-[#FF5A00] uppercase"
                  />
                </div>

                {/* custom internal notes */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-gray-500 uppercase font-black">7. Private Audit Compliance Notes (Internal):</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Enter proprietary information regarding this debit or clearance agreement..."
                    rows={3}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs font-medium focus:outline-none focus:border-[#FF5A00] resize-none"
                  />
                </div>

              </div>

              {/* Form Submission Action */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 bg-[#FF5A00] hover:bg-[#1A1A1A] text-white font-sans font-black text-xs py-3 px-6 uppercase tracking-wider transition-all rounded-none cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Vendor Bill Invoice</span>
                </button>
              </div>

            </form>
          </div>

          {/* DESCRIPTIVE TOOLBAR PANEL (4 columns) */}
          <div className="lg:col-span-4 space-y-6 font-mono">
            
            <div className="bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] p-5 space-y-4">
              <div className="text-[#FF5A00] font-black uppercase text-xs flex items-center">
                <Bookmark className="w-4 h-4 mr-1.5" />
                <span>Job Billing Guild</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                This console authorizes the iTred Clearing Administrator to post professional jobs or subscription fee bills to third-party merchants.
              </p>

              <div className="border-t border-[#2D2D2D] pt-4 space-y-3">
                <div className="flex items-start space-x-2 text-[10px]">
                  <div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-full mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white uppercase block">Marketing Campaigns:</span>
                    <span className="text-gray-400">Covers digital and physical advert displays pushed to connected client terminals.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-[10px]">
                  <div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-full mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white uppercase block">Stocktakes:</span>
                    <span className="text-gray-400">Inventory audits matching physical store stocks to automated SGN ledger records.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-[10px]">
                  <div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-full mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white uppercase block">Certifications:</span>
                    <span className="text-gray-400">Operator security courseware training sessions to qualify terminal personnel.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-5 space-y-2">
              <h4 className="text-[9px] uppercase font-black text-gray-500">Live Invoice Settle Preview</h4>
              <div className="p-3 bg-[#F4F4F1] border border-[#D1D1CF] space-y-2">
                <div className="flex justify-between items-center font-bold text-[#1A1A1A]">
                  <span className="uppercase text-[9px]">PREVIEW TOTAL</span>
                  <span className="text-sm">${formAmount ? parseFloat(formAmount).toFixed(2) : '0.00'}</span>
                </div>
                <div className="text-[9px] text-gray-400 leading-normal border-t border-dotted border-gray-300 pt-2">
                  Due in 30 days. Mark as Paid from History once merchant settlement checks clear.
                </div>
              </div>
            </div>

          </div>

        </div>
      )}


      {/* ==========================================================================
         D. TAB 4: VENDOR LEDGER STATEMENTS
         ========================================================================== */}
      {activeTab === 'vendor_ledger' && (
        <div id="finance_tab_vendor_ledger_content" className="space-y-6 animate-fade-in">
          
          {/* SELECT VENDOR */}
          <div className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-[#FF5A00]" />
              <h3 className="text-xs font-black uppercase text-[#1A1A1A]">Select Vendor Account for Consolidated Ledger Statement</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-1 w-full sm:max-w-md">
                <label className="text-[9px] text-gray-500 uppercase font-bold">Account Name / Code:</label>
                <select
                  value={selectedLedgerVendorId}
                  onChange={(e) => setSelectedLedgerVendorId(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs font-bold uppercase focus:outline-none focus:border-[#FF5A00]"
                >
                  <option value="" disabled>-- CHOOSE VENDOR ACCOUNT --</option>
                  {vendors.map((v: Vendor) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.id}) — Joined: {v.joinedDate}
                    </option>
                  ))}
                </select>
              </div>

              {vendorLedgerData && (
                <button
                  onClick={handlePrintLedgerStatement}
                  className="px-5 py-2.5 bg-[#FF5A00] hover:bg-[#1A1A1A] text-white font-sans font-black text-xs uppercase tracking-wider transition-all rounded-none cursor-pointer flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Account Ledger Statement</span>
                </button>
              )}
            </div>
          </div>

          {/* NO VENDOR SELECTED */}
          {!vendorLedgerData ? (
            <div className="bg-white border-2 border-dashed border-[#D1D1CF] p-12 text-center text-gray-400 uppercase font-black">
              PLEASE CHOOSE A ACTIVE MERCHANT VENDOR TO COMPILE BALANCE STATEMENTS
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              
              {/* LEDGER STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm">
                  <div className="text-[9px] text-gray-500 uppercase font-black">ACTIVE INVOICED DUES</div>
                  <div className="text-2xl font-black text-[#1A1A1A] mt-1 font-sans">
                    ${vendorLedgerData.invoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-gray-400 mt-0.5 uppercase">
                    From {vendorLedgerData.bills.filter(b => b.status !== 'Voided').length} active docs
                  </div>
                </div>

                <div className="bg-white border-2 border-green-700 p-4 shadow-sm">
                  <div className="text-[9px] text-green-700 uppercase font-black">CLEARED PAYMENTS</div>
                  <div className="text-2xl font-black text-green-700 mt-1 font-sans">
                    ${vendorLedgerData.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-gray-400 mt-0.5 uppercase">
                    {vendorLedgerData.bills.filter(b => b.status === 'Paid').length} paid settlements
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-500 p-4 shadow-sm">
                  <div className="text-[9px] text-amber-800 uppercase font-black">OUTSTANDING BALANCE</div>
                  <div className="text-2xl font-black text-amber-700 mt-1 font-sans">
                    ${vendorLedgerData.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5 uppercase">
                    Dues pending receipt clearance
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-200 p-4 shadow-sm">
                  <div className="text-[9px] text-red-700 uppercase font-black">VOIDED / REVOKED</div>
                  <div className="text-2xl font-black text-red-700 mt-1 font-sans">
                    ${vendorLedgerData.voidedAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-gray-400 mt-0.5 uppercase">
                    {vendorLedgerData.bills.filter(b => b.status === 'Voided').length} voided documents
                  </div>
                </div>

              </div>

              {/* VENDOR DETAILED TRANSACTIONS TABLE */}
              <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
                <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] font-bold text-gray-500 flex justify-between items-center uppercase">
                  <span>Statements Account Entries • {vendorLedgerData.vendor.name}</span>
                  <span className="text-[9px] font-mono font-bold text-gray-400">seiGEN COMPLIANT STATEMENT</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#EAEAE8] border-b border-[#D1D1CF] text-gray-600 uppercase tracking-wider">
                        <th className="p-3">DOC ID</th>
                        <th className="p-3">REFERENCE</th>
                        <th className="p-3">ISSUE DATE</th>
                        <th className="p-3">CLASSIFICATION</th>
                        <th className="p-3 font-sans">DESCRIPTION</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-right">PRICE (USD)</th>
                        <th className="p-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1D1CF]">
                      {vendorLedgerData.bills.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-gray-400 uppercase font-bold bg-gray-50">
                            NO ACCOUNT TRANSACTION ENTRIES RECORDED FOR THIS MERCHANT VENDOR
                          </td>
                        </tr>
                      ) : (
                        vendorLedgerData.bills.map((b) => (
                          <tr 
                            key={b.id} 
                            className={`hover:bg-[#F9F9F8] transition-colors ${b.status === 'Voided' ? 'bg-gray-50 text-gray-400 line-through' : ''}`}
                          >
                            <td className="p-3 align-middle font-bold text-[#1A1A1A]">{b.id}</td>
                            <td className="p-3 align-middle font-mono font-bold text-gray-400">{b.refNo}</td>
                            <td className="p-3 align-middle text-gray-500">{b.issueDate}</td>
                            <td className="p-3 align-middle">
                              <span className={`px-2 py-0.5 rounded-sm font-extrabold text-[8px] uppercase border inline-flex items-center w-max ${
                                b.status === 'Voided' ? 'bg-gray-100 border-gray-300 text-gray-400' :
                                b.category === 'Plan Subscription' ? 'bg-orange-50 border-orange-200 text-[#FF5A00]' :
                                b.category === 'Marketing Campaign' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                b.category === 'Stocktake' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                b.category === 'Training' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                b.category === 'Hardware Audit' ? 'bg-cyan-50 border-cyan-200 text-cyan-700' :
                                'bg-gray-50 border-gray-200 text-gray-700'
                              }`}>
                                {b.category}
                              </span>
                            </td>
                            <td className="p-3 align-middle font-sans max-w-sm truncate text-[#1A1A1A] font-semibold">{b.description}</td>
                            <td className="p-3 align-middle font-bold">
                              <span className={`px-2 py-0.5 font-bold uppercase border text-[9px] ${
                                b.status === 'Paid' ? 'bg-green-50 border-green-200 text-green-700' :
                                b.status === 'Unpaid' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                b.status === 'Overdue' ? 'bg-red-50 border-red-200 text-red-700' :
                                'bg-gray-100 border-gray-200 text-gray-400'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-3 align-middle text-right font-black font-sans text-[#1A1A1A]">${b.amount.toFixed(2)}</td>
                            <td className="p-3 align-middle text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(b);
                                    setIsCheckoutOpen(false);
                                    setIsCheckoutSuccess(false);
                                  }}
                                  className="px-2 py-1 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-bold text-[9px] uppercase cursor-pointer rounded-none"
                                >
                                  View
                                </button>
                                {b.status !== 'Voided' && b.status !== 'Paid' && (
                                  <button
                                    onClick={() => handleVoidBill(b)}
                                    className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 font-bold text-[9px] uppercase cursor-pointer rounded-none border border-transparent"
                                  >
                                    Void
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

        </div>
      )}


      {/* ==========================================================================
         E. DETAILED INVOICE LIGHTBOX / MODAL
         ========================================================================== */}
      {selectedInvoice && (
        <div id="invoice_modal_overlay" className="fixed inset-0 z-50 bg-[#1A1A1A]/85 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-mono">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-2xl shadow-2xl relative select-text my-8">
            
            {/* Modal Header Controls */}
            <div className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center select-none">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-[#FF5A00]" />
                <span className="font-black text-xs uppercase tracking-wider">iTred Ecosystem Billing System</span>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkout Form or Invoice Details Sheet */}
            {isCheckoutSuccess ? (
              <div className="p-8 space-y-4 text-center">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black font-sans uppercase tracking-wider text-green-700">Checkout Successful</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                  Clearance checks approved! Outstanding invoice <strong>{selectedInvoice.id}</strong> has been cleared. The settled amount of <strong>${selectedInvoice.amount.toFixed(2)}</strong> has been credited to the central ledger pool.
                </p>
                
                <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-4 text-left max-w-xs mx-auto text-[11px] space-y-1 font-mono">
                  <div><strong>RECIPT REF:</strong> {checkoutRef}</div>
                  <div><strong>METHOD:</strong> {checkoutPaymentMethod}</div>
                  <div><strong>SETTLED DATE:</strong> {checkoutDate}</div>
                  <div><strong>SETTLED BY:</strong> {checkoutRepresentative}</div>
                  <div><strong>AMOUNT:</strong> ${selectedInvoice.amount.toFixed(2)}</div>
                </div>

                <div className="flex justify-center space-x-3 pt-4">
                  <button
                    onClick={() => handlePrintReceipt(selectedInvoice)}
                    className="flex items-center space-x-1 border border-green-700 hover:bg-green-50 text-green-700 font-bold px-4 py-2 uppercase text-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Checkout Receipt</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCheckoutSuccess(false);
                      setSelectedInvoice(null);
                    }}
                    className="bg-[#1A1A1A] text-white hover:bg-gray-800 font-bold px-4 py-2 uppercase text-xs transition-colors cursor-pointer"
                  >
                    Close Terminal
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Printable Invoice Sheet content */}
                <div id="printable_invoice_sheet" className="p-8 space-y-6 text-xs text-[#1A1A1A] relative">
                  
                  {/* Void Watermark if Voided */}
                  {selectedInvoice.status === 'Voided' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                      <div className="text-red-600 border-8 border-red-600 font-sans font-black text-7xl tracking-widest rotate-12 uppercase p-4">
                        VOIDED
                      </div>
                    </div>
                  )}

                  {/* Corporate Branding / Address */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-[#D1D1CF] pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-[#FF5A00]" />
                        <span className="text-sm font-black font-sans uppercase tracking-tight">seiGEN iTred Clearing</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                        Clearing Node: seiGEN_04_PROD<br />
                        Central Liquidity Buffer Node<br />
                        Frankfurt - Chicago - Tokyo Gateway Network
                      </p>
                    </div>

                    <div className="text-left sm:text-right space-y-1 font-mono">
                      <h2 className="text-lg font-black font-sans uppercase tracking-wide text-[#FF5A00] leading-none mb-1">INVOICE</h2>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">NO: {selectedInvoice.id}</div>
                      <div className="text-[10px] text-gray-500 uppercase">REF: {selectedInvoice.refNo}</div>
                    </div>
                  </div>

                  {/* Merchant / Vendor Metadata Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F4F4F1] border border-[#D1D1CF] p-4">
                    
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-gray-400 uppercase font-black block">BILL FROM (Clearing Operator):</span>
                      <div className="font-sans font-bold text-[11px] text-[#1A1A1A]">iTred Commerce Clearing Authority</div>
                      <div className="text-gray-500 space-y-0.5 text-[10px]">
                        <div className="flex items-center"><Mail className="w-3 h-3 text-gray-400 mr-1.5 shrink-0" /> operations@itred-sgn.net</div>
                        <div className="flex items-center"><MapPin className="w-3 h-3 text-gray-400 mr-1.5 shrink-0" /> Frankfurt Edge-01 Co-location</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] text-gray-400 uppercase font-black block">BILL TO (Merchant Vendor):</span>
                      <div className="font-sans font-bold text-[11px] text-[#FF5A00]">{selectedInvoice.vendorName}</div>
                      
                      {/* Resolve vendor full info from state if possible */}
                      {(() => {
                        const vend = vendors.find((v: Vendor) => v.id === selectedInvoice.vendorId);
                        return (
                          <div className="text-gray-500 space-y-0.5 text-[10px]">
                            <div className="flex items-center"><Mail className="w-3 h-3 text-gray-400 mr-1.5 shrink-0" /> {vend?.email || 'ops@merchant.com'}</div>
                            <div className="flex items-center"><MapPin className="w-3 h-3 text-gray-400 mr-1.5 shrink-0" /> {vend?.location || 'Registered Global Gateway'}</div>
                            <div className="flex items-center"><Building className="w-3 h-3 text-gray-400 mr-1.5 shrink-0" /> Vendor ID: {selectedInvoice.vendorId}</div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                  {/* Dates & Status Overview Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center font-mono py-1">
                    
                    <div className="bg-white border border-[#D1D1CF] p-2">
                      <div className="text-[8px] text-gray-400 uppercase font-bold">DATE OF INVOICE</div>
                      <div className="font-bold text-gray-700 mt-0.5">{selectedInvoice.issueDate}</div>
                    </div>

                    <div className="bg-white border border-[#D1D1CF] p-2">
                      <div className="text-[8px] text-gray-400 uppercase font-bold">PAYMENT DUE DATE</div>
                      <div className="font-bold text-gray-700 mt-0.5">{selectedInvoice.dueDate}</div>
                    </div>

                    <div className="bg-white border border-[#D1D1CF] p-2">
                      <div className="text-[8px] text-gray-400 uppercase font-bold">CLEARING STATUS</div>
                      <div className={`font-black uppercase text-[10px] mt-0.5 ${
                        selectedInvoice.status === 'Paid' ? 'text-green-700' : 
                        selectedInvoice.status === 'Voided' ? 'text-red-600 line-through' : 'text-amber-600'
                      }`}>
                        {selectedInvoice.status}
                      </div>
                    </div>

                  </div>

                  {/* Itemized Invoice table */}
                  <div className="border border-[#1A1A1A]">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="bg-[#1A1A1A] text-white uppercase text-[9px] tracking-wider">
                          <th className="p-2.5">CLASSIFICATION</th>
                          <th className="p-2.5">LINE ITEM & JOB DESCRIPTION</th>
                          <th className="p-2.5 text-right">QTY</th>
                          <th className="p-2.5 text-right">NET PRICE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#D1D1CF] hover:bg-gray-50">
                          <td className="p-3 font-black text-gray-600 uppercase">
                            {selectedInvoice.category}
                          </td>
                          <td className="p-3">
                            <div className="font-sans font-bold text-[#1A1A1A]">{selectedInvoice.description}</div>
                            {selectedInvoice.planName && (
                              <div className="text-[9px] text-gray-400 uppercase mt-0.5">Assigned Subscription: {selectedInvoice.planName}</div>
                            )}
                          </td>
                          <td className="p-3 text-right font-bold">1</td>
                          <td className="p-3 text-right font-bold text-sm">${selectedInvoice.amount.toFixed(2)}</td>
                        </tr>
                        
                        {/* Subtotals */}
                        <tr className="bg-gray-50 border-t border-gray-300">
                          <td colSpan={2} />
                          <td className="p-2 text-right font-extrabold text-gray-500 uppercase text-[9px]">SUBTOTAL:</td>
                          <td className="p-2 text-right font-bold">${selectedInvoice.amount.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td colSpan={2} />
                          <td className="p-2 text-right font-extrabold text-gray-500 uppercase text-[9px]">VAT / SURCHARGE:</td>
                          <td className="p-2 text-right font-bold">$0.00</td>
                        </tr>
                        <tr className="bg-[#1A1A1A] text-white">
                          <td colSpan={2} className="p-3 text-[10px] uppercase font-bold text-gray-400">
                            CRYPTOGRAPHICALLY SIGNED SETTLEMENT INBOUND
                          </td>
                          <td className="p-3 text-right font-black uppercase text-[10px]">TOTAL DUE:</td>
                          <td className="p-3 text-right font-black text-base text-[#FF5A00] font-sans">${selectedInvoice.amount.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Private Notes block */}
                  {selectedInvoice.notes && (
                    <div className="bg-amber-50/50 border border-amber-200 p-3 leading-relaxed">
                      <div className="text-[9px] font-extrabold text-amber-800 uppercase flex items-center mb-0.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 mr-1 shrink-0" />
                        <span>Clearing Settle Memo (Internal Notes):</span>
                      </div>
                      <p className="text-gray-600 text-[10px] font-mono italic">"{selectedInvoice.notes}"</p>
                    </div>
                  )}

                  {/* Cryptography Signature Block */}
                  <div className="border-t border-dashed border-[#D1D1CF] pt-4 flex justify-between items-center text-[8px] text-gray-400">
                    <div>
                      KMS AUTHORITY: VANCE-KMS-004<br />
                      SECURE HASH: SHA256-SGN-{selectedInvoice.refNo.substring(4)}
                    </div>
                    <div className="text-right">
                      POWERED BY iTred CONSOLE<br />
                      seiGEN COMMERCE CORE
                    </div>
                  </div>

                </div>

                {/* Apply Payment form inside the lightbox */}
                {isCheckoutOpen && (
                  <div className="bg-[#F0FDF4] border-t-4 border-green-700 p-6 space-y-4 animate-fade-in font-mono text-xs select-none">
                    <div className="flex items-center justify-between border-b border-green-200 pb-2">
                      <div className="flex items-center space-x-1.5 text-green-800 font-extrabold text-[10px] uppercase">
                        <DollarSign className="w-4 h-4 text-green-700" />
                        <span>Authorized Clearing Checkout Terminal</span>
                      </div>
                      <button 
                        onClick={() => setIsCheckoutOpen(false)}
                        className="text-gray-500 hover:text-black font-bold text-[9px] uppercase cursor-pointer"
                      >
                        [Cancel]
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <label className="text-[8px] text-gray-400 uppercase font-bold">Deposit to Account:</label>
                        <select
                          value={checkoutAccountId}
                          onChange={(e: any) => setCheckoutAccountId(e.target.value)}
                          className="w-full bg-white border border-green-300 p-2 text-xs font-bold uppercase focus:outline-none focus:border-green-700"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name} — ${getAccountBalance(acc).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <label className="text-[8px] text-gray-400 uppercase font-bold">Payment Clearing Method:</label>
                        <select
                          value={checkoutPaymentMethod}
                          onChange={(e: any) => setCheckoutPaymentMethod(e.target.value)}
                          className="w-full bg-white border border-green-300 p-2 text-xs font-bold uppercase focus:outline-none focus:border-green-700"
                        >
                          <option value="Ledger">Direct Ledger Credit Settle</option>
                          <option value="ACH">ACH / Bank Direct Wire</option>
                          <option value="Cash">Cash Settle Gateway</option>
                          <option value="Voucher">Cryptographic Voucher Voucher</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] text-gray-400 uppercase font-bold">Clearing Officer Name:</label>
                        <input
                          type="text"
                          value={checkoutRepresentative}
                          onChange={(e) => setCheckoutRepresentative(e.target.value)}
                          className="w-full bg-white border border-green-300 p-2 text-xs font-semibold focus:outline-none focus:border-green-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] text-gray-400 uppercase font-bold">Settle Reference ID:</label>
                        <input
                          type="text"
                          value={checkoutRef}
                          onChange={(e) => setCheckoutRef(e.target.value)}
                          className="w-full bg-white border border-green-300 p-2 text-xs font-bold font-mono uppercase focus:outline-none focus:border-green-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] text-gray-400 uppercase font-bold">Clearing Settlement Date:</label>
                        <input
                          type="date"
                          value={checkoutDate}
                          onChange={(e) => setCheckoutDate(e.target.value)}
                          className="w-full bg-white border border-green-300 p-2 text-xs uppercase focus:outline-none focus:border-green-700"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-[8px] text-gray-400 uppercase font-bold">Clearing Memo / Checkout Comments:</label>
                        <input
                          type="text"
                          value={checkoutMemo}
                          onChange={(e) => setCheckoutMemo(e.target.value)}
                          className="w-full bg-white border border-green-300 p-2 text-xs focus:outline-none focus:border-green-700"
                        />
                      </div>

                    </div>

                    <button
                      onClick={() => handleProcessCheckout(selectedInvoice)}
                      className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-sans font-black uppercase text-xs tracking-wider transition-colors cursor-pointer"
                    >
                      Authorize Clearance & Checkout (${selectedInvoice.amount.toFixed(2)})
                    </button>
                  </div>
                )}

                {/* Modal Bottom Actions */}
                <div className="bg-[#F4F4F1] border-t border-[#D1D1CF] p-4 flex flex-col sm:flex-row sm:justify-between items-center gap-3 select-none">
                  
                  <div className="flex items-center space-x-2">
                    {selectedInvoice.status !== 'Paid' && selectedInvoice.status !== 'Voided' ? (
                      <>
                        <button
                          onClick={() => handleOpenCheckout(selectedInvoice)}
                          className="flex items-center space-x-1.5 bg-green-700 hover:bg-green-800 text-white font-sans font-black text-xs py-2.5 px-4 uppercase transition-all rounded-none cursor-pointer"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Apply Payment / Checkout</span>
                        </button>
                        <button
                          onClick={() => handleVoidBill(selectedInvoice)}
                          className="flex items-center space-x-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-sans font-black text-xs py-2.5 px-4 uppercase transition-all rounded-none cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Void / Revoke</span>
                        </button>
                      </>
                    ) : (
                      <span className={`font-extrabold text-[10px] uppercase flex items-center ${
                        selectedInvoice.status === 'Paid' ? 'text-green-700' : 'text-red-600'
                      }`}>
                        {selectedInvoice.status === 'Paid' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> 
                            <span>PAID & RECONCILED IN CENTRAL LEDGER</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4 mr-1.5" /> 
                            <span>DOCUMENT VOIDED AND RECONCILED FROM RECEIVABLES</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {selectedInvoice.status !== 'Voided' && (
                      <button
                        onClick={() => {
                          const win = window.open("", "_blank");
                          if (win) {
                            const sheet = document.getElementById("printable_invoice_sheet")?.innerHTML || "";
                            win.document.write(`
                              <html>
                                <head>
                                  <title>Invoice - ${selectedInvoice.id}</title>
                                  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
                                  <style>
                                    body { font-family: 'JetBrains Mono', monospace; padding: 40px; background: white; color: #1A1A1A; font-size: 11px; }
                                    .font-sans { font-family: 'Inter', sans-serif; }
                                    .text-right { text-align: right; }
                                    .text-center { text-align: center; }
                                    .flex { display: flex; }
                                    .flex-col { flex-direction: column; }
                                    .justify-between { justify-content: space-between; }
                                    .items-start { align-items: flex-start; }
                                    .grid { display: grid; }
                                    .grid-cols-2 { grid-template-cols: 1fr 1fr; }
                                    .grid-cols-3 { grid-template-cols: 1fr 1fr 1fr; }
                                    .gap-6 { gap: 24px; }
                                    .gap-4 { gap: 16px; }
                                    .gap-2 { gap: 8px; }
                                    .border-b { border-bottom: 1px solid #D1D1CF; }
                                    .pb-6 { padding-bottom: 24px; }
                                    .bg-gray-100 { background: #F4F4F1; }
                                    .p-4 { padding: 16px; }
                                    .p-2 { padding: 8px; }
                                    .p-3 { padding: 12px; }
                                    .p-2-5 { padding: 10px; }
                                    .border { border: 1px solid #D1D1CF; }
                                    .w-full { width: 100%; }
                                    .border-collapse { border-collapse: collapse; }
                                    .bg-dark { background: #1A1A1A; color: white; }
                                    .text-orange { color: #FF5A00; }
                                    .font-bold { font-weight: bold; }
                                    .font-black { font-weight: 900; }
                                    .uppercase { text-transform: uppercase; }
                                    .text-sm { font-size: 13px; }
                                    .text-lg { font-size: 18px; }
                                    .text-base { font-size: 15px; }
                                    .mt-0-5 { margin-top: 2px; }
                                    .mb-1 { margin-bottom: 4px; }
                                    .bg-amber-50 { background: #FFFBEB; border: 1px solid #FDE68A; }
                                    .italic { font-style: italic; }
                                    @media print {
                                      body { padding: 0; }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="font-sans">${sheet}</div>
                                  <script>
                                    window.onload = function() { window.print(); }
                                  </script>
                                </body>
                              </html>
                            `);
                            win.document.close();
                          }
                        }}
                        className="flex items-center space-x-1 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-sans font-bold text-xs py-2 px-4 uppercase transition-all rounded-none cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Invoice</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="bg-[#1A1A1A] hover:bg-gray-800 text-white font-sans font-bold text-xs py-2 px-4 uppercase transition-all rounded-none cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ==========================================================================
         FLOATING MODAL: LOG PAYOUT (PAYMENT)
         ========================================================================== */}
      {isPayoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-mono">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-lg shadow-2xl relative text-left text-gray-800">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center select-none">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-white" />
                <span className="font-black text-xs uppercase tracking-wider text-white">Log System Payout Terminal</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsPayoutOpen(false)}
                className="text-white hover:bg-red-800 p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayout} className="p-6 space-y-4">
              <div className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">SOURCE BANK/CASH ACCOUNT:</label>
                    <select
                      value={payoutAccountId}
                      onChange={(e) => setPayoutAccountId(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold uppercase focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} — ${getAccountBalance(acc).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">PAYEE (RECIPIENT):</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AWS Cloud Services"
                      value={payoutPayee}
                      onChange={(e) => setPayoutPayee(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">PAYOUT AMOUNT ($ USD):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">CLASSIFICATION CATEGORY:</label>
                    <select
                      value={payoutCategory}
                      onChange={(e) => setPayoutCategory(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold uppercase focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    >
                      <option value="Operational Cost">Operational Cost</option>
                      <option value="Hardware Purchase">Hardware Purchase</option>
                      <option value="Marketing Campaign">Marketing Campaign</option>
                      <option value="Salary & Wages">Salary & Wages</option>
                      <option value="Rent & Lease">Rent & Lease</option>
                      <option value="Maintenance & Utilities">Maintenance & Utilities</option>
                      <option value="Other Expense">Other Expense</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">TRANSACTION DATE:</label>
                    <input
                      type="date"
                      required
                      value={payoutDate}
                      onChange={(e) => setPayoutDate(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">PAYOUT REFERENCE NO:</label>
                    <input
                      type="text"
                      required
                      value={payoutRef}
                      onChange={(e) => setPayoutRef(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold focus:outline-none focus:border-[#1A1A1A] text-gray-800 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-bold">PAYOUT MEMO / DESCRIPTION:</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide operational description of payout..."
                    value={payoutDescription}
                    onChange={(e) => setPayoutDescription(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] resize-none text-gray-800"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-[#D1D1CF]">
                <button
                  type="button"
                  onClick={() => setIsPayoutOpen(false)}
                  className="px-4 py-2 border border-[#1A1A1A] text-[#1A1A1A] font-bold uppercase text-[10px] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold uppercase text-[10px] cursor-pointer"
                >
                  Commit Payout Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
         FLOATING MODAL: LOG OTHER RECEIPT
         ========================================================================== */}
      {isReceiptOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-mono">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-lg shadow-2xl relative text-left text-gray-800">
            <div className="bg-green-700 text-white p-4 flex justify-between items-center select-none">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="font-black text-xs uppercase tracking-wider text-white">Log Cash/Bank Receipt Terminal</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="text-white hover:bg-green-800 p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReceipt} className="p-6 space-y-4">
              <div className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">DESTINATION ACCOUNT:</label>
                    <select
                      value={receiptAccountId}
                      onChange={(e) => setReceiptAccountId(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold uppercase focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} — ${getAccountBalance(acc).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">RECEIVED FROM (PAYOR):</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ecosystem Grant Partner"
                      value={receiptSource}
                      onChange={(e) => setReceiptSource(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">RECEIPT AMOUNT ($ USD):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={receiptAmount}
                      onChange={(e) => setReceiptAmount(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">CLASSIFICATION CATEGORY:</label>
                    <select
                      value={receiptCategory}
                      onChange={(e) => setReceiptCategory(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold uppercase focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    >
                      <option value="Subscriptions">Subscriptions & Software</option>
                      <option value="Surcharge Fee">Surcharge Fee</option>
                      <option value="Ecosystem Grant">Ecosystem Grant</option>
                      <option value="External Investment">External Investment</option>
                      <option value="Cash Inflow">Cash Inflow</option>
                      <option value="Other Income">Other Income</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">RECEIPT DATE:</label>
                    <input
                      type="date"
                      required
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">RECEIPT REFERENCE NO:</label>
                    <input
                      type="text"
                      required
                      value={receiptRef}
                      onChange={(e) => setReceiptRef(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold focus:outline-none focus:border-[#1A1A1A] text-gray-800 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-bold">RECEIPT MEMO / DESCRIPTION:</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide detailed description of inflow receipt..."
                    value={receiptDescription}
                    onChange={(e) => setReceiptDescription(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] resize-none text-gray-800"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-[#D1D1CF]">
                <button
                  type="button"
                  onClick={() => setIsReceiptOpen(false)}
                  className="px-4 py-2 border border-[#1A1A1A] text-[#1A1A1A] font-bold uppercase text-[10px] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-bold uppercase text-[10px] cursor-pointer"
                >
                  Commit Receipt Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
         FLOATING MODAL: ADD / CREATE BANK OR CASH ACCOUNT
         ========================================================================== */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-mono">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-md shadow-2xl relative text-left text-gray-800">
            <div className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center select-none">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-[#FF5A00]" />
                <span className="font-black text-xs uppercase tracking-wider text-white">Create Bank or Cash Account</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddAccountOpen(false)}
                className="text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="p-6 space-y-4">
              <div className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-bold">ACCOUNT DISPLAY NAME:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chase Operating Wallet"
                    value={addAccName}
                    onChange={(e) => setAddAccName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">ACCOUNT CLASSIFICATION:</label>
                    <select
                      value={addAccType}
                      onChange={(e) => setAddAccType(e.target.value as 'Bank' | 'Cash')}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    >
                      <option value="Bank">Bank Account</option>
                      <option value="Cash">Physical Cash Safe</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 uppercase font-bold">INITIAL BAL ($ USD):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={addAccInitialBalance}
                      onChange={(e) => setAddAccInitialBalance(e.target.value)}
                      className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs font-bold focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-bold">FINANCIAL INSTITUTION / LOCATION:</label>
                  <input
                    type="text"
                    placeholder="e.g. JPMorgan Chase, N.A. or Vault-A"
                    value={addAccInstitution}
                    onChange={(e) => setAddAccInstitution(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-bold">ACCOUNT NUMBER / ROUTING SIGNATURE:</label>
                  <input
                    type="text"
                    placeholder="e.g. •••• 1234 or Drawer-02"
                    value={addAccNumber}
                    onChange={(e) => setAddAccNumber(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-gray-800 font-mono"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-[#D1D1CF]">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 border border-[#1A1A1A] text-[#1A1A1A] font-bold uppercase text-[10px] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white font-bold uppercase text-[10px] cursor-pointer"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
