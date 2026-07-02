import { SCI_WORKSPACES } from "./workspaceTypes";
import { INITIAL_COMMAND_ACTIONS } from "./commandCentre";

export interface SCIWorkspaceSearchItem {
  searchId: string;
  label: string;
  description: string;
  type:
    | "workspace"
    | "command"
    | "menu"
    | "vendor"
    | "license"
    | "staff"
    | "rpn"
    | "system";
  targetPath?: string;
  featureId?: string;
  workspaceId?: string;
  keywords: string[];
}

export function buildWorkspaceSearchIndex(): SCIWorkspaceSearchItem[] {
  const workspaceItems: SCIWorkspaceSearchItem[] = SCI_WORKSPACES.map((workspace) => ({
    searchId: `workspace_${workspace.workspaceId}`,
    label: workspace.label,
    description: workspace.description,
    type: "workspace",
    targetPath: workspace.defaultPath,
    workspaceId: workspace.workspaceId,
    keywords: [
      workspace.label,
      workspace.description,
      workspace.workspaceId,
      ...workspace.featureIds,
    ],
  }));

  const commandItems: SCIWorkspaceSearchItem[] = INITIAL_COMMAND_ACTIONS.map((command) => ({
    searchId: `command_${command.actionId}`,
    label: command.label,
    description: command.description,
    type: "command",
    targetPath: command.targetPath,
    featureId: command.featureId,
    keywords: [
      command.label,
      command.description,
      command.category,
      command.priority,
      command.featureId ?? "",
    ],
  }));

  return [...workspaceItems, ...commandItems];
}

export function searchWorkspaceIndex(query: string) {
  const q = query.trim().toLowerCase();

  if (!q) return [];

  return buildWorkspaceSearchIndex().filter((item) =>
    [item.label, item.description, ...item.keywords]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}
