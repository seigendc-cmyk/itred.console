import {
  Vendor,
  Plan,
  POSLicense,
  AppLicense,
  ActivationRequest,
  RPNAgent,
  AuditLog,
  FinanceRecord,
  AppNotification,
  SystemConfig,
  IntegrationService,
  MenuFeature,
  StaffDesk,
  StaffMember
} from './types';

export const MOCK_COMPANIES = [
  'seiGEN Commerce Group',
  'iTred Logistics International',
  'Algonquin Super-node',
  'Kaelis Industries Corp',
  'Pacific Retail Aggregates'
];

export const MOCK_ADMINS = [
  { name: 'S. Kaelis', role: 'Lead SysOp', status: 'Active', email: 'kaelis@itred.seigen' },
  { name: 'M. Vance', role: 'Security Architect', status: 'Standby', email: 'vance@itred.seigen' },
  { name: 'K. Chen', role: 'Operations Director', status: 'Active', email: 'chen@itred.seigen' }
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'V-802', name: 'NexaRetail Solutions', category: 'Grocery & Hypermarket', status: 'Active', email: 'seigendc@gmail.com', code: 'NEX-802', joinedDate: '2026-01-14', location: 'Frankfurt, DE', linkedRpnId: 'RPN-001-EU', linkedRpnName: 'Frankfurt-Alpha' },
  { id: 'V-451', name: 'Vanguard Outpost Ltd', category: 'General Goods', status: 'Pending Verification', email: 'seigendc@gmail.com', code: 'VAN-451', joinedDate: '2026-05-20', location: 'Detroit, US', linkedRpnId: 'RPN-002-US', linkedRpnName: 'Virginia-Delta' },
  { id: 'V-209', name: 'AtomiCo QuickShop', category: 'Convenience Stores', status: 'Active', email: 'seigendc@gmail.com', code: 'ATC-209', joinedDate: '2026-03-02', location: 'Tokyo, JP', linkedRpnId: 'RPN-003-AP', linkedRpnName: 'Tokyo-Primary' },
  { id: 'V-311', name: 'KronoMart Hardware', category: 'Building Materials', status: 'Suspended', email: 'compliance@kronotech.com', code: 'KRO-311', joinedDate: '2025-11-18', location: 'Sydney, AU' },
  { id: 'V-774', name: 'Zephyr Fashion House', category: 'Apparel & Footwear', status: 'Active', email: 'billing@zephyrstyle.com', code: 'ZEP-774', joinedDate: '2026-04-11', location: 'Milan, IT', linkedRpnId: 'RPN-001-EU', linkedRpnName: 'Frankfurt-Alpha' },
  { id: 'V-102', name: 'BioFuel Station S-8', category: 'Fuel & Convenience', status: 'Pending Verification', email: 'station8@biofuel.ca', code: 'BFS-102', joinedDate: '2026-06-25', location: 'Calgary, CA' }
];

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'VENDOR_DEMO',
    name: 'Vendor Demo',
    type: 'POS',
    price: 0,
    interval: 'Monthly',
    activeVendors: 0,
    enabledApps: ['Core POS', 'Basic Inventory', 'Audit Trails'],
    maxBranches: '1',
    maxTerminals: '1',
    maxStaff: '2',
    maxProducts: '50',
    status: 'Active'
  },
  {
    id: 'PLN-POS-STARTER',
    name: 'Starter POS',
    type: 'POS',
    price: 49,
    interval: 'Monthly',
    activeVendors: 124,
    enabledApps: ['Core POS', 'Basic Inventory', 'Audit Trails'],
    maxBranches: '1',
    maxTerminals: '1',
    maxStaff: '3',
    maxProducts: '500',
    status: 'Active'
  },
  {
    id: 'PLN-POS-GROWTH',
    name: 'Growth POS',
    type: 'POS',
    price: 129,
    interval: 'Monthly',
    activeVendors: 312,
    enabledApps: ['Core POS', 'Advanced Inventory', 'Basic CRM', 'Reporting Logs'],
    maxBranches: '3',
    maxTerminals: '5',
    maxStaff: '15',
    maxProducts: '5,000',
    status: 'Active'
  },
  {
    id: 'PLN-POS-MULTIBRANCH',
    name: 'Multi-Branch POS',
    type: 'Hybrid',
    price: 299,
    interval: 'Monthly',
    activeVendors: 85,
    enabledApps: ['Core POS', 'Advanced CRM', 'Multi-Store Sync', 'Timesheets Daemon', 'Warehouse Sync'],
    maxBranches: '10',
    maxTerminals: '20',
    maxStaff: '50',
    maxProducts: '25,000',
    status: 'Active'
  },
  {
    id: 'PLN-ENT-COMMERCE',
    name: 'Enterprise Commerce',
    type: 'Hybrid',
    price: 899,
    interval: 'Monthly',
    activeVendors: 24,
    enabledApps: ['Custom Integrations', 'Full App Suite', 'Dedicated API Gateway', 'Real-Time RPN Routing', '24/7 Priority Ops'],
    maxBranches: 'Unlimited',
    maxTerminals: 'Unlimited',
    maxStaff: 'Unlimited',
    maxProducts: 'Unlimited',
    status: 'Active'
  }
];

