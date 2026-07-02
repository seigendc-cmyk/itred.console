import type {
  SCIVendor,
  SCIPlatformPlan,
  SCIPOSLicense,
  SCIAppLicense,
  SCIActivationRequest,
  SCIAuditLog,
  SCIBranch,
  SCIWarehouse,
  SCIStaffMember,
  SCIPOSTerminal,
} from "../domain";

import { createLocalStorageRepository } from "./localStorageRepository";

export const sciVendorRepository =
  createLocalStorageRepository<SCIVendor>("sci_repo_vendors");

export const sciPlanRepository =
  createLocalStorageRepository<SCIPlatformPlan>("sci_repo_platform_plans");

export const sciPOSLicenseRepository =
  createLocalStorageRepository<SCIPOSLicense>("sci_repo_pos_licenses");

export const sciAppLicenseRepository =
  createLocalStorageRepository<SCIAppLicense>("sci_repo_app_licenses");

export const sciActivationRequestRepository =
  createLocalStorageRepository<SCIActivationRequest>("sci_repo_activation_requests");

export const sciAuditLogRepository =
  createLocalStorageRepository<SCIAuditLog>("sci_repo_audit_logs");

export const sciBranchRepository =
  createLocalStorageRepository<SCIBranch>("sci_repo_branches");

export const sciWarehouseRepository =
  createLocalStorageRepository<SCIWarehouse>("sci_repo_warehouses");

export const sciStaffRepository =
  createLocalStorageRepository<SCIStaffMember>("sci_repo_staff");

export const sciPOSTerminalRepository =
  createLocalStorageRepository<SCIPOSTerminal>("sci_repo_pos_terminals");
