export interface Vendor {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Pending Verification' | 'Suspended' | 'Rejected' | 'Approved' | 'Ready';
  email: string;
  code: string;
  joinedDate: string;
  location: string;
  
  // P-05 Company Registration Fields
  tradingName?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  requestedApps?: string[];
  assignedPlanId?: string;
  assignedPlanName?: string;
  licenseKey?: string;
  linkedRpnId?: string;
  linkedRpnName?: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'POS' | 'App' | 'Hybrid';
  price: number;
  interval: 'Monthly' | 'Annual';
  activeVendors: number;
  enabledApps?: string[];
  maxBranches?: string;
  maxTerminals?: string;
  maxStaff?: string;
  maxProducts?: string;
  status?: 'Active' | 'Inactive';
}

export interface POSLicense {
  id: string;
  vendorName: string;
  terminalId: string;
  licenseKey: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Suspended' | 'Deactivated';
  issuedAt: string;
  planName?: string;
  expiryDate?: string;
  notes?: string;
  billingCycle?: 'Monthly' | 'Quarterly' | 'Yearly';
  tokenPrice?: number;
  collectionTag?: string;
}

export interface AppLicense {
  id: string;
  appName: string;
  vendorName: string;
  status: 'Active' | 'Suspended' | 'Pending';
  key: string;
}

export interface ActivationRequest {
  id: string;
  vendorName: string;
  requestedItem: string;
  type: 'POS License' | 'App Integration' | 'Vendor Verification';
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface RPNAgent {
  id: string;
  name: string;
  region: string;
  connectionStatus: 'Connected' | 'Standby' | 'Offline';
  activeSessions: number;
  throughput: string;
  linkedVendorIds?: string[];
  agentType?: 'relay' | 'acquisition_agent';
  commissionRate?: number;
  acquisitionCount?: number;
  notes?: string;
  assignedArea?: string;
  monthlyTarget?: string;
  commissionModel?: string;
  performance?: 'Exceeding' | 'On Track' | 'Needs Attention';
  phone?: string;
  email?: string;
  conversionRate?: number;
  commissionDue?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: 'Success' | 'Warning' | 'Failed';
}

export interface FinanceRecord {
  id: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  date: string;
  refNo: string;
  accountId?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'Bank' | 'Cash';
  bankName?: string;
  accountNumber?: string;
  initialBalance: number;
  currency: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
}

export interface SystemConfig {
  systemMode: 'Active' | 'Maintenance' | 'Recovery';
  seiGenVersion: string;
  posHeartbeatInterval: number; // in seconds
  debugLogs: boolean;
  gatewayIp: string;
}

export interface IntegrationService {
  id: string;
  name: string;
  category: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSync: string;
}

export interface MenuFeature {
  id: string;
  label: string;
  parentId?: string;
  path?: string;
  description?: string;
  category: 'General' | 'Security' | 'Licensing' | 'Operations';
}

export interface StaffDesk {
  id: string;
  name: string;
  status: 'Active' | 'Locked' | 'Maintenance';
  ipAddress: string;
  location: string;
  menuAccessIds: string[]; // List of MenuFeature ids granted to this desk
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Standby' | 'Suspended';
  hasEmployeeCreationAccess: boolean;
  deskId: string; // The ID of the assigned desk
  welcomeMessage?: string;
}

