import type { SCIPOSActivation, SCIPOSLicense } from "../domain";
import type { POSActivationRecord } from "../licensing/posActivationTypes";

export function posActivationRecordToSCIPOSLicense(
  record: POSActivationRecord
): SCIPOSLicense {
  return {
    id: record.licenseId,
    licenseId: record.licenseId,
    vendorId: record.vendorId,
    planId: record.planId,
    status: record.status === "active" ? "active" : record.status,
    licenseMode: record.licenseMode,
    storageMode: record.storageMode,
    maxBranches: record.maxBranches,
    maxWarehouses: 1,
    maxTerminals: record.maxTerminals,
    maxStaff: record.maxStaff,
    maxProducts: record.maxProducts,
    startsAt: record.startsAt,
    expiresAt: record.expiresAt,
    issuedBy: record.issuedBy,
    issuedAt: record.issuedAt,
    notes: record.notes,
    createdAt: record.issuedAt,
    updatedAt: record.updatedAt,
  };
}

export function posActivationRecordToFirestoreActivation(
  record: POSActivationRecord
): SCIPOSActivation {
  return {
    ...record,
    id: record.activationId,
    createdAt: record.issuedAt,
    updatedAt: record.updatedAt,
  };
}

export function sciPOSLicenseToPOSActivationRecord(
  license: SCIPOSLicense,
  vendorName = "Unknown Vendor",
  planName = "Unknown Plan",
  ownerEmail = "unknown@itred.local"
): POSActivationRecord {
  return {
    activationId: `POS-ACT-${license.licenseId}`,
    licenseId: license.licenseId,
    vendorId: license.vendorId,
    vendorName,
    ownerEmail,
    planId: license.planId,
    planName,
    branchId: "BR-UNKNOWN",
    branchName: "Default Branch",
    terminalId: `TRM-${license.licenseId}`,
    terminalCode: `TERM-${license.licenseId}`,
    status:
      license.status === "active"
        ? "active"
        : license.status === "pending"
        ? "pending"
        : license.status === "suspended"
        ? "suspended"
        : license.status === "expired"
        ? "expired"
        : license.status === "revoked"
        ? "revoked"
        : "pending",
    licenseMode: license.licenseMode,
    storageMode: license.storageMode,
    maxBranches: license.maxBranches,
    maxTerminals: license.maxTerminals,
    maxStaff: license.maxStaff,
    maxProducts: license.maxProducts,
    startsAt: license.startsAt,
    expiresAt: license.expiresAt,
    issuedBy: license.issuedBy,
    issuedAt: license.issuedAt,
    updatedAt: license.updatedAt,
    notes: license.notes,
  };
}
