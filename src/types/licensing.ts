export type LicenseStatus = 'pending' | 'active' | 'suspended' | 'expired' | 'revoked';
export type LicenseMode = 'demo' | 'production';
export type StorageMode = 'localOnly' | 'cloud';

export interface POSLicense {
  licenseId: string;
  vendorId: string;
  vendorName: string;
  planId: string;
  planName: string;
  status: LicenseStatus;
  licenseMode: LicenseMode;
  storageMode: StorageMode;
  maxBranches: number | 'Unlimited';
  maxTerminals: number | 'Unlimited';
  maxStaff: number | 'Unlimited';
  maxProducts: number | 'Unlimited';
  startsAt: string;
  expiresAt: string;
  issuedBy: string;
  issuedAt: string;
  updatedAt: string;
  notes?: string;
}

export interface LicenseEvent {
  eventId: string;
  licenseId: string;
  vendorId: string;
  eventType: 'issue' | 'renew' | 'suspend' | 'revoke' | 'change_plan' | 'activate';
  eventTimestamp: string;
  actor: string;
  details: string;
}
