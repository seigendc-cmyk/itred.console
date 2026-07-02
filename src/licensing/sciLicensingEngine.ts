import type {
  SCIEntityStatus,
  SCIPlatformPlan,
  SCIPOSLicense,
  SCIStorageMode,
  SCILicenseMode,
} from "../domain";

export type SCILicenseDecisionCode =
  | "LICENSE_ACTIVE"
  | "NO_LICENSE"
  | "LICENSE_PENDING"
  | "LICENSE_INACTIVE"
  | "LICENSE_SUSPENDED"
  | "LICENSE_EXPIRED"
  | "LICENSE_REVOKED"
  | "LICENSE_REJECTED"
  | "DEMO_LOCAL_ONLY"
  | "PRODUCTION_REQUIRES_CLOUD"
  | "BRANCH_LIMIT_EXCEEDED"
  | "WAREHOUSE_LIMIT_EXCEEDED"
  | "TERMINAL_LIMIT_EXCEEDED"
  | "STAFF_LIMIT_EXCEEDED"
  | "PRODUCT_LIMIT_EXCEEDED";

export interface SCILicenseUsageSnapshot {
  branches: number;
  warehouses: number;
  terminals: number;
  staff: number;
  products: number;
}

export interface SCILicenseDecision {
  allowed: boolean;
  code: SCILicenseDecisionCode;
  message: string;
  license?: SCIPOSLicense;
  plan?: SCIPlatformPlan;
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export function isActiveStatus(status: SCIEntityStatus): boolean {
  return status === "active" || status === "verified";
}

export function validateStorageMode(input: {
  licenseMode: SCILicenseMode;
  storageMode: SCIStorageMode;
}): SCILicenseDecision | null {
  if (input.licenseMode === "demo" && input.storageMode === "localOnly") {
    return {
      allowed: true,
      code: "DEMO_LOCAL_ONLY",
      message: "Demo license is active in local-only mode.",
    };
  }

  if (input.licenseMode === "production" && input.storageMode !== "cloud") {
    return {
      allowed: false,
      code: "PRODUCTION_REQUIRES_CLOUD",
      message: "Production licenses must use cloud storage mode.",
    };
  }

  return null;
}

export function validatePOSLicense(input: {
  license?: SCIPOSLicense | null;
  plan?: SCIPlatformPlan | null;
  usage?: Partial<SCILicenseUsageSnapshot>;
}): SCILicenseDecision {
  const { license, plan } = input;

  if (!license) {
    return {
      allowed: false,
      code: "NO_LICENSE",
      message: "No POS license exists for this vendor.",
    };
  }

  if (license.status === "pending") {
    return {
      allowed: false,
      code: "LICENSE_PENDING",
      message: "POS license is pending activation.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (license.status === "inactive") {
    return {
      allowed: false,
      code: "LICENSE_INACTIVE",
      message: "POS license is inactive.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (license.status === "suspended") {
    return {
      allowed: false,
      code: "LICENSE_SUSPENDED",
      message: "POS license has been suspended.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (license.status === "revoked") {
    return {
      allowed: false,
      code: "LICENSE_REVOKED",
      message: "POS license has been revoked.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (license.status === "rejected") {
    return {
      allowed: false,
      code: "LICENSE_REJECTED",
      message: "POS license was rejected.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (license.status === "expired" || isExpired(license.expiresAt)) {
    return {
      allowed: false,
      code: "LICENSE_EXPIRED",
      message: "POS license has expired.",
      license,
      plan: plan ?? undefined,
    };
  }

  const storageDecision = validateStorageMode({
    licenseMode: license.licenseMode,
    storageMode: license.storageMode,
  });

  if (storageDecision && !storageDecision.allowed) {
    return {
      ...storageDecision,
      license,
      plan: plan ?? undefined,
    };
  }

  const usage = {
    branches: input.usage?.branches ?? 0,
    warehouses: input.usage?.warehouses ?? 0,
    terminals: input.usage?.terminals ?? 0,
    staff: input.usage?.staff ?? 0,
    products: input.usage?.products ?? 0,
  };

  if (usage.branches > license.maxBranches) {
    return {
      allowed: false,
      code: "BRANCH_LIMIT_EXCEEDED",
      message: "Branch limit exceeded for this POS license.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (usage.warehouses > license.maxWarehouses) {
    return {
      allowed: false,
      code: "WAREHOUSE_LIMIT_EXCEEDED",
      message: "Warehouse limit exceeded for this POS license.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (usage.terminals > license.maxTerminals) {
    return {
      allowed: false,
      code: "TERMINAL_LIMIT_EXCEEDED",
      message: "Terminal limit exceeded for this POS license.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (usage.staff > license.maxStaff) {
    return {
      allowed: false,
      code: "STAFF_LIMIT_EXCEEDED",
      message: "Staff limit exceeded for this POS license.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (usage.products > license.maxProducts) {
    return {
      allowed: false,
      code: "PRODUCT_LIMIT_EXCEEDED",
      message: "Product limit exceeded for this POS license.",
      license,
      plan: plan ?? undefined,
    };
  }

  if (storageDecision?.code === "DEMO_LOCAL_ONLY") {
    return {
      allowed: true,
      code: "DEMO_LOCAL_ONLY",
      message: "Demo POS license is active. Data must remain local-only.",
      license,
      plan: plan ?? undefined,
    };
  }

  return {
    allowed: true,
    code: "LICENSE_ACTIVE",
    message: "POS license is active.",
    license,
    plan: plan ?? undefined,
  };
}

export function buildLicenseKey(prefix = "SCI-POS"): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}