export const INITIAL_POS_LICENSES: POSLicense[] = [
  { id: 'POS-LIC-8821', vendorName: 'NexaRetail Solutions', terminalId: 'TRM-FKT-001', licenseKey: 'ITRD-POS-F83C-9A2E-449D', status: 'Active', issuedAt: '2026-01-15', planName: 'Growth POS', expiryDate: '2027-01-15', notes: 'Ecosystem standard deployment', billingCycle: 'Yearly', tokenPrice: 1238, collectionTag: 'European Expansion' },
  { id: 'POS-LIC-3310', vendorName: 'AtomiCo QuickShop', terminalId: 'TRM-TYO-501', licenseKey: 'ITRD-POS-C10A-33BF-8822', status: 'Active', issuedAt: '2026-03-02', planName: 'Starter POS', expiryDate: '2027-03-02', notes: 'Single core terminal bind', billingCycle: 'Monthly', tokenPrice: 49, collectionTag: 'Tokyo Stores' },
  { id: 'POS-LIC-9904', vendorName: 'Vanguard Outpost Ltd', terminalId: 'TRM-DET-099', licenseKey: 'ITRD-POS-449F-EAA1-001F', status: 'Pending', issuedAt: '2026-05-22', planName: 'Multi-Branch POS', expiryDate: '2027-05-22', notes: 'Awaiting remote configuration verification', billingCycle: 'Quarterly', tokenPrice: 807, collectionTag: 'US Logistics' },
  { id: 'POS-LIC-1142', vendorName: 'KronoMart Hardware', terminalId: 'TRM-SYD-112', licenseKey: 'ITRD-POS-0081-CC22-EF91', status: 'Expired', issuedAt: '2025-11-18', planName: 'Starter POS', expiryDate: '2026-11-18', notes: 'Automatic subscription cycle ended', billingCycle: 'Monthly', tokenPrice: 49, collectionTag: 'Sydney Retail' },
  { id: 'POS-LIC-7509', vendorName: 'Zephyr Fashion House', terminalId: 'TRM-MLN-704', licenseKey: 'ITRD-POS-B89E-755C-DF4A', status: 'Active', issuedAt: '2026-04-12', planName: 'Enterprise Commerce', expiryDate: '2027-04-12', notes: 'Fully managed edge hardware', billingCycle: 'Yearly', tokenPrice: 8630, collectionTag: 'Milan Runway' }
];

export const INITIAL_APP_LICENSES: AppLicense[] = [
  { id: 'APP-LIC-001', appName: 'Multi-Channel StockSync', vendorName: 'NexaRetail Solutions', status: 'Active', key: 'SGN-SYNC-901B-E81D' },
  { id: 'APP-LIC-002', appName: 'iTred Automated Ledger Pro', vendorName: 'Zephyr Fashion House', status: 'Active', key: 'SGN-LDGR-4451-99B2' },
  { id: 'APP-LIC-003', appName: 'GeoFence Logistics Beacon', vendorName: 'AtomiCo QuickShop', status: 'Pending', key: 'SGN-GEOF-0082-DD4C' },
  { id: 'APP-LIC-004', appName: 'Vance Cryptographic Gateway', vendorName: 'KronoMart Hardware', status: 'Suspended', key: 'SGN-CRYPT-7731-AA22' }
];

export const INITIAL_ACTIVATION_REQUESTS: ActivationRequest[] = [
  { id: 'ACT-902', vendorName: 'Vanguard Outpost Ltd', requestedItem: 'POS Terminal License (TRM-DET-099)', type: 'POS License', date: '2026-06-28', status: 'Pending' },
  { id: 'ACT-903', vendorName: 'BioFuel Station S-8', requestedItem: 'Merchant Verification Protocol', type: 'Vendor Verification', date: '2026-06-29', status: 'Pending' },
  { id: 'ACT-904', vendorName: 'AtomiCo QuickShop', requestedItem: 'GeoFence Logistics Beacon App Integration', type: 'App Integration', date: '2026-06-30', status: 'Pending' },
  { id: 'ACT-850', vendorName: 'Zephyr Fashion House', requestedItem: 'Additional Terminal Pack #4', type: 'POS License', date: '2026-06-15', status: 'Approved' },
  { id: 'ACT-848', vendorName: 'KronoMart Hardware', requestedItem: 'Ledger Patch v12.1 Activation', type: 'App Integration', date: '2026-06-12', status: 'Rejected' }
];

