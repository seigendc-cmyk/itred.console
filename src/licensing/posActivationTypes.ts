export type POSLicenseStatus =
  | "pending"
  | "active"
  | "suspended"
  | "expired"
  | "revoked";

export type POSLicenseMode =
  | "demo"
  | "production";

export type POSStorageMode =
  | "localOnly"
  | "cloud";

export interface POSActivationRecord {
  licenseId: string;
  vendorId: string;
  vendorName: string;
  planId: string;
  planName: string;
  status: POSLicenseStatus;
  licenseMode: POSLicenseMode;
  storageMode: POSStorageMode;
  maxBranches: number;
  maxTerminals: number;
  maxStaff: number;
  maxProducts: number;
  startsAt: string;
  expiresAt: string;
  issuedBy: string;
  issuedAt: string;
  updatedAt: string;
  notes?: string;
}

export interface POSActivationDecision {
  allowed: boolean;
  reasonCode:
    | "LICENSE_ACTIVE"
    | "NO_LICENSE"
    | "LICENSE_PENDING"
    | "LICENSE_SUSPENDED"
    | "LICENSE_EXPIRED"
    | "LICENSE_REVOKED"
    | "DEMO_LOCAL_ONLY"
    | "INVALID_STORAGE_MODE";
  message: string;
  license?: POSActivationRecord;
}
