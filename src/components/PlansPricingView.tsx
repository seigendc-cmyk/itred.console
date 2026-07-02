import React, { useState } from 'react';
import { Plan, Vendor } from '../types';
import { useLifecycle } from '../App';
import { 
  Layers, 
  Plus, 
  Minus,
  Edit, 
  Trash2,
  Power, 
  PowerOff, 
  Shield, 
  Users, 
  Check, 
  X, 
  Building2, 
  Terminal, 
  UserCheck, 
  Briefcase, 
  Sparkles,
  Info,
  Boxes,
  Activity,
  Key,
  Database,
  Truck,
  MessageSquare,
  ShoppingCart,
  Bot,
  DollarSign,
  Lock,
  Scale,
  HardDrive,
  HelpCircle,
  TrendingUp,
  Sliders,
  CheckCircle2,
  FileText,
  Globe
} from 'lucide-react';

interface CustomPlatformPlan {
  id: string;
  name: string;
  targetBusiness: string;
  price: number;
  isCustomPrice?: boolean;
  description: string;
  limits: {
    businesses: string;
    branches: string;
    terminals: string;
    staff: string;
    products: string;
    customers: string;
    warehouses?: string;
  };
  modules: string[];
  status: 'Active' | 'Inactive';
}

const INITIAL_PLATFORM_PLANS: CustomPlatformPlan[] = [
  {
    id: 'PLN-STARTER',
    name: 'Starter',
    targetBusiness: 'Tuckshops • Home Businesses • Hair Salons • Market Traders • Small Workshops',
    price: 10,
    description: 'Designed for micro-enterprises and single-operator kiosks looking to digitize their checkout.',
    limits: {
      businesses: '1 Business',
      branches: '1 Branch',
      terminals: '1 Terminal',
      staff: '2 Staff',
      products: '500 Products',
      customers: '100 Customers'
    },
    modules: ['POS', 'Inventory', 'Customers', 'Suppliers', 'Cashier Shifts', 'Reports', 'Barcode Printing', 'Offline Mode'],
    status: 'Active'
  },
  {
    id: 'PLN-GROWTH',
    name: 'Growth',
    targetBusiness: 'Local Minimarts • Growing Boutiques • Multi-operator Kiosks • Franchise Outlets',
    price: 25,
    description: 'Optimized for small businesses expanding into multi-terminal and double-branch operations.',
    limits: {
      businesses: '1 Business',
      branches: '2 Branches',
      terminals: '3 Terminals',
      staff: '8 Staff',
      products: '5,000 Products',
      customers: 'Unlimited'
    },
    modules: [
      'Everything in Starter',
      'Purchase Orders',
      'Warehouse',
      'Transfers',
      'Returns',
      'Lay-by',
      'Promotions',
      'Price Lists',
      'WhatsApp Receipts',
      'Vendor Discovery Listing',
      'Basic Dashboard'
    ],
    status: 'Active'
  },
  {
    id: 'PLN-PROFESSIONAL',
    name: 'Professional',
    targetBusiness: 'Mid-sized Supermarkets • Department Stores • Regional Distributors • Logistics Hubs',
    price: 50,
    description: 'The standard mid-market operational core. Supports deep analytics, multi-warehouses, and advanced notifications.',
    limits: {
      businesses: '1 Business',
      branches: '5 Branches',
      terminals: '10 Terminals',
      staff: 'Unlimited Staff',
      products: 'Unlimited Products',
      customers: 'Unlimited'
    },
    modules: [
      'Everything above',
      'Executive Dashboard',
      'Sales Analytics',
      'Customer Analytics',
      'Dead Stock',
      'Profit Analysis',
      'Stocktake',
      'Cycle Counts',
      'Multiple Warehouses',
      'Delivery Orders',
      'Delivery OTP',
      'WhatsApp Notifications',
      'Roles & Permissions',
      'Activity Logs',
      'Scheduled Reports'
    ],
    status: 'Active'
  },
  {
    id: 'PLN-BUSINESS-PLUS',
    name: 'Business Plus',
    targetBusiness: 'National Brands • Hypermarkets • Multi-state Retail Chains • Smart Wholesalers',
    price: 100,
    description: 'The predictive AI and complete marketplace plan. Built for high-volume optimization and automated forecasting.',
    limits: {
      businesses: '1 Business',
      branches: 'Unlimited',
      terminals: 'Unlimited',
      staff: 'Unlimited',
      products: 'Unlimited',
      customers: 'Unlimited'
    },
    modules: [
      'Everything above',
      'Predictive BI & Forecasting',
      'AI Assistant & Business Advisor',
      'Demand Forecasting',
      'Price Recommendations',
      'Stock Recommendations',
      'Google Maps Delivery',
      'Driver Scoring',
      'Vendor Marketplace',
      'Supplier Marketplace',
      'Lead Generation',
      'Accounting Integration',
      'Payment Gateways',
      'Fiscal Devices'
    ],
    status: 'Active'
  },
  {
    id: 'PLN-ENTERPRISE',
    name: 'Enterprise',
    targetBusiness: 'Supermarkets • Manufacturers • Hospitals • Government • Universities • Distribution Giants • Franchises',
    price: 499,
    isCustomPrice: true,
    description: 'Highly customized dedicated cloud clusters with strict SLA agreements, tailored integrations, and priority multi-tenant control.',
    limits: {
      businesses: 'Unlimited',
      branches: 'Unlimited',
      terminals: 'Unlimited',
      staff: 'Unlimited',
      products: 'Unlimited',
      customers: 'Unlimited',
      warehouses: 'Unlimited'
    },
    modules: [
      'Dedicated Cloud Cluster',
      'Unlimited Cloud Resources',
      'Dedicated Support Engineer',
      'Custom API & Backend Integrations',
      'Priority Support SLA (99.99%)',
      'Direct Spanner Cluster Access'
    ],
    status: 'Active'
  }
];

interface CapacityUpgrade {
  id: string;
  name: string;
  cost: number;
  unit: string;
  allocation: number;
  maxAllocation: number;
  description: string;
}

const INITIAL_CAPACITY_UPGRADES: CapacityUpgrade[] = [
  { id: 'cap-branch', name: 'Extra Branch', cost: 15, unit: 'Branch', allocation: 2, maxAllocation: 10, description: 'Increases licensed geographic physical store locations' },
  { id: 'cap-terminal', name: 'Extra POS Terminal', cost: 5, unit: 'Terminal', allocation: 3, maxAllocation: 25, description: 'Permits additional active checkout terminal hardware binds' },
  { id: 'cap-warehouse', name: 'Extra Warehouse', cost: 20, unit: 'Warehouse', allocation: 1, maxAllocation: 5, description: 'Adds secondary stock-keeping warehouse nodes' },
  { id: 'cap-rider', name: 'Extra Delivery Rider', cost: 10, unit: 'Rider', allocation: 0, maxAllocation: 15, description: 'Expands licensed active mobile courier connections' },
  { id: 'cap-storage', name: 'Extra Cloud Storage', cost: 5, unit: 'GB', allocation: 0, maxAllocation: 100, description: 'Additional cloud backup ledger allocation (per 10GB)' }
];

interface BusinessModule {
  id: string;
  name: string;
  iconName: string;
  description: string;
  price: number;
  category: 'POS & Store' | 'Intelligence & AI' | 'Logistics' | 'Back Office' | 'Integrations';
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  ShoppingCart,
  Truck,
  Key,
  TrendingUp,
  Bot,
  DollarSign,
  Users,
  Briefcase,
  Database,
  Sliders,
  Boxes,
  Shield,
  UserCheck,
  FileText,
  Terminal,
  HardDrive,
  MessageSquare,
  Globe,
  Sparkles,
  Info,
  Lock,
  Scale,
  Activity,
  Plus,
  Minus,
  Edit,
  Trash2,
  HelpCircle
};

function getIconComponent(iconName: string): React.ComponentType<any> {
  return ICON_MAP[iconName] || Boxes;
}

const INITIAL_BUSINESS_MODULES: BusinessModule[] = [
  { id: 'mod-itredpos', name: 'iTredPOS', iconName: 'ShoppingCart', description: 'SGN Cryptographic Point-of-Sale with full cashier controls & receipt print daemon', price: 19, category: 'POS & Store' },
  { id: 'mod-ideliver', name: 'iDeliver', iconName: 'Truck', description: 'Last-mile fleet delivery dispatching tracker, route mapper & SMS OTP triggers', price: 15, category: 'Logistics' },
  { id: 'mod-discovery', name: 'Vendor Discovery', iconName: 'Key', description: 'Registers store identity inside the B2B matchmaking search network index', price: 9, category: 'Back Office' },
  { id: 'mod-execbi', name: 'Executive BI', iconName: 'TrendingUp', description: 'Real-time corporate performance analytics suite, profit analytics & dead stock logs', price: 25, category: 'Intelligence & AI' },
  { id: 'mod-ai-assistant', name: 'AI Assistant', iconName: 'Bot', description: 'Gemini-powered business advisor, demand forecasting & automatic stock recommendations', price: 29, category: 'Intelligence & AI' },
  { id: 'mod-cashplan', name: 'CashPlan', iconName: 'DollarSign', description: 'Liquidity ledger system, automated cash flows forecasts & financial planning boards', price: 19, category: 'Intelligence & AI' },
  { id: 'mod-crm', name: 'CRM & Loyalty', iconName: 'Users', description: 'Manage customer metrics, lay-by tracking, promos, price lists & custom points engines', price: 12, category: 'POS & Store' },
  { id: 'mod-procurement', name: 'Procurement Suite', iconName: 'Briefcase', description: 'Automated purchase orders flow, stock receiving schedules & supplier directory sync', price: 15, category: 'Back Office' },
  { id: 'mod-consignment', name: 'Consignment Sync', iconName: 'Database', description: 'Track vendor-consigned inventory ledgers & automatic multi-tenant settlement records', price: 19, category: 'Back Office' },
  { id: 'mod-fieldsales', name: 'Field Sales', iconName: 'Sliders', description: 'Offline-first tablet app for regional sales agents with route plans & order entry', price: 15, category: 'POS & Store' },
  { id: 'mod-manufacturing', name: 'Manufacturing Core', iconName: 'Boxes', description: 'Bill of Materials (BOM) assembler, multi-stage production tracking & raw yields tracker', price: 49, category: 'Back Office' },
  { id: 'mod-asset', name: 'Asset Management', iconName: 'Shield', description: 'Register, depreciate & verify corporate equipment, POS terminals & physical caches', price: 25, category: 'Back Office' },
  { id: 'mod-payroll', name: 'Payroll & HR', iconName: 'UserCheck', description: 'Manage employee contracts, payroll runs, cash advances & biometric shift attendance', price: 29, category: 'Back Office' },
  { id: 'mod-accounting', name: 'Accounting Connector', iconName: 'FileText', description: 'Instant accounting exports, automated tax reporting mapping & double-entry auditing', price: 15, category: 'Integrations' },
  { id: 'mod-api', name: 'Advanced API Gateway', iconName: 'Terminal', description: 'Direct webhook delivery channels, unlimited JSON REST queries & rate limit overrides', price: 39, category: 'Integrations' },
  { id: 'mod-backup', name: 'Advanced Redundant Backup', iconName: 'HardDrive', description: 'Automated triple-redundant offsite SQL snapshot mirrors with instant recovery', price: 9, category: 'Integrations' },
  { id: 'mod-sms', name: 'SMS Alerts', iconName: 'MessageSquare', description: 'Transactional receipt delivery, delivery dispatch text logs & promotion lists', price: 5, category: 'Integrations' },
  { id: 'mod-whatsapp', name: 'WhatsApp Messaging', iconName: 'Globe', description: 'Deliver official WhatsApp receipts, billing queries, and bot-grounded chats', price: 12, category: 'Integrations' }
];

