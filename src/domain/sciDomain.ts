export type SCIEntityStatus =
  | "draft"
  | "pending"
  | "verified"
  | "active"
  | "inactive"
  | "suspended"
  | "expired"
  | "revoked"
  | "rejected";

export type SCILicenseMode = "demo" | "production";

export type SCIStorageMode = "localOnly" | "cloud";

export type SCIBillingCycle =
  | "none"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";

export type SCIApplicationCode =
  | "ITRED_POS"
  | "VENDOR_DISCOVERY"
  | "IDELIVER"
  | "CASHPLAN"
  | "POOLWISE"
  | "EXECUTIVE_DESK"
  | "CRM"
  | "PROCUREMENT"
  | "CONSIGNMENT"
  | "FIELD_SALES"
  | "AI_ASSISTANT"
  | "EXECUTIVE_BI";

export interface SCIBaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SCIOwnerAccount extends SCIBaseEntity {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  linkedVendorIds: string[];
  status: SCIEntityStatus;
}

export interface SCIVendor extends SCIBaseEntity {
  vendorId: string;
  ownerUid: string;
  ownerEmail: string;
  businessName: string;
  tradingName?: string;
  businessType: string;
  country: string;
  city: string;
  physicalAddress?: string;
  contactPhone?: string;
  status: SCIEntityStatus;
  planId?: string;
  licenseMode: SCILicenseMode;
  storageMode: SCIStorageMode;
  isDemoVendor: boolean;
}

export interface SCICompany extends SCIBaseEntity {
  companyId: string;
  vendorId: string;
  companyName: string;
  tradingName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  country: string;
  city: string;
  status: SCIEntityStatus;
}

export interface SCIBranch extends SCIBaseEntity {
  branchId: string;
  vendorId: string;
  companyId?: string;
  branchName: string;
  branchCode: string;
  city: string;
  address?: string;
  status: SCIEntityStatus;
}

export interface SCIWarehouse extends SCIBaseEntity {
  warehouseId: string;
  vendorId: string;
  branchId?: string;
  warehouseName: string;
  warehouseCode: string;
  status: SCIEntityStatus;
}

export interface SCIStaffMember extends SCIBaseEntity {
  staffId: string;
  vendorId: string;
  branchId?: string;
  fullName: string;
  email?: string;
  roleId: string;
  status: SCIEntityStatus;
}

export interface SCIPOSTerminal extends SCIBaseEntity {
  terminalId: string;
  vendorId: string;
  branchId: string;
  terminalCode: string;
  terminalName: string;
  status: SCIEntityStatus;
}

export interface SCIPlatformPlan extends SCIBaseEntity {
  planId: string;
  planName: string;
  planCode: string;
  description: string;
  targetBusiness: string;
  price: number;
  currency: string;
  billingCycle: SCIBillingCycle;
  status: SCIEntityStatus;
  licenseMode: SCILicenseMode;
  storageMode: SCIStorageMode;
  maxBusinesses: number;
  maxBranches: number;
  maxWarehouses: number;
  maxTerminals: number;
  maxStaff: number;
  maxProducts: number;
  maxCustomers: number;
  includedApps: SCIApplicationCode[];
}

export interface SCICapacityAddon extends SCIBaseEntity {
  addonId: string;
  addonName: string;
  addonCode: string;
  unitName: string;
  pricePerUnit: number;
  currency: string;
  billingCycle: SCIBillingCycle;
  status: SCIEntityStatus;
}

export interface SCIBusinessModule extends SCIBaseEntity {
  moduleId: string;
  moduleName: string;
  moduleCode: SCIApplicationCode;
  description: string;
  monthlyPrice: number;
  currency: string;
  status: SCIEntityStatus;
}

export interface SCIPOSLicense extends SCIBaseEntity {
  licenseId: string;
  vendorId: string;
  planId: string;
  status: SCIEntityStatus;
  licenseMode: SCILicenseMode;
  storageMode: SCIStorageMode;
  maxBranches: number;
  maxWarehouses: number;
  maxTerminals: number;
  maxStaff: number;
  maxProducts: number;
  startsAt: string;
  expiresAt: string;
  issuedBy: string;
  issuedAt: string;
  notes?: string;
}

export interface SCIAppLicense extends SCIBaseEntity {
  appLicenseId: string;
  vendorId: string;
  appCode: SCIApplicationCode;
  status: SCIEntityStatus;
  licenseMode: SCILicenseMode;
  storageMode: SCIStorageMode;
  startsAt: string;
  expiresAt?: string;
  issuedBy: string;
}

export interface SCIActivationRequest extends SCIBaseEntity {
  requestId: string;
  ownerUid?: string;
  ownerEmail: string;
  businessName: string;
  tradingName?: string;
  businessType: string;
  requestedApps: SCIApplicationCode[];
  status: SCIEntityStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface SCIRPNAgent extends SCIBaseEntity {
  rpnId: string;
  fullName: string;
  email?: string;
  phone?: string;
  region: string;
  status: SCIEntityStatus;
  assignedVendorIds: string[];
}

export interface SCIAuditLog extends SCIBaseEntity {
  auditId: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  result: "success" | "warning" | "failed";
  message: string;
}
