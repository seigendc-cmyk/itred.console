import type {
  POSActivationDecision,
  POSActivationRecord,
} from "../licensing/posActivationTypes";

const STORAGE_KEY = "sci_pos_activation_records";

export function getPOSActivationRecords(): POSActivationRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as POSActivationRecord[];
  } catch {
    return [];
  }
}

export function savePOSActivationRecords(records: POSActivationRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function issueMockPOSActivation(input: {
  vendorId: string;
  vendorName: string;
  planId: string;
  planName: string;
  licenseMode: "demo" | "production";
  storageMode: "localOnly" | "cloud";
  maxBranches: number;
  maxTerminals: number;
  maxStaff: number;
  maxProducts: number;
  startsAt: string;
  expiresAt: string;
  issuedBy: string;
  notes?: string;
}): POSActivationRecord {
  const now = new Date().toISOString();

  const record: POSActivationRecord = {
    licenseId: `POS-LIC-${Date.now()}`,
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    planId: input.planId,
    planName: input.planName,
    status: "active",
    licenseMode: input.licenseMode,
    storageMode: input.storageMode,
    maxBranches: input.maxBranches,
    maxTerminals: input.maxTerminals,
    maxStaff: input.maxStaff,
    maxProducts: input.maxProducts,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    issuedBy: input.issuedBy,
    issuedAt: now,
    updatedAt: now,
    notes: input.notes,
  };

  const records = getPOSActivationRecords();
  savePOSActivationRecords([record, ...records]);

  return record;
}

export function updatePOSActivationStatus(
  licenseId: string,
  status: POSActivationRecord["status"]
): POSActivationRecord[] {
  const records = getPOSActivationRecords().map((record) =>
    record.licenseId === licenseId
      ? {
          ...record,
          status,
          updatedAt: new Date().toISOString(),
        }
      : record
  );

  savePOSActivationRecords(records);
  return records;
}

export function getLatestPOSActivationForVendor(
  vendorId: string
): POSActivationRecord | null {
  const records = getPOSActivationRecords()
    .filter((record) => record.vendorId === vendorId)
    .sort(
      (a, b) =>
        new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );

  return records[0] ?? null;
}

export function validatePOSActivationForVendor(
  vendorId: string
): POSActivationDecision {
  const license = getLatestPOSActivationForVendor(vendorId);

  if (!license) {
    return {
      allowed: false,
      reasonCode: "NO_LICENSE",
      message: "No POS license found for this vendor.",
    };
  }

  if (license.status === "pending") {
    return {
      allowed: false,
      reasonCode: "LICENSE_PENDING",
      message: "POS license is pending activation.",
      license,
    };
  }

  if (license.status === "suspended") {
    return {
      allowed: false,
      reasonCode: "LICENSE_SUSPENDED",
      message: "POS license has been suspended.",
      license,
    };
  }

  if (license.status === "revoked") {
    return {
      allowed: false,
      reasonCode: "LICENSE_REVOKED",
      message: "POS license has been revoked.",
      license,
    };
  }

  if (license.status === "expired" || new Date(license.expiresAt) < new Date()) {
    return {
      allowed: false,
      reasonCode: "LICENSE_EXPIRED",
      message: "POS license has expired.",
      license,
    };
  }

  if (license.licenseMode === "demo" && license.storageMode === "localOnly") {
    return {
      allowed: true,
      reasonCode: "DEMO_LOCAL_ONLY",
      message: "Demo POS license is active in local-only mode.",
      license,
    };
  }

  if (license.licenseMode === "production" && license.storageMode !== "cloud") {
    return {
      allowed: false,
      reasonCode: "INVALID_STORAGE_MODE",
      message: "Production POS license must use cloud storage mode.",
      license,
    };
  }

  return {
    allowed: true,
    reasonCode: "LICENSE_ACTIVE",
    message: "POS license is active.",
    license,
  };
}

export function resetPOSActivationBridge() {
  localStorage.removeItem(STORAGE_KEY);
}
