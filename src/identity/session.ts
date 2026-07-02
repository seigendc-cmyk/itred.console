export interface SCISession {
  ownerUid: string;
  ownerEmail: string;
  ownerDisplayName: string;

  selectedVendorId: string;
  selectedCompanyId?: string;
  selectedBranchId?: string;

  planId: string;
  licenseId: string;

  licenseMode: "demo" | "production";
  storageMode: "localOnly" | "cloud";

  signedIn: boolean;
}

const STORAGE_KEY = "SCI_ACTIVE_SESSION";

export function getCurrentSession(): SCISession | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as SCISession;
  } catch {
    return null;
  }
}

export function saveCurrentSession(session: SCISession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearCurrentSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasActiveSession() {
  return getCurrentSession() !== null;
}

export function isDemoSession() {
  return getCurrentSession()?.licenseMode === "demo";
}

export function isProductionSession() {
  return getCurrentSession()?.licenseMode === "production";
}