const FEATURE_PRESETS_CATEGORIES: Record<string, string[]> = {
  'Core POS & Base Store': [
    'POS', 'Inventory', 'Customers', 'Suppliers', 'Cashier Shifts', 'Reports', 'Barcode Printing', 'Offline Mode',
    'Purchase Orders', 'Warehouse', 'Transfers', 'Returns', 'Lay-by', 'Promotions', 'Price Lists', 'WhatsApp Receipts',
    'Vendor Discovery Listing', 'Basic Dashboard'
  ],
  'Professional Analytics & Ops': [
    'Executive Dashboard', 'Sales Analytics', 'Customer Analytics', 'Dead Stock', 'Profit Analysis', 'Stocktake',
    'Cycle Counts', 'Multiple Warehouses', 'Delivery Orders', 'Delivery OTP', 'WhatsApp Notifications', 'Roles & Permissions',
    'Activity Logs', 'Scheduled Reports'
  ],
  'Predictive AI & Integrations': [
    'Predictive BI & Forecasting', 'AI Assistant & Business Advisor', 'Demand Forecasting', 'Price Recommendations',
    'Stock Recommendations', 'Google Maps Delivery', 'Driver Scoring', 'Vendor Marketplace', 'Supplier Marketplace',
    'Lead Generation', 'Accounting Integration', 'Payment Gateways', 'Fiscal Devices'
  ],
  'Enterprise & Sovereign Cloud': [
    'Dedicated Cloud Cluster', 'Unlimited Cloud Resources', 'Dedicated Support Engineer',
    'Custom API & Backend Integrations', 'Priority Support SLA (99.99%)', 'Direct Spanner Cluster Access'
  ]
};

