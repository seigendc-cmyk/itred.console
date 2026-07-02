import type {
  SCIInternalStaff,
  SCIMenuFeature,
  SCIStaffDesk,
  SCIStaffRole,
  SCIStaffSession,
} from "./staffTypes";

const STAFF_KEY = "sci_internal_staff";
const ROLES_KEY = "sci_staff_roles";
const DESKS_KEY = "sci_staff_desks";
const MENU_KEY = "sci_menu_features";
const SESSION_KEY = "sci_staff_session";

function read<T>(key: string, fallback: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getInternalStaff(fallback: SCIInternalStaff[] = []) {
  return read<SCIInternalStaff>(STAFF_KEY, fallback);
}

export function saveInternalStaff(staff: SCIInternalStaff[]) {
  write(STAFF_KEY, staff);
}

export function getStaffRoles(fallback: SCIStaffRole[] = []) {
  return read<SCIStaffRole>(ROLES_KEY, fallback);
}

export function saveStaffRoles(roles: SCIStaffRole[]) {
  write(ROLES_KEY, roles);
}

export function getStaffDesks(fallback: SCIStaffDesk[] = []) {
  return read<SCIStaffDesk>(DESKS_KEY, fallback);
}

export function saveStaffDesks(desks: SCIStaffDesk[]) {
  write(DESKS_KEY, desks);
}

export function getMenuFeatures(fallback: SCIMenuFeature[] = []) {
  return read<SCIMenuFeature>(MENU_KEY, fallback);
}

export function saveMenuFeatures(features: SCIMenuFeature[]) {
  write(MENU_KEY, features);
}

export function createStaffSession(input: {
  staff: SCIInternalStaff;
  role: SCIStaffRole;
  desk: SCIStaffDesk;
}): SCIStaffSession {
  const grantedMenuFeatureIds = Array.from(
    new Set([...input.role.menuFeatureIds, ...input.desk.menuFeatureIds])
  );

  const session: SCIStaffSession = {
    staffId: input.staff.staffId,
    fullName: input.staff.fullName,
    email: input.staff.email,
    roleId: input.role.roleId,
    activeDeskId: input.desk.deskId,
    grantedMenuFeatureIds,
    canCreateEmployee:
      input.staff.canCreateEmployee || input.role.canCreateEmployee,
    dashboardType: input.desk.dashboardType || input.staff.dashboardType,
    signedIn: true,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getStaffSession(): SCIStaffSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SCIStaffSession;
  } catch {
    return null;
  }
}

export function clearStaffSession() {
  localStorage.removeItem(SESSION_KEY);
}
