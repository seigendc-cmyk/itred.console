export type SCIActivityType =
  | "vendor"
  | "license"
  | "staff"
  | "rpn"
  | "finance"
  | "system"
  | "security";

export type SCIActivitySeverity =
  | "info"
  | "success"
  | "warning"
  | "critical";

export interface SCIWorkspaceActivity {
  activityId: string;
  workspaceId: string;
  type: SCIActivityType;
  severity: SCIActivitySeverity;
  title: string;
  message: string;
  actorName: string;
  targetPath?: string;
  createdAt: string;
}

export const INITIAL_WORKSPACE_ACTIVITIES: SCIWorkspaceActivity[] = [
  {
    activityId: "act_pos_license_bridge",
    workspaceId: "licensing_centre",
    type: "license",
    severity: "success",
    title: "POS Activation Bridge Ready",
    message: "The local POS activation bridge is available for prototype testing.",
    actorName: "SCI System",
    targetPath: "/pos",
    createdAt: new Date().toISOString(),
  },
  {
    activityId: "act_demo_mode",
    workspaceId: "licensing_centre",
    type: "license",
    severity: "info",
    title: "Vendor Demo Plan Active",
    message: "Demo vendors are stored locally and excluded from production license counts.",
    actorName: "SCI System",
    targetPath: "/plans",
    createdAt: new Date().toISOString(),
  },
  {
    activityId: "act_staff_access",
    workspaceId: "internal_administration",
    type: "staff",
    severity: "success",
    title: "Staff Access Engine Ready",
    message: "Staff access now resolves role and desk menu permissions.",
    actorName: "SCI System",
    targetPath: "/staff",
    createdAt: new Date().toISOString(),
  },
  {
    activityId: "act_diagnostics",
    workspaceId: "platform",
    type: "system",
    severity: "success",
    title: "Runtime Diagnostics Available",
    message: "SCI diagnostics can validate licensing engine behaviour.",
    actorName: "SCI System",
    targetPath: "/diagnostics",
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = "sci_workspace_activities";

export function getWorkspaceActivities() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_WORKSPACE_ACTIVITIES;

  try {
    return JSON.parse(raw) as SCIWorkspaceActivity[];
  } catch {
    return INITIAL_WORKSPACE_ACTIVITIES;
  }
}

export function saveWorkspaceActivities(activities: SCIWorkspaceActivity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

export function addWorkspaceActivity(
  activity: Omit<SCIWorkspaceActivity, "activityId" | "createdAt">
) {
  const nextActivity: SCIWorkspaceActivity = {
    ...activity,
    activityId: `act_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const next = [nextActivity, ...getWorkspaceActivities()];
  saveWorkspaceActivities(next);

  return nextActivity;
}

export function getActivitiesForWorkspace(workspaceId: string) {
  return getWorkspaceActivities().filter(
    (activity) => activity.workspaceId === workspaceId
  );
}