export const INITIAL_RPN_AGENTS: RPNAgent[] = [
  { id: 'RPN-001-EU', name: 'Frankfurt-Alpha', region: 'Europe West', connectionStatus: 'Connected', activeSessions: 1242, throughput: '412.5 Tx/s', linkedVendorIds: ['V-802', 'V-774'] },
  { id: 'RPN-002-US', name: 'Virginia-Delta', region: 'US East', connectionStatus: 'Connected', activeSessions: 2310, throughput: '680.1 Tx/s', linkedVendorIds: ['V-451'] },
  { id: 'RPN-003-AP', name: 'Tokyo-Primary', region: 'Asia Pacific', connectionStatus: 'Connected', activeSessions: 890, throughput: '290.4 Tx/s', linkedVendorIds: ['V-209'] },
  { id: 'RPN-004-LA', name: 'SaoPaulo-Fallback', region: 'Latin America', connectionStatus: 'Standby', activeSessions: 0, throughput: '0.0 Tx/s', linkedVendorIds: [] },
  { id: 'RPN-005-AF', name: 'CapeTown-Edge', region: 'Africa South', connectionStatus: 'Offline', activeSessions: 0, throughput: '0.0 Tx/s', linkedVendorIds: [] }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'AUD-9912', timestamp: '2026-07-01T08:02:11', actor: 'S. Kaelis', action: 'SUSPEND_LICENSE', target: 'POS-LIC-1142 (KronoMart)', status: 'Success' },
  { id: 'AUD-9911', timestamp: '2026-07-01T07:44:50', actor: 'K. Chen', action: 'CREATE_PLAN', target: 'PLN-ENT-02 (Global Syndicate)', status: 'Success' },
  { id: 'AUD-9910', timestamp: '2026-07-01T06:12:01', actor: 'SYSTEM_DAEMON', action: 'RPN_LATENCY_ALERT', target: 'CapeTown-Edge-RPN', status: 'Warning' },
  { id: 'AUD-9909', timestamp: '2026-06-30T23:59:58', actor: 'M. Vance', action: 'ROT_KEY_AUTH', target: 'SysGateway-Node-B', status: 'Success' },
  { id: 'AUD-9908', timestamp: '2026-06-30T19:22:15', actor: 'S. Kaelis', action: 'APPROVE_VENDOR', target: 'Zephyr Fashion House (V-774)', status: 'Success' },
  { id: 'AUD-9907', timestamp: '2026-06-30T14:10:05', actor: 'K. Chen', action: 'REJECT_ACTIVATION', target: 'ACT-848 (KronoMart)', status: 'Success' }
];

export const INITIAL_FINANCE_RECORDS: FinanceRecord[] = [
  { id: 'TXN-001', description: 'NexaRetail - Hybrid Core subscription recurring', amount: 2499.00, type: 'Credit', date: '2026-07-01', refNo: 'REF-SGN-88221' },
  { id: 'TXN-002', description: 'Zephyr Fashion - 4x POS Terminal License issuance', amount: 3400.00, type: 'Credit', date: '2026-06-30', refNo: 'REF-SGN-77512' },
  { id: 'TXN-003', description: 'RPN Node Frankfurt-Alpha co-location uplink fee', amount: 1200.00, type: 'Debit', date: '2026-06-28', refNo: 'REF-EXP-90021' },
  { id: 'TXN-004', description: 'AtomiCo QuickShop - POS high-throughput sub', amount: 850.00, type: 'Credit', date: '2026-06-25', refNo: 'REF-SGN-11233' },
  { id: 'TXN-005', description: 'Vanguard Outpost - Security verification deposit', amount: 500.00, type: 'Credit', date: '2026-06-24', refNo: 'REF-SGN-00492' }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'NTF-1', timestamp: '2026-07-01T08:05:00', title: 'New Vendor Application', message: 'BioFuel Station S-8 has requested verification.', type: 'info', read: false },
  { id: 'NTF-2', timestamp: '2026-07-01T07:15:00', title: 'RPN Node Disconnected', message: 'CapeTown-Edge-RPN has dropped telemetry signal.', type: 'alert', read: false },
  { id: 'NTF-3', timestamp: '2026-07-01T05:00:00', title: 'Daily Settlement Successful', message: 'Completed $7,249.00 in total merchant settling.', type: 'success', read: true },
  { id: 'NTF-4', timestamp: '2026-06-30T18:30:00', title: 'Low Memory on Node-3', message: 'Uplink queue memory exceeded safety threshold (82%).', type: 'warning', read: true }
];

