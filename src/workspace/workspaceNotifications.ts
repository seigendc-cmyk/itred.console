export type SCIWorkspaceNotificationType =
  | "info"
  | "approval"
  | "license"
  | "security"
  | "system"
  | "finance"
  | "rpn";

export type SCIWorkspaceNotificationPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export interface SCIWorkspaceNotification {
  notificationId: string;
  title: string;
  message: string;
  type: SCIWorkspaceNotificationType;
  priority: SCIWorkspaceNotificationPriority;
  targetPath?: string;
  workspaceId?: string;
  read: boolean;
  createdAt: string;
}

export const INITIAL_WORKSPACE_NOTIFICATIONS: SCIWorkspaceNotification[] = [
  {
    notificationId: "notif_pending_activation",
    title: "Pending Activation Review",
    message: "There are vendor activation requests waiting for review.",
    type: "approval",
    priority: "high",
    targetPath: "/activations",
    workspaceId: "vendor_operations",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: "notif_demo_plan",
    title: "Demo Plan Enabled",
    message: "Vendor Demo Plan is active in local-only mode.",
    type: "license",
    priority: "normal",
    targetPath: "/plans",
    workspaceId: "licensing_centre",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: "notif_diagnostics",
    title: "Diagnostics Available",
    message: "SCI runtime diagnostics are available under Platform.",
    type: "system",
    priority: "normal",
    targetPath: "/diagnostics",
    workspaceId: "platform",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = "sci_workspace_notifications";

export function getWorkspaceNotifications() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_WORKSPACE_NOTIFICATIONS;

  try {
    return JSON.parse(raw) as SCIWorkspaceNotification[];
  } catch {
    return INITIAL_WORKSPACE_NOTIFICATIONS;
  }
}

export function saveWorkspaceNotifications(notifications: SCIWorkspaceNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function addWorkspaceNotification(
  notification: Omit<SCIWorkspaceNotification, "notificationId" | "createdAt" | "read">
) {
  const nextNotification: SCIWorkspaceNotification = {
    ...notification,
    notificationId: `notif_${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const next = [nextNotification, ...getWorkspaceNotifications()];
  saveWorkspaceNotifications(next);

  return nextNotification;
}

export function markWorkspaceNotificationRead(notificationId: string) {
  const next = getWorkspaceNotifications().map((notification) =>
    notification.notificationId === notificationId
      ? { ...notification, read: true }
      : notification
  );

  saveWorkspaceNotifications(next);
  return next;
}

export function getUnreadWorkspaceNotificationCount() {
  return getWorkspaceNotifications().filter((notification) => !notification.read).length;
}

export function getNotificationsForWorkspace(workspaceId: string) {
  return getWorkspaceNotifications().filter(
    (notification) => notification.workspaceId === workspaceId
  );
}
