import type { POSActivationRecord } from "../licensing";
import { posActivationRecordToSCIPOSLicense } from "../adapters";
import { validatePOSLicense } from "../licensing";

export function runSCIPOSLicenseHarness() {
  const activeRecord: POSActivationRecord = {
    licenseId: "POS-LIC-HARNESS-001",
    vendorId: "vendor_harness_001",
    vendorName: "Harness Hardware",
    planId: "professional",
    planName: "Professional",
    status: "active",
    licenseMode: "production",
    storageMode: "cloud",
    maxBranches: 5,
    maxTerminals: 10,
    maxStaff: 999,
    maxProducts: 999999,
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    issuedBy: "system_harness",
    issuedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Harness active production license.",
  };

  const sciLicense = posActivationRecordToSCIPOSLicense(activeRecord);

  const activeDecision = validatePOSLicense({
    license: sciLicense,
    usage: {
      branches: 1,
      warehouses: 1,
      terminals: 1,
      staff: 3,
      products: 100,
    },
  });

  const limitDecision = validatePOSLicense({
    license: sciLicense,
    usage: {
      branches: 1,
      warehouses: 1,
      terminals: 99,
      staff: 3,
      products: 100,
    },
  });

  const expiredRecord: POSActivationRecord = {
    ...activeRecord,
    licenseId: "POS-LIC-HARNESS-002",
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  };

  const expiredDecision = validatePOSLicense({
    license: posActivationRecordToSCIPOSLicense(expiredRecord),
  });

  const demoRecord: POSActivationRecord = {
    ...activeRecord,
    licenseId: "POS-LIC-HARNESS-003",
    licenseMode: "demo",
    storageMode: "localOnly",
    maxProducts: 50,
  };

  const demoDecision = validatePOSLicense({
    license: posActivationRecordToSCIPOSLicense(demoRecord),
  });

  return {
    activeDecision,
    limitDecision,
    expiredDecision,
    demoDecision,
  };
}
