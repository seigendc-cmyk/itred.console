import type { SCIStaffSession } from "../internal";
import type { SCIWorkspace } from "./workspaceTypes";

export interface WorkspaceAccessDecision {
  allowed: boolean;
  allowedFeatureIds: string[];
  blockedFeatureIds: string[];
  reasonCode:
    | "WORKSPACE_ALLOWED"
    | "NO_STAFF_SESSION"
    | "NO_GRANTED_FEATURES"
    | "WORKSPACE_BLOCKED";
  message: string;
}

export function resolveWorkspaceAccess(input: {
  workspace: SCIWorkspace;
  session?: SCIStaffSession | null;
}): WorkspaceAccessDecision {
  const { workspace, session } = input;

  if (!session || !session.signedIn) {
    return {
      allowed: false,
      allowedFeatureIds: [],
      blockedFeatureIds: workspace.featureIds,
      reasonCode: "NO_STAFF_SESSION",
      message: "No active SCI staff session.",
    };
  }

  if (!session.grantedMenuFeatureIds.length) {
    return {
      allowed: false,
      allowedFeatureIds: [],
      blockedFeatureIds: workspace.featureIds,
      reasonCode: "NO_GRANTED_FEATURES",
      message: "This staff session has no granted menu features.",
    };
  }

  const allowedFeatureIds = workspace.featureIds.filter((featureId) =>
    session.grantedMenuFeatureIds.includes(featureId)
  );

  const blockedFeatureIds = workspace.featureIds.filter(
    (featureId) => !session.grantedMenuFeatureIds.includes(featureId)
  );

  if (allowedFeatureIds.length === 0) {
    return {
      allowed: false,
      allowedFeatureIds,
      blockedFeatureIds,
      reasonCode: "WORKSPACE_BLOCKED",
      message: "This desk does not have access to this workspace.",
    };
  }

  return {
    allowed: true,
    allowedFeatureIds,
    blockedFeatureIds,
    reasonCode: "WORKSPACE_ALLOWED",
    message: "Workspace access allowed.",
  };
}

export function getAccessibleWorkspaces(input: {
  workspaces: SCIWorkspace[];
  session?: SCIStaffSession | null;
}) {
  return input.workspaces.filter((workspace) =>
    resolveWorkspaceAccess({
      workspace,
      session: input.session,
    }).allowed
  );
}