export const INITIAL_SYSTEM_CONFIG: SystemConfig = {
  systemMode: 'Active',
  seiGenVersion: 'v4.14-stable-build.209',
  posHeartbeatInterval: 30,
  debugLogs: false,
  gatewayIp: '10.84.112.5'
};

export const INITIAL_INTEGRATIONS: IntegrationService[] = [
  { id: 'INT-01', name: 'seiGEN Ledger Hub', category: 'Distributed Ledger', status: 'Connected', lastSync: '2026-07-01 08:00:00' },
  { id: 'INT-02', name: 'iTred Freight Telemetry', category: 'Logistics', status: 'Connected', lastSync: '2026-07-01 07:55:00' },
  { id: 'INT-03', name: 'Vance Cryptographic Authority', category: 'Security KMS', status: 'Connected', lastSync: '2026-07-01 08:05:00' },
  { id: 'INT-04', name: 'Global Swift Bridge', category: 'Banking Gateway', status: 'Disconnected', lastSync: '2026-06-30 12:00:00' },
  { id: 'INT-05', name: 'Stripe Corporate Clearing', category: 'Merchant Aggregator', status: 'Connected', lastSync: '2026-07-01 07:48:00' }
];

export const INITIAL_MENU_FEATURES: MenuFeature[] = [
  { id: 'dashboard', label: 'Dashboard', category: 'General', description: 'Access main monitoring metrics and lifecycle shortcuts.' },
  { id: 'vendors', label: 'Vendor Management', category: 'Operations', description: 'Register, review, edit, and approve enterprise vendors.' },
  { id: 'plans', label: 'Plans & Pricing', category: 'Licensing', description: 'Configure billing schedules and capacity tier slabs.' },
  { id: 'pos', label: 'POS Licensing', category: 'Licensing', description: 'Issue, suspend, revoke and inspect terminal hardware clearance keys.' },
  { id: 'apps', label: 'App Licensing', category: 'Licensing', description: 'Manage ecosystem suite application integrations.' },
  { id: 'activations', label: 'Activation Requests', category: 'Security', description: 'Authorize incoming hardware TPM credentials.' },
  { id: 'rpn', label: 'RPN Management', category: 'Operations', description: 'Administer relay processing nodes and client transits.' },
  { id: 'finance', label: 'Finance', category: 'Operations', description: 'Track transactional records and ledger balances.' },
  { id: 'staff_roles', label: 'Staff Desks & Roles', category: 'Security', description: 'Manage employee workspace dashboards and desk tree permissions.' },
  { id: 'menu_features', label: 'Menu Features Registry', category: 'Security', description: 'Define structural access menus and route binds.' },
  { id: 'settings', label: 'System Settings', category: 'General', description: 'Manage daemon heartbeat rates and system variables.' },
  { id: 'notifications', label: 'Notifications', category: 'General', description: 'Review system alert broadcasts and logs.' }
];

export const INITIAL_STAFF_DESKS: StaffDesk[] = [
  { id: 'DESK-001', name: 'Master Operations Console', status: 'Active', ipAddress: '10.0.0.1', location: 'London Co-Loc', menuAccessIds: ['dashboard', 'vendors', 'plans', 'pos', 'apps', 'activations', 'rpn', 'finance', 'staff_roles', 'menu_features', 'settings', 'notifications'] },
  { id: 'DESK-002', name: 'Standard Clerk Desk', status: 'Active', ipAddress: '10.0.1.25', location: 'Branch Alpha', menuAccessIds: ['dashboard', 'vendors', 'notifications'] }
];

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  { id: 'STF-001', name: 'S. Kaelis', role: 'Lead SysOp', email: 'kaelis@itred.seigen', status: 'Active', hasEmployeeCreationAccess: true, deskId: 'DESK-001', welcomeMessage: 'Welcome to the Master Ops node, Lead SysOp Kaelis.' },
  { id: 'STF-002', name: 'M. Vance', role: 'Security Architect', email: 'vance@itred.seigen', status: 'Active', hasEmployeeCreationAccess: true, deskId: 'DESK-001', welcomeMessage: 'Security protocols active. System secure.' },
  { id: 'STF-003', name: 'K. Chen', role: 'Operations Assistant', email: 'chen@itred.seigen', status: 'Active', hasEmployeeCreationAccess: false, deskId: 'DESK-002', welcomeMessage: 'Clerk terminal active. Direct routing enabled.' }
];