export default function PlansPricingView() {
  const { vendors, currentAdmin, addLogAndNotify } = useLifecycle();

  // 1. Core State
  const [plans, setPlans] = useState<CustomPlatformPlan[]>(() => {
    const saved = localStorage.getItem('sci_platform_plans');
    return saved ? JSON.parse(saved) : INITIAL_PLATFORM_PLANS;
  });

  const [capacities, setCapacities] = useState<CapacityUpgrade[]>(() => {
    const saved = localStorage.getItem('sci_capacity_upgrades');
    return saved ? JSON.parse(saved) : INITIAL_CAPACITY_UPGRADES;
  });

  const [marketplaceModules, setMarketplaceModules] = useState<BusinessModule[]>(() => {
    const saved = localStorage.getItem('sci_marketplace_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_BUSINESS_MODULES;
  });

  const [activeModules, setActiveModules] = useState<string[]>(() => {
    const saved = localStorage.getItem('sci_activated_modules');
    return saved ? JSON.parse(saved) : ['mod-itredpos', 'mod-ideliver', 'mod-crm', 'mod-ai-assistant', 'mod-discovery'];
  });

  // Capacity dialog / form states
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false);
  const [editCapacity, setEditCapacity] = useState<CapacityUpgrade | null>(null);
  const [capFormName, setCapFormName] = useState('');
  const [capFormCost, setCapFormCost] = useState(10);
  const [capFormUnit, setCapFormUnit] = useState('Unit');
  const [capFormAllocation, setCapFormAllocation] = useState(0);
  const [capFormMaxAllocation, setCapFormMaxAllocation] = useState(10);
  const [capFormDesc, setCapFormDesc] = useState('');

  // Module dialog / form states
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editModule, setEditModule] = useState<BusinessModule | null>(null);
  const [modFormName, setModFormName] = useState('');
  const [modFormIconName, setModFormIconName] = useState('Boxes');
  const [modFormDesc, setModFormDesc] = useState('');
  const [modFormPrice, setModFormPrice] = useState(15);
  const [modFormCategory, setModFormCategory] = useState<BusinessModule['category']>('POS & Store');

  // 2. Simulator State
  const [selectedVendorId, setSelectedVendorId] = useState<string>(() => {
    return vendors && vendors.length > 0 ? vendors[0].id : 'V-209';
  });

  const [simulatedPlanId, setSimulatedPlanId] = useState<string>('PLN-PROFESSIONAL');

  // 3. UX Dialogs
  const [detailsPlan, setDetailsPlan] = useState<CustomPlatformPlan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<CustomPlatformPlan | null>(null);

  // Form states for creating/editing plans
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formPrice, setFormPrice] = useState(10);
  const [formIsCustomPrice, setFormIsCustomPrice] = useState(false);
  const [formDesc, setFormDesc] = useState('');
  const [formLimits, setFormLimits] = useState({
    businesses: '1 Business',
    branches: '1 Branch',
    terminals: '1 Terminal',
    staff: '3 Staff',
    products: '500 Products',
    customers: 'Unlimited',
    warehouses: 'Unlimited'
  });
  const [formModules, setFormModules] = useState<string[]>([]);

  // Preset quick templates
  const applyPresetTemplate = (type: 'starter' | 'growth' | 'pro' | 'plus' | 'enterprise') => {
    switch (type) {
      case 'starter':
        setFormPrice(10);
        setFormIsCustomPrice(false);
        setFormLimits({
          businesses: '1 Business',
          branches: '1 Branch',
          terminals: '1 Terminal',
          staff: '2 Staff',
          products: '500 Products',
          customers: '100 Customers',
          warehouses: 'N/A'
        });
        setFormModules([
          'POS', 'Inventory', 'Customers', 'Suppliers', 'Cashier Shifts', 'Reports', 'Barcode Printing', 'Offline Mode'
        ]);
        break;
      case 'growth':
        setFormPrice(25);
        setFormIsCustomPrice(false);
        setFormLimits({
          businesses: '1 Business',
          branches: '2 Branches',
          terminals: '3 Terminals',
          staff: '8 Staff',
          products: '5,000 Products',
          customers: 'Unlimited',
          warehouses: '1 Warehouse'
        });
        setFormModules([
          'POS', 'Inventory', 'Customers', 'Suppliers', 'Cashier Shifts', 'Reports', 'Barcode Printing', 'Offline Mode',
          'Purchase Orders', 'Warehouse', 'Transfers', 'Returns', 'Lay-by', 'Promotions', 'Price Lists', 'WhatsApp Receipts',
          'Vendor Discovery Listing', 'Basic Dashboard'
        ]);
        break;
      case 'pro':
        setFormPrice(50);
        setFormIsCustomPrice(false);
        setFormLimits({
          businesses: '1 Business',
          branches: '5 Branches',
          terminals: '10 Terminals',
          staff: 'Unlimited Staff',
          products: 'Unlimited Products',
          customers: 'Unlimited',
          warehouses: 'Unlimited'
        });
        setFormModules([
          'POS', 'Inventory', 'Customers', 'Suppliers', 'Cashier Shifts', 'Reports', 'Barcode Printing', 'Offline Mode',
          'Purchase Orders', 'Warehouse', 'Transfers', 'Returns', 'Lay-by', 'Promotions', 'Price Lists', 'WhatsApp Receipts',
          'Vendor Discovery Listing', 'Basic Dashboard',
          'Executive Dashboard', 'Sales Analytics', 'Customer Analytics', 'Dead Stock', 'Profit Analysis', 'Stocktake',
          'Cycle Counts', 'Multiple Warehouses', 'Delivery Orders', 'Delivery OTP', 'WhatsApp Notifications', 'Roles & Permissions',
          'Activity Logs', 'Scheduled Reports'
        ]);
        break;
      case 'plus':
        setFormPrice(100);
        setFormIsCustomPrice(false);
        setFormLimits({
          businesses: '1 Business',
          branches: 'Unlimited',
          terminals: 'Unlimited',
          staff: 'Unlimited',
          products: 'Unlimited',
          customers: 'Unlimited',
          warehouses: 'Unlimited'
        });
        setFormModules([
          'POS', 'Inventory', 'Customers', 'Suppliers', 'Cashier Shifts', 'Reports', 'Barcode Printing', 'Offline Mode',
          'Purchase Orders', 'Warehouse', 'Transfers', 'Returns', 'Lay-by', 'Promotions', 'Price Lists', 'WhatsApp Receipts',
          'Vendor Discovery Listing', 'Basic Dashboard',
          'Executive Dashboard', 'Sales Analytics', 'Customer Analytics', 'Dead Stock', 'Profit Analysis', 'Stocktake',
          'Cycle Counts', 'Multiple Warehouses', 'Delivery Orders', 'Delivery OTP', 'WhatsApp Notifications', 'Roles & Permissions',
          'Activity Logs', 'Scheduled Reports',
          'Predictive BI & Forecasting', 'AI Assistant & Business Advisor', 'Demand Forecasting', 'Price Recommendations',
          'Stock Recommendations', 'Google Maps Delivery', 'Driver Scoring', 'Vendor Marketplace', 'Supplier Marketplace',
          'Lead Generation', 'Accounting Integration', 'Payment Gateways', 'Fiscal Devices'
        ]);
        break;
      case 'enterprise':
        setFormPrice(499);
        setFormIsCustomPrice(true);
        setFormLimits({
          businesses: 'Unlimited',
          branches: 'Unlimited',
          terminals: 'Unlimited',
          staff: 'Unlimited',
          products: 'Unlimited',
          customers: 'Unlimited',
          warehouses: 'Unlimited'
        });
        setFormModules([
          'Dedicated Cloud Cluster', 'Unlimited Cloud Resources', 'Dedicated Support Engineer',
          'Custom API & Backend Integrations', 'Priority Support SLA (99.99%)', 'Direct Spanner Cluster Access'
        ]);
        break;
    }
  };

  // Persistent storage saves
  const savePlans = (newPlans: CustomPlatformPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem('sci_platform_plans', JSON.stringify(newPlans));
  };

  const saveCapacities = (newCaps: CapacityUpgrade[]) => {
    setCapacities(newCaps);
    localStorage.setItem('sci_capacity_upgrades', JSON.stringify(newCaps));
  };

  const saveMarketplaceModules = (newMods: BusinessModule[]) => {
    setMarketplaceModules(newMods);
    localStorage.setItem('sci_marketplace_modules', JSON.stringify(newMods));
  };

  const saveModules = (newMods: string[]) => {
    setActiveModules(newMods);
    localStorage.setItem('sci_activated_modules', JSON.stringify(newMods));
  };

  // Create Plan Action
  const handleOpenCreate = () => {
    setFormName('');
    setFormTarget('');
    setFormPrice(30);
    setFormIsCustomPrice(false);
    setFormDesc('');
    setFormLimits({
      businesses: '1 Business',
      branches: '2 Branches',
      terminals: '4 Terminals',
      staff: '10 Staff',
      products: '2,000 Products',
      customers: 'Unlimited',
      warehouses: 'Unlimited'
    });
    setFormModules(['POS', 'Inventory', 'Reports']);
    setCreateOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const newId = `PLN-${Date.now().toString().slice(-6)}`;
    const newPlan: CustomPlatformPlan = {
      id: newId,
      name: formName,
      targetBusiness: formTarget || 'Custom Enterprise Segment',
      price: Number(formPrice),
      isCustomPrice: formIsCustomPrice,
      description: formDesc || 'Custom provisioned SCI tier.',
      limits: formLimits,
      modules: formModules,
      status: 'Active'
    };

    const updated = [...plans, newPlan];
    savePlans(updated);
    setCreateOpen(false);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Lead Ops',
        'CREATE_PLATFORM_PLAN',
        `${formName} (${newId})`,
        'Success',
        'success',
        'New Platform Plan Provisioned',
        `A custom SCI license slab "${formName}" has been successfully appended to the registry indices.`
      );
    }
  };

  // Edit Plan Action
  const handleOpenEdit = (plan: CustomPlatformPlan) => {
    setEditPlan(plan);
    setFormName(plan.name);
    setFormTarget(plan.targetBusiness);
    setFormPrice(plan.price);
    setFormIsCustomPrice(!!plan.isCustomPrice);
    setFormDesc(plan.description);
    setFormLimits({
      businesses: plan.limits.businesses || '1 Business',
      branches: plan.limits.branches || '1 Branch',
      terminals: plan.limits.terminals || '1 Terminal',
      staff: plan.limits.staff || '3 Staff',
      products: plan.limits.products || '500 Products',
      customers: plan.limits.customers || 'Unlimited',
      warehouses: plan.limits.warehouses || 'Unlimited'
    });
    setFormModules([...plan.modules]);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlan) return;

    const updated = plans.map(p => {
      if (p.id === editPlan.id) {
        return {
          ...p,
          name: formName,
          targetBusiness: formTarget,
          price: Number(formPrice),
          isCustomPrice: formIsCustomPrice,
          description: formDesc,
          limits: formLimits,
          modules: formModules
        };
      }
      return p;
    });

    savePlans(updated);
    setEditPlan(null);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Lead Ops',
        'EDIT_PLATFORM_PLAN',
        `${formName} (${editPlan.id})`,
        'Success',
        'info',
        'Platform Plan Properties Modified',
        `The properties of the "${formName}" license slab have been updated and validated.`
      );
    }
  };

  // Toggle Plan Status
  const handleToggleDeactivate = (id: string) => {
    const updated = plans.map(p => {
      if (p.id === id) {
        const nextStatus: 'Active' | 'Inactive' = p.status === 'Active' ? 'Inactive' : 'Active';
        
        if (addLogAndNotify) {
          addLogAndNotify(
            currentAdmin?.name || 'Lead Ops',
            nextStatus === 'Active' ? 'ACTIVATE_PLATFORM_PLAN' : 'DEACTIVATE_PLATFORM_PLAN',
            `${p.name} (${id})`,
            'Warning',
            nextStatus === 'Active' ? 'success' : 'alert',
            nextStatus === 'Active' ? 'Platform Plan Activated' : 'Platform Plan Suspended',
            `Ecosystem plan ${p.name} connectivity state has been toggled to ${nextStatus.toUpperCase()}.`
          );
        }
        return { ...p, status: nextStatus };
      }
      return p;
    });
    savePlans(updated);
  };

  // Capacity Adjustment Actions
  const handleIncrementCapacity = (id: string) => {
    const updated = capacities.map(cap => {
      if (cap.id === id && cap.allocation < cap.maxAllocation) {
        const nextAlloc = cap.allocation + (cap.id === 'cap-storage' ? 10 : 1);
        return { ...cap, allocation: Math.min(nextAlloc, cap.maxAllocation) };
      }
      return cap;
    });
    saveCapacities(updated);
  };

  const handleDecrementCapacity = (id: string) => {
    const updated = capacities.map(cap => {
      if (cap.id === id && cap.allocation > 0) {
        const nextAlloc = cap.allocation - (cap.id === 'cap-storage' ? 10 : 1);
        return { ...cap, allocation: Math.max(nextAlloc, 0) };
      }
      return cap;
    });
    saveCapacities(updated);
  };

  // Module Toggle
  const handleToggleModule = (modId: string) => {
    let next: string[];
    if (activeModules.includes(modId)) {
      next = activeModules.filter(m => m !== modId);
    } else {
      next = [...activeModules, modId];
    }
    saveModules(next);
  };

  // Dynamic Capacity Edit / Create Actions
  const handleOpenCreateCapacity = () => {
    setEditCapacity(null);
    setCapFormName('');
    setCapFormCost(15);
    setCapFormUnit('Unit');
    setCapFormAllocation(0);
    setCapFormMaxAllocation(10);
    setCapFormDesc('');
    setCapacityDialogOpen(true);
  };

  const handleOpenEditCapacity = (cap: CapacityUpgrade) => {
    setEditCapacity(cap);
    setCapFormName(cap.name);
    setCapFormCost(cap.cost);
    setCapFormUnit(cap.unit);
    setCapFormAllocation(cap.allocation);
    setCapFormMaxAllocation(cap.maxAllocation);
    setCapFormDesc(cap.description);
    setCapacityDialogOpen(true);
  };

  const handleSubmitCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capFormName) return;

    if (editCapacity) {
      const updated = capacities.map(c => {
        if (c.id === editCapacity.id) {
          return {
            ...c,
            name: capFormName,
            cost: Number(capFormCost),
            unit: capFormUnit,
            allocation: Number(capFormAllocation),
            maxAllocation: Number(capFormMaxAllocation),
            description: capFormDesc
          };
        }
        return c;
      });
      saveCapacities(updated);

      if (addLogAndNotify) {
        addLogAndNotify(
          currentAdmin?.name || 'Lead Ops',
          'EDIT_CAPACITY_UPGRADE',
          `${capFormName} (${editCapacity.id})`,
          'Success',
          'info',
          'Capacity Upgrade Option Updated',
          `Successfully updated parameters for capacity upgrade "${capFormName}".`
        );
      }
    } else {
      const newId = `cap-${Date.now().toString().slice(-6)}`;
      const newCap: CapacityUpgrade = {
        id: newId,
        name: capFormName,
        cost: Number(capFormCost),
        unit: capFormUnit,
        allocation: Number(capFormAllocation),
        maxAllocation: Number(capFormMaxAllocation),
        description: capFormDesc
      };
      saveCapacities([...capacities, newCap]);

      if (addLogAndNotify) {
        addLogAndNotify(
          currentAdmin?.name || 'Lead Ops',
          'CREATE_CAPACITY_UPGRADE',
          `${capFormName} (${newId})`,
          'Success',
          'success',
          'New Capacity Upgrade Registered',
          `Successfully registered new capacity upgrade option "${capFormName}" into catalog.`
        );
      }
    }
    setCapacityDialogOpen(false);
  };

  const handleDeleteCapacity = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this Capacity Upgrade option?');
    if (!confirmed) return;

    const targetCap = capacities.find(c => c.id === id);
    const updated = capacities.filter(c => c.id !== id);
    saveCapacities(updated);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Lead Ops',
        'DELETE_CAPACITY_UPGRADE',
        `Upgrade ID: ${id}`,
        'Warning',
        'alert',
        'Capacity Upgrade Option Deleted',
        `Capacity upgrade "${targetCap?.name || id}" was permanently deleted from operational catalog.`
      );
    }
  };

  // Dynamic Modules Edit / Create Actions
  const handleOpenCreateModule = () => {
    setEditModule(null);
    setModFormName('');
    setModFormIconName('Boxes');
    setModFormDesc('');
    setModFormPrice(15);
    setModFormCategory('POS & Store');
    setModuleDialogOpen(true);
  };

  const handleOpenEditModule = (mod: BusinessModule) => {
    setEditModule(mod);
    setModFormName(mod.name);
    setModFormIconName(mod.iconName);
    setModFormDesc(mod.description);
    setModFormPrice(mod.price);
    setModFormCategory(mod.category);
    setModuleDialogOpen(true);
  };

  const handleSubmitModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modFormName) return;

    if (editModule) {
      const updated = marketplaceModules.map(m => {
        if (m.id === editModule.id) {
          return {
            ...m,
            name: modFormName,
            iconName: modFormIconName,
            description: modFormDesc,
            price: Number(modFormPrice),
            category: modFormCategory
          };
        }
        return m;
      });
      saveMarketplaceModules(updated);

      if (addLogAndNotify) {
        addLogAndNotify(
          currentAdmin?.name || 'Lead Ops',
          'EDIT_MARKETPLACE_MODULE',
          `${modFormName} (${editModule.id})`,
          'Success',
          'info',
          'Marketplace Module Modified',
          `The properties of marketplace engine "${modFormName}" have been updated successfully.`
        );
      }
    } else {
      const newId = `mod-${Date.now().toString().slice(-6)}`;
      const newMod: BusinessModule = {
        id: newId,
        name: modFormName,
        iconName: modFormIconName,
        description: modFormDesc,
        price: Number(modFormPrice),
        category: modFormCategory
      };
      saveMarketplaceModules([...marketplaceModules, newMod]);

      if (addLogAndNotify) {
        addLogAndNotify(
          currentAdmin?.name || 'Lead Ops',
          'CREATE_MARKETPLACE_MODULE',
          `${modFormName} (${newId})`,
          'Success',
          'success',
          'New Module Appended to Marketplace',
          `Successfully registered new business module "${modFormName}" into the central marketplace directory.`
        );
      }
    }
    setModuleDialogOpen(false);
  };

  const handleDeleteModule = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this Business Module from the Marketplace?');
    if (!confirmed) return;

    const targetMod = marketplaceModules.find(m => m.id === id);
    const updated = marketplaceModules.filter(m => m.id !== id);
    saveMarketplaceModules(updated);

    if (activeModules.includes(id)) {
      saveModules(activeModules.filter(m => m !== id));
    }

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Lead Ops',
        'DELETE_MARKETPLACE_MODULE',
        `Module ID: ${id}`,
        'Warning',
        'alert',
        'Marketplace Module Removed',
        `Business module "${targetMod?.name || id}" was permanently removed from the ecosystem catalogue.`
      );
    }
  };

  // SIMULATOR CALCULATIONS
  const currentSimulatedPlan = plans.find(p => p.id === simulatedPlanId) || plans[0];
  const simulatedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  const planBaseCost = currentSimulatedPlan.isCustomPrice ? 499 : currentSimulatedPlan.price;
  
  // Calculate capacity upgrade pricing
  const totalCapacityCost = capacities.reduce((sum, cap) => {
    // Storage upgrades are priced per 10GB units
    const factor = cap.id === 'cap-storage' ? cap.allocation / 10 : cap.allocation;
    return sum + (factor * cap.cost);
  }, 0);

  // Calculate modules pricing
  const selectedModulesDetails = marketplaceModules.filter(m => activeModules.includes(m.id));
  const totalModulesCost = selectedModulesDetails.reduce((sum, m) => sum + m.price, 0);

  const finalSimulatedMonthlyTotal = planBaseCost + totalCapacityCost + totalModulesCost;

  // Limits calculations for display
  const limitBranchesText = currentSimulatedPlan.limits.branches;
  const numericBranchesLimit = parseInt(limitBranchesText) || 999;
  const extraBranchesGranted = capacities.find(c => c.id === 'cap-branch')?.allocation || 0;
  const totalSimulatedBranchesLimit = numericBranchesLimit === 999 ? 'Unlimited' : (numericBranchesLimit + extraBranchesGranted);

  const limitTerminalsText = currentSimulatedPlan.limits.terminals;
  const numericTerminalsLimit = parseInt(limitTerminalsText) || 999;
  const extraTerminalsGranted = capacities.find(c => c.id === 'cap-terminal')?.allocation || 0;
  const totalSimulatedTerminalsLimit = numericTerminalsLimit === 999 ? 'Unlimited' : (numericTerminalsLimit + extraTerminalsGranted);

  return (
    <div id="sci_pricing_licensing_center_dashboard" className="space-y-8 font-sans pb-16">
      
      {/* ENTERPRISE TOP STAGE BANNER */}
      <div id="pricing_center_hero" className="bg-[#1A1A1A] border-4 border-[#1A1A1A] p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#FF5A00]/15 to-transparent pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-64 h-64 border-4 border-dashed border-[#FF5A00]/20 rounded-full pointer-events-none" />
        
        <div className="max-w-4xl space-y-4 relative z-10">
          <div className="flex items-center space-x-2 text-[#FF5A00] font-mono text-xs font-black uppercase tracking-widest">
            <Layers className="w-4 h-4 animate-pulse" />
            <span>Operational Licensing & Provisioning System</span>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-white">
            Pricing & Licensing Centre
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
            SCI runs on a multi-dimensional licensing model designed to align costs with corporate growth. 
            Calibrate and bind core plans, expand operational transaction capacity, and provision specialized business modules on-demand.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-gray-400 border-t border-gray-800">
            <div>
              <span className="text-gray-500 uppercase">Registry Status:</span> <strong className="text-emerald-400">● BIND_ACTIVE</strong>
            </div>
            <div>
              <span className="text-gray-500">LEDGER REF:</span> <strong className="text-gray-200">SGN-PRC-INDEX-v4</strong>
            </div>
            <div>
              <span className="text-gray-500">AUTHORITY:</span> <strong className="text-[#FF5A00]">{currentAdmin?.role || 'Lead SysOp'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: PLATFORM PLANS */}
      <section id="section_platform_plans" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b-4 border-[#1A1A1A] pb-3 gap-2">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase text-[#1A1A1A] tracking-wider flex items-center space-x-2">
              <span className="bg-[#FF5A00] text-white text-xs font-mono font-bold px-1.5 py-0.5">LAYER 1</span>
              <span>Platform Plans</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono">CORE TENANT INFRASTRUCTURE PRICING LAYERS</p>
          </div>
          
          <button
            id="create_plan_init_btn"
            onClick={handleOpenCreate}
            className="bg-[#FF5A00] hover:bg-[#E04F00] text-white px-4 py-2 font-mono font-bold text-xs uppercase tracking-wide rounded-none transition-all cursor-pointer flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Plan</span>
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map(plan => {
            const isInactive = plan.status === 'Inactive';
            return (
              <div
                key={plan.id}
                className={`bg-white border-2 border-[#1A1A1A] flex flex-col justify-between relative rounded-none shadow-sm hover:shadow-md transition-all ${
                  isInactive ? 'bg-gray-100 opacity-60 border-dashed border-gray-400' : 'bg-white'
                }`}
              >
                {/* Status Bar */}
                <div className={`h-1.5 ${isInactive ? 'bg-gray-400' : 'bg-[#FF5A00]'}`} />

                {/* Plan Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Name & Target */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-black text-[#1A1A1A] uppercase tracking-tight">{plan.name}</h3>
                      <span className={`px-1.5 py-0.5 text-[8px] font-mono font-black uppercase border ${
                        isInactive ? 'bg-gray-200 border-gray-400 text-gray-500' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      }`}>
                        {plan.status || 'Active'}
                      </span>
                    </div>
                    <div className="text-[9px] text-gray-400 font-mono uppercase tracking-tighter leading-snug min-h-[30px] line-clamp-2">
                      {plan.targetBusiness}
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-[#F4F4F1] p-3 border border-[#D1D1CF] font-mono text-center">
                    {plan.isCustomPrice ? (
                      <div className="text-sm font-black text-[#1A1A1A] uppercase py-1">Custom Pricing</div>
                    ) : (
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-sans font-black text-[#1A1A1A]">${plan.price}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold ml-1">/ Month</span>
                      </div>
                    )}
                    <div className="text-[8px] text-gray-400 uppercase mt-1">SGN-AUDITED TRANSACTIONAL GATE</div>
                  </div>

                  {/* Business Description */}
                  <p className="text-xs text-gray-600 leading-normal min-h-[64px] font-sans">
                    {plan.description}
                  </p>

                  {/* Business Limits List */}
                  <div className="border-t border-dashed border-[#D1D1CF] pt-3 space-y-1 text-xs">
                    <span className="text-[9px] font-mono font-black text-gray-400 uppercase tracking-wider block mb-2">OPERATIONAL THRESHOLDS:</span>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-mono text-[10px]">Businesses</span>
                      <strong className="text-gray-950 font-sans font-bold">{plan.limits.businesses}</strong>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-mono text-[10px]">Physical Branches</span>
                      <strong className="text-gray-950 font-sans font-bold">{plan.limits.branches}</strong>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-mono text-[10px]">Binds / Terminals</span>
                      <strong className="text-gray-950 font-sans font-bold">{plan.limits.terminals}</strong>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-mono text-[10px]">Staff Roles</span>
                      <strong className="text-gray-950 font-sans font-bold">{plan.limits.staff}</strong>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-mono text-[10px]">Catalog Products</span>
                      <strong className="text-gray-950 font-sans font-bold">{plan.limits.products}</strong>
                    </div>
                  </div>

                  {/* Modules Sample */}
                  <div className="border-t border-[#D1D1CF] pt-3 space-y-1">
                    <span className="text-[9px] font-mono font-black text-gray-400 uppercase tracking-wider block">INCLUDED MODULES:</span>
                    <div className="flex flex-wrap gap-1">
                      {plan.modules.slice(0, 4).map((mod, idx) => (
                        <span key={idx} className="bg-gray-100 text-[#1A1A1A] border border-gray-300 text-[9px] px-1 py-0.5 uppercase font-mono tracking-tighter">
                          {mod}
                        </span>
                      ))}
                      {plan.modules.length > 4 && (
                        <span className="text-[9px] text-[#FF5A00] font-mono font-black py-0.5 pl-1">
                          +{plan.modules.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Card Actions Bottom */}
                <div className="p-3 bg-gray-50 border-t border-[#D1D1CF] flex flex-wrap gap-1.5 justify-stretch">
                  <button
                    onClick={() => setDetailsPlan(plan)}
                    className="flex-1 min-w-[70px] bg-white border border-[#D1D1CF] hover:bg-gray-100 text-gray-700 py-1.5 px-2 text-[10px] font-mono font-bold uppercase transition-colors text-center cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 min-w-[70px] bg-white border border-[#1A1A1A] hover:bg-gray-100 text-gray-900 py-1.5 px-2 text-[10px] font-mono font-bold uppercase transition-colors text-center cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleDeactivate(plan.id)}
                    className={`flex-1 min-w-[70px] text-white py-1.5 px-2 text-[10px] font-mono font-bold uppercase transition-all text-center cursor-pointer ${
                      isInactive 
                        ? 'bg-[#FF5A00] hover:bg-[#E04F00]' 
                        : 'bg-stone-800 hover:bg-red-700'
                    }`}
                  >
                    {isInactive ? 'Activate' : 'Deactivate'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: BUSINESS CAPACITY */}
      <section id="section_business_capacity" className="space-y-4">
        <div className="border-b-4 border-[#1A1A1A] pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase text-[#1A1A1A] tracking-wider flex items-center space-x-2">
              <span className="bg-[#FF5A00] text-white text-xs font-mono font-bold px-1.5 py-0.5">LAYER 2</span>
              <span>Business Capacity Upgrades</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono">EXPAND OPERATIONAL ENGINES INDEPENDENTLY</p>
          </div>
          <button
            onClick={handleOpenCreateCapacity}
            className="flex items-center space-x-1.5 bg-[#1A1A1A] text-white hover:bg-black font-mono font-bold text-xs uppercase px-3 py-2 border-2 border-[#1A1A1A] cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>Create Upgrade</span>
          </button>
        </div>

        {/* Capacity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {capacities.map(cap => {
            const isAtMax = cap.allocation >= cap.maxAllocation;
            const currentUpgradeTotal = (cap.id === 'cap-storage' ? cap.allocation / 10 : cap.allocation) * cap.cost;
            
            return (
              <div 
                key={cap.id} 
                className="bg-white border-2 border-[#1A1A1A] p-5 flex flex-col justify-between space-y-4 rounded-none relative"
              >
                {/* Background unit badge */}
                <div className="absolute right-3 top-3 text-[10px] font-mono font-black text-[#FF5A00] bg-orange-50 border border-[#FF5A00]/20 px-2 py-0.5">
                  ${cap.cost} / mo
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide block mr-12">{cap.name}</h3>
                    <div className="flex space-x-1 z-10 shrink-0">
                      <button
                        onClick={() => handleOpenEditCapacity(cap)}
                        className="p-1 hover:bg-gray-100 text-gray-500 hover:text-[#FF5A00] transition-colors cursor-pointer"
                        title="Edit Capacity Upgrade"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCapacity(cap.id)}
                        className="p-1 hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Capacity Upgrade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug font-sans h-10 overflow-hidden">
                    {cap.description}
                  </p>
                </div>

                {/* Upgrade controls & allocation numbers */}
                <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-3 font-mono space-y-2.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400 uppercase">Allocated Units</span>
                    <strong className="text-gray-900 font-bold">
                      {cap.allocation} {cap.unit}{cap.allocation !== 1 && cap.id !== 'cap-storage' ? 's' : ''}
                    </strong>
                  </div>

                  <div className="flex justify-between text-[11px] pb-1.5 border-b border-gray-300">
                    <span className="text-gray-400 uppercase">Maximum Allowed</span>
                    <span className="text-gray-600 font-bold">{cap.maxAllocation}</span>
                  </div>

                  {/* Math total */}
                  <div className="flex justify-between items-baseline text-xs pt-1">
                    <span className="text-gray-400 uppercase text-[9px] font-bold">Added Cost</span>
                    <strong className="text-[#FF5A00] font-sans font-black text-sm">
                      ${currentUpgradeTotal} / mo
                    </strong>
                  </div>
                </div>

                {/* Adjust buttons */}
                <div className="flex space-x-1">
                  <button
                    disabled={cap.allocation <= 0}
                    onClick={() => handleDecrementCapacity(cap.id)}
                    className="w-12 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed border border-[#D1D1CF] rounded-none flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    disabled={isAtMax}
                    onClick={() => handleIncrementCapacity(cap.id)}
                    className="flex-1 py-1.5 bg-[#FF5A00] hover:bg-[#E04F00] text-white disabled:bg-gray-300 disabled:cursor-not-allowed font-mono font-bold text-xs uppercase rounded-none flex items-center justify-center space-x-1 cursor-pointer transition-all"
                  >
                    <span>Upgrade</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: BUSINESS MODULES */}
      <section id="section_business_modules" className="space-y-4">
        <div className="border-b-4 border-[#1A1A1A] pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase text-[#1A1A1A] tracking-wider flex items-center space-x-2">
              <span className="bg-[#FF5A00] text-white text-xs font-mono font-bold px-1.5 py-0.5">LAYER 3</span>
              <span>Business Modules Marketplace</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono">PLUG-AND-PLAY SPECIALIZED TRANSACTION ENGINE LOGICS</p>
          </div>
          <button
            onClick={handleOpenCreateModule}
            className="flex items-center space-x-1.5 bg-[#1A1A1A] text-white hover:bg-black font-mono font-bold text-xs uppercase px-3 py-2 border-2 border-[#1A1A1A] cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>Create Module</span>
          </button>
        </div>

        {/* Categories Tab selector (Visual feedback but shows all beautifully sorted or filtered) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 font-mono text-xs">
          {marketplaceModules.reduce((cats, item) => {
            if (!cats.includes(item.category)) cats.push(item.category);
            return cats;
          }, [] as string[]).map(cat => (
            <div key={cat} className="bg-white border-2 border-dashed border-gray-300 p-2 text-center text-gray-500 text-[10px] font-bold uppercase">
              {cat}
            </div>
          ))}
          <div className="bg-[#1A1A1A] text-[#FF5A00] border-2 border-[#1A1A1A] p-2 text-center text-[10px] font-black uppercase">
            {marketplaceModules.length} MODULES READY
          </div>
        </div>

        {/* Modules Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {marketplaceModules.map(mod => {
            const IconComp = getIconComponent(mod.iconName);
            const isActivated = activeModules.includes(mod.id);
            return (
              <div 
                key={mod.id}
                onClick={() => handleToggleModule(mod.id)}
                className={`border-2 p-4 flex flex-col justify-between space-y-4 rounded-none transition-all cursor-pointer group ${
                  isActivated 
                    ? 'bg-white border-[#FF5A00] shadow-md ring-1 ring-[#FF5A00]' 
                    : 'bg-[#F9F9F8] border-gray-300 hover:border-gray-500 opacity-90'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className={`p-2 border-2 ${isActivated ? 'bg-orange-50 border-[#FF5A00] text-[#FF5A00]' : 'bg-white border-gray-300 text-gray-500'}`}>
                      <IconComp className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-tighter">
                        {mod.category}
                      </span>
                      {/* Action buttons */}
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModule(mod);
                          }}
                          className="p-1 hover:bg-gray-200 text-gray-500 hover:text-[#FF5A00] transition-colors cursor-pointer"
                          title="Edit Module"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(mod.id);
                          }}
                          className="p-1 hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Module"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wide group-hover:text-[#FF5A00] transition-colors">{mod.name}</h4>
                    <p className="text-[10px] text-gray-500 leading-tight h-12 overflow-hidden line-clamp-3">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-3 flex items-center justify-between font-mono">
                  <span className="text-[10px] text-gray-600 font-bold">${mod.price} / mo</span>
                  
                  {/* Activation switch visual */}
                  <div className={`w-8 h-4 flex items-center border p-0.5 cursor-pointer ${
                    isActivated ? 'bg-[#FF5A00] border-[#FF5A00]' : 'bg-gray-200 border-gray-300'
                  }`}>
                    <div className={`w-3.5 h-2.5 bg-white transition-all ${
                      isActivated ? 'translate-x-3.5' : ''
                    }`} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: VENDOR LICENSING SIMULATOR */}
      <section id="section_licensing_simulator" className="space-y-4">
        <div className="border-b-4 border-[#1A1A1A] pb-3 space-y-1">
          <h2 className="text-lg font-black uppercase text-[#1A1A1A] tracking-wider flex items-center space-x-2">
            <span className="bg-[#FF5A00] text-white text-xs font-mono font-bold px-1.5 py-0.5">LAYER 4</span>
            <span>Vendor Licensing & Quota Simulator</span>
          </h2>
          <p className="text-xs text-gray-500 font-mono">RUN REAL-TIME LICENSING MATHEMATICS AND HARDWARE ALLOCATIONS</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Simulator Control Board */}
          <div className="lg:col-span-7 bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wide border-b border-gray-200 pb-2">
                Simulated Config Parameters
              </h3>

              {/* Param 1: Select Vendor */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-600 uppercase block">Select Target Vendor Context</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none"
                >
                  {vendors && vendors.length > 0 ? (
                    vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category} • {v.id})
                      </option>
                    ))
                  ) : (
                    <option value="V-209">AtomiCo QuickShop (Convenience Stores • V-209)</option>
                  )}
                </select>
                <span className="text-[9px] text-gray-400 font-mono block">SIMULATING SEIGEN-VETTED COMPLIANCE CODE: {simulatedVendor?.code || 'ATC-209'}</span>
              </div>

              {/* Param 2: Select Platform Plan */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-600 uppercase block font-mono">Select Core Platform Plan</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {plans.map(p => {
                    const isSelected = p.id === simulatedPlanId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSimulatedPlanId(p.id)}
                        className={`p-2.5 text-center font-mono text-xs uppercase font-bold border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                            : 'bg-[#F4F4F1] text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {p.name}
                        <span className="block text-[9px] text-orange-500 mt-1">
                          {p.isCustomPrice ? 'Custom' : `$${p.price}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Param 3: Adjust Capacity Multipliers */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-gray-600 uppercase block">Simulated Capacity Overrides</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs bg-gray-50 border border-gray-200 p-4">
                  {capacities.map(cap => (
                    <div key={cap.id} className="flex justify-between items-center">
                      <span className="text-gray-600 uppercase text-[10px]">{cap.name}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDecrementCapacity(cap.id)}
                          className="w-6 h-6 border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center cursor-pointer font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">{cap.allocation}</span>
                        <button
                          onClick={() => handleIncrementCapacity(cap.id)}
                          className="w-6 h-6 border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center cursor-pointer font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Param 4: Active Modules quick summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-gray-600 uppercase block">Active Plug-in Engines ({activeModules.length} provisioned)</label>
                <p className="text-xs text-gray-500">
                  Select and de-select modules directly in the Section 3 grid above to add dynamic capabilities to the simulation engine.
                </p>
              </div>

            </div>

            <div className="bg-[#FF5A00]/5 border border-[#FF5A00]/20 p-3 text-[11px] text-gray-600 font-sans leading-normal">
              <strong>OPERATIONAL NOTE:</strong> Real-time hardware key bonds are generated using SGN standard RSA signatures on final commit. Deactivating a module clears its licensing cache instantly.
            </div>
          </div>

          {/* Live License Summary Board */}
          <div className="lg:col-span-5 bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col justify-between space-y-6 font-mono">
            <div className="space-y-4">
              <div className="space-y-1 border-b border-[#D1D1CF] pb-3">
                <span className="bg-[#1A1A1A] text-[#FF5A00] font-bold px-1.5 py-0.2 text-[9px] uppercase inline-block">
                  Live License Summary
                </span>
                <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider">
                  seiGEN Operational Binds
                </h3>
                <p className="text-[9px] text-gray-400">LEDGER REAL-TIME CALCULATED SLABS</p>
              </div>

              {/* Mathematical breakdown list */}
              <div className="space-y-2.5 text-xs">
                
                {/* Platform */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-400 uppercase">Platform Tier</span>
                  <div className="text-right">
                    <strong className="text-gray-950 font-bold uppercase">{currentSimulatedPlan.name} Plan</strong>
                    <span className="block text-[10px] text-gray-500">${planBaseCost} / Month</span>
                  </div>
                </div>

                {/* Capacity upgrades breakdown */}
                <div className="flex justify-between items-start pb-2 border-b border-gray-200">
                  <span className="text-gray-400 uppercase">Capacity Expansion</span>
                  <div className="text-right space-y-0.5">
                    <strong className="text-gray-950 font-bold uppercase">
                      {capacities.filter(c => c.allocation > 0).length} Upgrades Bound
                    </strong>
                    <div className="text-[10px] text-gray-500 leading-tight">
                      {capacities.filter(c => c.allocation > 0).map(c => `${c.allocation}x ${c.name}`).join(', ') || 'No capacity expansions'}
                    </div>
                    <span className="block text-[10px] text-gray-500">+${totalCapacityCost} / Month</span>
                  </div>
                </div>

                {/* Modules upgrades breakdown */}
                <div className="flex justify-between items-start pb-2 border-b border-gray-200">
                  <span className="text-gray-400 uppercase">Specialized Modules</span>
                  <div className="text-right space-y-0.5">
                    <strong className="text-gray-950 font-bold uppercase">
                      {selectedModulesDetails.length} App Engines Active
                    </strong>
                    <div className="text-[9px] text-gray-500 max-w-[200px] leading-tight break-words">
                      {selectedModulesDetails.map(m => m.name).join(', ') || 'No modules selected'}
                    </div>
                    <span className="block text-[10px] text-gray-500">+${totalModulesCost} / Month</span>
                  </div>
                </div>

                {/* Dynamic quotas usage indicators */}
                <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-3 space-y-1.5 text-[11px]">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">QUOTA SIMULATION LIMITS:</span>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Physical Store Branches Limit:</span>
                    <strong className="text-[#1A1A1A] font-bold">{totalSimulatedBranchesLimit} Allowed</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Licensed Hardware Terminals:</span>
                    <strong className="text-[#1A1A1A] font-bold">{totalSimulatedTerminalsLimit} Terminals</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned Vendor Key:</span>
                    <span className="text-gray-700 font-mono">SGN-VND-KEY-{simulatedVendor?.id || 'ATC209'}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* GRAND MONTHLY TOTAL */}
            <div className="bg-[#1A1A1A] p-4 text-center border-t-4 border-[#FF5A00]">
              <div className="text-[10px] text-[#FF5A00] font-black uppercase tracking-widest">Calculated Monthly Total</div>
              <div className="text-3xl font-sans font-black text-white mt-1">
                ${finalSimulatedMonthlyTotal.toLocaleString()}
              </div>
              <div className="text-[9px] text-gray-400 uppercase tracking-tight mt-1 font-mono">
                SIMULATED BILLING CYCLE • NO CARD REQUIRED
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: BUSINESS GROWTH TIMELINE */}
      <section id="section_growth_timeline" className="space-y-6">
        <div className="border-b-4 border-[#1A1A1A] pb-3 space-y-1">
          <h2 className="text-lg font-black uppercase text-[#1A1A1A] tracking-wider flex items-center space-x-2">
            <span className="bg-[#FF5A00] text-white text-xs font-mono font-bold px-1.5 py-0.5">LAYER 5</span>
            <span>Business Growth Timeline</span>
          </h2>
          <p className="text-xs text-gray-500 font-mono">NATURAL PROGRESSION THROUGH THE SEIGEN COMMERCE INTEGRATION PLATFORM</p>
        </div>

        {/* Visual interactive road map layout */}
        <div className="bg-white border-2 border-[#1A1A1A] p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative">
            
            {/* connecting bar overlay */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 hidden lg:block z-0" />

            {/* Node 1: Startup */}
            <div className="relative z-10 bg-[#F4F4F1] border-2 border-[#1A1A1A] p-5 flex flex-col justify-between space-y-3 rounded-none group hover:border-[#FF5A00] transition-colors">
              <div className="w-10 h-10 bg-white border-2 border-[#1A1A1A] group-hover:bg-[#FF5A00] group-hover:text-white transition-colors flex items-center justify-center font-mono font-black text-xs text-[#1A1A1A]">
                SGN-I
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">1. Startup Phase</h4>
                <p className="text-[11px] text-gray-500 font-sans leading-tight">
                  Tuckshops, kiosks and salons launch core checkout binds. Minimal capital, simple offline inventory and cashier shifts tracking.
                </p>
              </div>
              <span className="text-[9px] font-mono text-[#FF5A00] font-bold uppercase tracking-wider block">Starter Plan • $10/mo</span>
            </div>

            {/* Node 2: Growth */}
            <div className="relative z-10 bg-[#F4F4F1] border-2 border-[#1A1A1A] p-5 flex flex-col justify-between space-y-3 rounded-none group hover:border-[#FF5A00] transition-colors">
              <div className="w-10 h-10 bg-white border-2 border-[#1A1A1A] group-hover:bg-[#FF5A00] group-hover:text-white transition-colors flex items-center justify-center font-mono font-black text-xs text-[#1A1A1A]">
                SGN-II
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">2. Growth Phase</h4>
                <p className="text-[11px] text-gray-500 font-sans leading-tight">
                  Expanding physical stores add secondary branch routes. Enable purchase order schedules, return logic and WhatsApp receipts.
                </p>
              </div>
              <span className="text-[9px] font-mono text-[#FF5A00] font-bold uppercase tracking-wider block">Growth Plan • $25/mo</span>
            </div>

            {/* Node 3: Professional */}
            <div className="relative z-10 bg-[#1A1A1A] border-2 border-[#FF5A00] p-5 flex flex-col justify-between space-y-3 rounded-none group text-white">
              <div className="w-10 h-10 bg-[#FF5A00] text-white border-2 border-[#FF5A00] flex items-center justify-center font-mono font-black text-xs">
                SGN-III
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">3. Professional Core</h4>
                <p className="text-[11px] text-gray-300 font-sans leading-tight">
                  Mid-market businesses sync multi-warehouses and dispatch delivery riders. Execute real-time role-based tracking logs.
                </p>
              </div>
              <span className="text-[9px] font-mono text-[#FF5A00] font-bold uppercase tracking-wider block">Professional • $50/mo</span>
            </div>

            {/* Node 4: Business Plus */}
            <div className="relative z-10 bg-[#F4F4F1] border-2 border-[#1A1A1A] p-5 flex flex-col justify-between space-y-3 rounded-none group hover:border-[#FF5A00] transition-colors">
              <div className="w-10 h-10 bg-white border-2 border-[#1A1A1A] group-hover:bg-[#FF5A00] group-hover:text-white transition-colors flex items-center justify-center font-mono font-black text-xs text-[#1A1A1A]">
                SGN-IV
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">4. Business Plus</h4>
                <p className="text-[11px] text-gray-500 font-sans leading-tight">
                  National entities run predictive AI assistants and supplier matchmaking channels. Drive sales via unified marketplaces.
                </p>
              </div>
              <span className="text-[9px] font-mono text-[#FF5A00] font-bold uppercase tracking-wider block">Business Plus • $100/mo</span>
            </div>

            {/* Node 5: Enterprise */}
            <div className="relative z-10 bg-[#F4F4F1] border-2 border-[#1A1A1A] p-5 flex flex-col justify-between space-y-3 rounded-none group hover:border-[#FF5A00] transition-colors">
              <div className="w-10 h-10 bg-white border-2 border-[#1A1A1A] group-hover:bg-[#FF5A00] group-hover:text-white transition-colors flex items-center justify-center font-mono font-black text-xs text-[#1A1A1A]">
                SGN-V
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">5. Custom Enterprise</h4>
                <p className="text-[11px] text-gray-500 font-sans leading-tight">
                  Supermarkets and distribution giants run on hyper-scale dedicated Spanner cluster pools with 24/7 priority SLAs.
                </p>
              </div>
              <span className="text-[9px] font-mono text-[#FF5A00] font-bold uppercase tracking-wider block">Enterprise • Custom</span>
            </div>

          </div>

          <div className="border-t border-[#D1D1CF] mt-6 pt-4 text-center text-xs text-gray-500">
            <strong>ARCHITECTURE ZERO-UPGRADE GUARANTEE:</strong> Every tier runs on the exact same microservice backend codebase. Upgrading tier scales resource instances and activates cryptographic gateways seamlessly without code rewrites or database migrations.
          </div>
        </div>
      </section>

      {/* VIEW DETAILS MODAL */}
      {detailsPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-2xl shadow-2xl rounded-none relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />
            
            <div className="p-6 border-b border-[#D1D1CF] flex justify-between items-start">
              <div className="space-y-1">
                <span className="bg-[#1A1A1A] text-white px-2 py-0.5 text-[9px] font-mono font-black uppercase inline-block">
                  Plan Specifications Blueprint
                </span>
                <h3 className="text-xl font-black text-[#1A1A1A] uppercase tracking-wide">
                  {detailsPlan.name} Tier Details
                </h3>
              </div>
              <button 
                onClick={() => setDetailsPlan(null)}
                className="p-1 text-gray-400 hover:text-[#FF5A00] transition-colors focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Specifications Lists */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
              <div className="bg-[#F4F4F1] p-4 border border-[#D1D1CF] space-y-2">
                <h4 className="text-xs font-mono font-black text-gray-400 uppercase tracking-widest">Business Target Segment:</h4>
                <p className="font-sans text-[#1A1A1A] font-bold leading-normal">{detailsPlan.targetBusiness}</p>
                <p className="text-xs text-gray-600 leading-relaxed pt-1 font-serif italic">{detailsPlan.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono font-black text-gray-400 uppercase tracking-widest border-b border-gray-300 pb-1">Capacity Bounds</h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Businesses:</span>
                      <strong className="text-[#1A1A1A] font-sans font-bold">{detailsPlan.limits.businesses}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Physical Branches:</span>
                      <strong className="text-[#1A1A1A] font-sans font-bold">{detailsPlan.limits.branches}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Terminal Binds:</span>
                      <strong className="text-[#1A1A1A] font-sans font-bold">{detailsPlan.limits.terminals}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Staff Limit:</span>
                      <strong className="text-[#1A1A1A] font-sans font-bold">{detailsPlan.limits.staff}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono font-black text-gray-400 uppercase tracking-widest border-b border-gray-300 pb-1">Asset Quotas</h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max Products:</span>
                      <strong className="text-[#1A1A1A] font-sans font-bold">{detailsPlan.limits.products}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max Customers:</span>
                      <strong className="text-[#1A1A1A] font-sans font-bold">{detailsPlan.limits.customers}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base SLA Target:</span>
                      <strong className="text-[#1A1A1A] font-sans font-bold">99.9% Up-time</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Security Encrypted:</span>
                      <strong className="text-[#1A1A1A] font-sans font-bold">SHA-256 HSM</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules details */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black text-gray-400 uppercase tracking-widest border-b border-gray-300 pb-1">Included Modules Blueprint</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {detailsPlan.modules.map((mod, index) => (
                    <div key={index} className="bg-[#F4F4F1] border border-gray-300/80 p-2 font-mono text-[11px] text-gray-700 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5A00] shrink-0" />
                      <span className="truncate">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-6 bg-gray-50 border-t border-[#D1D1CF] flex justify-end">
              <button
                onClick={() => setDetailsPlan(null)}
                className="bg-[#1A1A1A] hover:bg-black text-white px-6 py-2.5 font-mono font-bold text-xs uppercase rounded-none transition-colors cursor-pointer"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleSubmitCreate}
            className="bg-white border-4 border-[#1A1A1A] w-full max-w-5xl shadow-2xl rounded-none relative flex flex-col max-h-[95vh]"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />
            
            <div className="p-6 border-b border-[#D1D1CF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="bg-[#FF5A00] text-white px-2 py-0.5 text-[9px] font-mono font-black uppercase inline-block">
                  SGN-LEDGER REGISTRATION GATE
                </span>
                <h3 className="text-xl font-black text-[#1A1A1A] uppercase tracking-wide">
                  Provision New License Plan
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1 text-gray-400 hover:text-[#FF5A00] focus:outline-none self-end sm:self-auto"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* QUICK PRESET PICKER */}
            <div className="px-6 py-3 bg-stone-100 border-b border-[#D1D1CF] flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold mr-2">Quick Presets:</span>
              <button
                type="button"
                onClick={() => applyPresetTemplate('starter')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Starter
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('growth')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Growth
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('pro')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Professional
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('plus')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Business Plus
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('enterprise')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Enterprise
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => setFormModules(Object.values(FEATURE_PRESETS_CATEGORIES).flat())}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-[#1A1A1A] text-white hover:bg-black transition-colors"
              >
                Select All Features
              </button>
              <button
                type="button"
                onClick={() => setFormModules([])}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-600 transition-colors"
              >
                Deselect All
              </button>
            </div>

            {/* Dual Column Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[65vh]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Metadata & Capacity Bounds */}
                <div className="lg:col-span-5 space-y-4 text-xs font-mono">
                  <div className="bg-gray-50 p-4 border border-gray-300 space-y-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-gray-200 pb-1">1. Plan Metadata & Billing</span>
                    
                    <div className="space-y-1">
                      <label className="text-gray-600 uppercase font-bold block">Plan Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Starter Pro Plus"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-600 uppercase font-bold block">Target Segment</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Small Warehouses • Retailers"
                        value={formTarget}
                        onChange={(e) => setFormTarget(e.target.value)}
                        className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-600 uppercase font-bold block">Plan Pitch / Description</label>
                      <textarea
                        placeholder="Summarize key target market and capacity limits..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-sans"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-600 uppercase font-bold">Custom/Enterprise Price</label>
                        <input
                          type="checkbox"
                          checked={formIsCustomPrice}
                          onChange={(e) => setFormIsCustomPrice(e.target.checked)}
                          className="w-4 h-4 text-[#FF5A00] focus:ring-[#FF5A00] border-gray-300 rounded cursor-pointer"
                        />
                      </div>

                      {!formIsCustomPrice && (
                        <div className="space-y-1">
                          <label className="text-gray-600 uppercase font-bold block">Monthly Fee ($)</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={formPrice}
                            onChange={(e) => setFormPrice(Number(e.target.value))}
                            className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 border border-gray-300 space-y-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-gray-200 pb-1">2. Hardware / Software Limits</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Businesses Limit</label>
                        <input
                          type="text"
                          value={formLimits.businesses}
                          onChange={(e) => setFormLimits({ ...formLimits, businesses: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Physical Branches</label>
                        <input
                          type="text"
                          value={formLimits.branches}
                          onChange={(e) => setFormLimits({ ...formLimits, branches: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Licensed Terminals</label>
                        <input
                          type="text"
                          value={formLimits.terminals}
                          onChange={(e) => setFormLimits({ ...formLimits, terminals: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Staff Limit</label>
                        <input
                          type="text"
                          value={formLimits.staff}
                          onChange={(e) => setFormLimits({ ...formLimits, staff: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Product Catalog Limit</label>
                        <input
                          type="text"
                          value={formLimits.products}
                          onChange={(e) => setFormLimits({ ...formLimits, products: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Max Customers</label>
                        <input
                          type="text"
                          value={formLimits.customers}
                          onChange={(e) => setFormLimits({ ...formLimits, customers: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-gray-600 uppercase block">Warehouses Limit</label>
                        <input
                          type="text"
                          value={formLimits.warehouses}
                          onChange={(e) => setFormLimits({ ...formLimits, warehouses: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pre-packaged Module Selection */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-stone-50 border border-gray-300 p-4 space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">3. Pre-Packaged Feature Registry</span>
                        <p className="text-[10px] text-gray-500 font-sans">Toggle modular apps bundled inside this licensing slab</p>
                      </div>
                      <div className="text-[10px] font-mono bg-orange-100 border border-orange-300 text-[#FF5A00] font-bold px-2 py-0.5">
                        {formModules.length} SELECTED
                      </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 max-h-[48vh] pr-1">
                      {Object.entries(FEATURE_PRESETS_CATEGORIES).map(([category, items]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-[10px] font-mono font-black text-[#FF5A00] uppercase tracking-wider bg-gray-200/60 px-2 py-1 flex justify-between items-center">
                            <span>{category}</span>
                            <div className="space-x-1.5 text-[8px] font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = formModules.filter(m => !items.includes(m));
                                  setFormModules([...filtered, ...items]);
                                }}
                                className="hover:text-black uppercase"
                              >
                                [ All ]
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormModules(formModules.filter(m => !items.includes(m)));
                                }}
                                className="hover:text-black uppercase"
                              >
                                [ None ]
                              </button>
                            </div>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                            {items.map((mod) => {
                              const isChecked = formModules.includes(mod);
                              return (
                                <label 
                                  key={mod}
                                  className={`flex items-start space-x-2 p-2 border transition-all cursor-pointer ${
                                    isChecked 
                                      ? 'bg-white border-[#FF5A00] shadow-xs' 
                                      : 'bg-white/40 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setFormModules(formModules.filter(m => m !== mod));
                                      } else {
                                        setFormModules([...formModules, mod]);
                                      }
                                    }}
                                    className="mt-0.5 text-[#FF5A00] focus:ring-[#FF5A00] border-gray-300 rounded cursor-pointer shrink-0"
                                  />
                                  <span className="text-[11px] font-mono leading-tight text-gray-700">{mod}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-[#D1D1CF] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FF5A00] hover:bg-[#E04F00] text-white px-7 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer shadow-md transition-all"
              >
                Provision Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleSubmitEdit}
            className="bg-white border-4 border-[#1A1A1A] w-full max-w-5xl shadow-2xl rounded-none relative flex flex-col max-h-[95vh]"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />
            
            <div className="p-6 border-b border-[#D1D1CF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="bg-[#1A1A1A] text-[#FF5A00] px-2 py-0.5 text-[9px] font-mono font-black uppercase inline-block">
                  SGN-PRC SYSTEM OVERRIDE
                </span>
                <h3 className="text-xl font-black text-[#1A1A1A] uppercase tracking-wide">
                  Edit "{editPlan.name}" Properties
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditPlan(null)}
                className="p-1 text-gray-400 hover:text-[#FF5A00] focus:outline-none self-end sm:self-auto"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* QUICK PRESET PICKER */}
            <div className="px-6 py-3 bg-stone-100 border-b border-[#D1D1CF] flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold mr-2">Quick Presets:</span>
              <button
                type="button"
                onClick={() => applyPresetTemplate('starter')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Starter
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('growth')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Growth
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('pro')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Professional
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('plus')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Business Plus
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('enterprise')}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 hover:border-[#FF5A00] text-gray-700 hover:text-[#FF5A00] transition-colors"
              >
                Enterprise
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => setFormModules(Object.values(FEATURE_PRESETS_CATEGORIES).flat())}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-[#1A1A1A] text-white hover:bg-black transition-colors"
              >
                Select All Features
              </button>
              <button
                type="button"
                onClick={() => setFormModules([])}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-600 transition-colors"
              >
                Deselect All
              </button>
            </div>

            {/* Dual Column Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[65vh]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Metadata & Capacity Bounds */}
                <div className="lg:col-span-5 space-y-4 text-xs font-mono">
                  <div className="bg-gray-50 p-4 border border-gray-300 space-y-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-gray-200 pb-1">1. Plan Metadata & Billing</span>
                    
                    <div className="space-y-1">
                      <label className="text-gray-600 uppercase font-bold block">Plan Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Plan Name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-600 uppercase font-bold block">Target Segment</label>
                      <input
                        type="text"
                        required
                        placeholder="Target Segment"
                        value={formTarget}
                        onChange={(e) => setFormTarget(e.target.value)}
                        className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-600 uppercase font-bold block">Plan Pitch / Description</label>
                      <textarea
                        placeholder="Summarize key target market and capacity limits..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-sans"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-600 uppercase font-bold">Custom/Enterprise Price</label>
                        <input
                          type="checkbox"
                          checked={formIsCustomPrice}
                          onChange={(e) => setFormIsCustomPrice(e.target.checked)}
                          className="w-4 h-4 text-[#FF5A00] focus:ring-[#FF5A00] border-gray-300 rounded cursor-pointer"
                        />
                      </div>

                      {!formIsCustomPrice && (
                        <div className="space-y-1">
                          <label className="text-gray-600 uppercase font-bold block">Monthly Fee ($)</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={formPrice}
                            onChange={(e) => setFormPrice(Number(e.target.value))}
                            className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 border border-gray-300 space-y-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-gray-200 pb-1">2. Hardware / Software Limits</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Businesses Limit</label>
                        <input
                          type="text"
                          value={formLimits.businesses}
                          onChange={(e) => setFormLimits({ ...formLimits, businesses: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Physical Branches</label>
                        <input
                          type="text"
                          value={formLimits.branches}
                          onChange={(e) => setFormLimits({ ...formLimits, branches: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Licensed Terminals</label>
                        <input
                          type="text"
                          value={formLimits.terminals}
                          onChange={(e) => setFormLimits({ ...formLimits, terminals: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Staff Limit</label>
                        <input
                          type="text"
                          value={formLimits.staff}
                          onChange={(e) => setFormLimits({ ...formLimits, staff: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Product Catalog Limit</label>
                        <input
                          type="text"
                          value={formLimits.products}
                          onChange={(e) => setFormLimits({ ...formLimits, products: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-600 uppercase block">Max Customers</label>
                        <input
                          type="text"
                          value={formLimits.customers}
                          onChange={(e) => setFormLimits({ ...formLimits, customers: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-gray-600 uppercase block">Warehouses Limit</label>
                        <input
                          type="text"
                          value={formLimits.warehouses}
                          onChange={(e) => setFormLimits({ ...formLimits, warehouses: e.target.value })}
                          className="w-full bg-white border border-gray-300 p-1.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pre-packaged Module Selection */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-stone-50 border border-gray-300 p-4 space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">3. Pre-Packaged Feature Registry</span>
                        <p className="text-[10px] text-gray-500 font-sans">Toggle modular apps bundled inside this licensing slab</p>
                      </div>
                      <div className="text-[10px] font-mono bg-orange-100 border border-orange-300 text-[#FF5A00] font-bold px-2 py-0.5">
                        {formModules.length} SELECTED
                      </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 max-h-[48vh] pr-1">
                      {Object.entries(FEATURE_PRESETS_CATEGORIES).map(([category, items]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-[10px] font-mono font-black text-[#FF5A00] uppercase tracking-wider bg-gray-200/60 px-2 py-1 flex justify-between items-center">
                            <span>{category}</span>
                            <div className="space-x-1.5 text-[8px] font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = formModules.filter(m => !items.includes(m));
                                  setFormModules([...filtered, ...items]);
                                }}
                                className="hover:text-black uppercase"
                              >
                                [ All ]
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormModules(formModules.filter(m => !items.includes(m)));
                                }}
                                className="hover:text-black uppercase"
                              >
                                [ None ]
                              </button>
                            </div>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                            {items.map((mod) => {
                              const isChecked = formModules.includes(mod);
                              return (
                                <label 
                                  key={mod}
                                  className={`flex items-start space-x-2 p-2 border transition-all cursor-pointer ${
                                    isChecked 
                                      ? 'bg-white border-[#FF5A00] shadow-xs' 
                                      : 'bg-white/40 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setFormModules(formModules.filter(m => m !== mod));
                                      } else {
                                        setFormModules([...formModules, mod]);
                                      }
                                    }}
                                    className="mt-0.5 text-[#FF5A00] focus:ring-[#FF5A00] border-gray-300 rounded cursor-pointer shrink-0"
                                  />
                                  <span className="text-[11px] font-mono leading-tight text-gray-700">{mod}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-[#D1D1CF] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditPlan(null)}
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FF5A00] hover:bg-[#E04F00] text-white px-7 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer shadow-md transition-all"
              >
                Commit Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CAPACITY UPGRADE MODAL */}
      {capacityDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleSubmitCapacity}
            className="bg-white border-4 border-[#1A1A1A] w-full max-w-xl shadow-2xl rounded-none relative flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />
            
            <div className="p-5 border-b border-[#D1D1CF] flex justify-between items-center">
              <div className="space-y-1">
                <span className="bg-[#FF5A00] text-white px-2 py-0.5 text-[9px] font-mono font-black uppercase inline-block">
                  SGN-LEDGER EXPANSION GATE
                </span>
                <h3 className="text-lg font-black text-[#1A1A1A] uppercase tracking-wide">
                  {editCapacity ? 'Edit Capacity Upgrade' : 'Create Capacity Upgrade'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setCapacityDialogOpen(false)}
                className="p-1 text-gray-400 hover:text-[#FF5A00] focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-600 uppercase font-bold block">Upgrade Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extra Branch"
                  value={capFormName}
                  onChange={(e) => setCapFormName(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-600 uppercase font-bold block">Monthly Cost ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="15"
                    value={capFormCost}
                    onChange={(e) => setCapFormCost(Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-600 uppercase font-bold block">Unit Suffix</label>
                  <input
                    type="text"
                    required
                    placeholder="Branch, Terminal, GB, etc."
                    value={capFormUnit}
                    onChange={(e) => setCapFormUnit(e.target.value)}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-600 uppercase font-bold block">Current Simulation Allocation</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={capFormAllocation}
                    onChange={(e) => setCapFormAllocation(Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-600 uppercase font-bold block">Max Simulation Allocation</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={capFormMaxAllocation}
                    onChange={(e) => setCapFormMaxAllocation(Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-gray-600 uppercase font-bold font-mono text-xs block">Description</label>
                <textarea
                  placeholder="Describe what this capacity upgrade increases..."
                  value={capFormDesc}
                  onChange={(e) => setCapFormDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-[#D1D1CF] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCapacityDialogOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FF5A00] hover:bg-[#E04F00] text-white px-5 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer shadow-md transition-all"
              >
                {editCapacity ? 'Save Changes' : 'Create Option'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BUSINESS MODULE MARKETPLACE MODAL */}
      {moduleDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleSubmitModule}
            className="bg-white border-4 border-[#1A1A1A] w-full max-w-xl shadow-2xl rounded-none relative flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />
            
            <div className="p-5 border-b border-[#D1D1CF] flex justify-between items-center">
              <div className="space-y-1">
                <span className="bg-[#FF5A00] text-white px-2 py-0.5 text-[9px] font-mono font-black uppercase inline-block">
                  SGN-LEDGER MODULE GATE
                </span>
                <h3 className="text-lg font-black text-[#1A1A1A] uppercase tracking-wide">
                  {editModule ? 'Edit Business Module' : 'Create Business Module'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setModuleDialogOpen(false)}
                className="p-1 text-gray-400 hover:text-[#FF5A00] focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-600 uppercase font-bold block">Module Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manufacturing Core"
                  value={modFormName}
                  onChange={(e) => setModFormName(e.target.value)}
                  className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-600 uppercase font-bold block">Monthly Price ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="19"
                    value={modFormPrice}
                    onChange={(e) => setModFormPrice(Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-600 uppercase font-bold block">Category</label>
                  <select
                    value={modFormCategory}
                    onChange={(e) => setModFormCategory(e.target.value as any)}
                    className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs font-mono"
                  >
                    <option value="POS & Store">POS & Store</option>
                    <option value="Intelligence & AI">Intelligence & AI</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Back Office">Back Office</option>
                    <option value="Integrations">Integrations</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-600 uppercase font-bold block">Icon Visual</label>
                <div className="grid grid-cols-6 gap-2 bg-gray-50 border border-gray-300 p-2 max-h-28 overflow-y-auto">
                  {Object.keys(ICON_MAP).map(icoKey => {
                    const TargetIcon = ICON_MAP[icoKey];
                    const isSelected = modFormIconName === icoKey;
                    return (
                      <button
                        key={icoKey}
                        type="button"
                        onClick={() => setModFormIconName(icoKey)}
                        className={`p-2 flex flex-col items-center justify-center border transition-all cursor-pointer ${
                          isSelected ? 'bg-orange-100 border-[#FF5A00] text-[#FF5A00]' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                        title={icoKey}
                      >
                        <TargetIcon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-gray-600 uppercase font-bold font-mono text-xs block">Description</label>
                <textarea
                  placeholder="Summarize function, sync channels, or automated ledgers..."
                  value={modFormDesc}
                  onChange={(e) => setModFormDesc(e.target.value)}
                  rows={2.5}
                  className="w-full bg-white border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-[#D1D1CF] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setModuleDialogOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FF5A00] hover:bg-[#E04F00] text-white px-5 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer shadow-md transition-all"
              >
                {editModule ? 'Save Changes' : 'Create Module'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
