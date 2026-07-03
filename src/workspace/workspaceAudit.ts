export type SCIWorkspaceAuditResult =
  | "success"
  | "warning"
  | "failed"
  | "blocked";

export interface SCIWorkspaceAuditEvent {
  auditId: string;
  workspaceId: string;
  actorStaffId?: string;
  actorName: string;
  activeDeskId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  result: SCIWorkspaceAuditResult;
  message: string;
  createdAt: string;
}

const STORAGE_KEY = "sci_workspace_audit_events";

export function getWorkspaceAuditEvents(): SCIWorkspaceAuditEvent[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SCIWorkspaceAuditEvent[];
  } catch {
    return [];
  }
}

export function saveWorkspaceAuditEvents(events: SCIWorkspaceAuditEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function addWorkspaceAuditEvent(
  event: Omit<SCIWorkspaceAuditEvent, "auditId" | "createdAt">
) {
  const nextEvent: SCIWorkspaceAuditEvent = {
    ...event,
    auditId: `audit_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const next = [nextEvent, ...getWorkspaceAuditEvents()];
  saveWorkspaceAuditEvents(next);

  return nextEvent;
}

export function clearWorkspaceAuditEvents() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getWorkspaceAuditEventsByWorkspace(workspaceId: string) {
  return getWorkspaceAuditEvents().filter(
    (event) => event.workspaceId === workspaceId
  );
}

export function getWorkspaceAuditEventsByActor(actorStaffId: string) {
  return getWorkspaceAuditEvents().filter(
    (event) => event.actorStaffId === actorStaffId
  );
}
