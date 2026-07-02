import type { SCIStaffSession } from "../internal";
import type { SCICommandAction } from "./commandCentre";
import { getSCIEnvironmentState } from "./workspaceEnvironment";

export interface SCICommandAccessDecision {
  allowed: boolean;
  reasonCode:
    | "ACTION_ALLOWED"
    | "NO_STAFF_SESSION"
    | "FEATURE_NOT_GRANTED"
    | "PRODUCTION_ACTION_DISABLED"
    | "FIREBASE_WRITE_BLOCKED";
  message: string;
}

export function resolveCommandActionAccess(input: {
  action: SCICommandAction;
  session?: SCIStaffSession | null;
  requiresProduction?: boolean;
  requiresFirebaseWrite?: boolean;
}): SCICommandAccessDecision {
  const { action, session } = input;
  const environment = getSCIEnvironmentState();

  if (!session || !session.signedIn) {
    return {
      allowed: false,
      reasonCode: "NO_STAFF_SESSION",
      message: "No active SCI staff session.",
    };
  }

  if (
    action.featureId &&
    !session.grantedMenuFeatureIds.includes(action.featureId)
  ) {
    return {
      allowed: false,
      reasonCode: "FEATURE_NOT_GRANTED",
      message: "This desk does not have access to this command.",
    };
  }

  if (input.requiresProduction && !environment.productionActionsEnabled) {
    return {
      allowed: false,
      reasonCode: "PRODUCTION_ACTION_DISABLED",
      message: "Production actions are disabled in the current environment.",
    };
  }

  if (input.requiresFirebaseWrite && !environment.firebaseWritesAllowed) {
    return {
      allowed: false,
      reasonCode: "FIREBASE_WRITE_BLOCKED",
      message: "Firebase writes are blocked in the current environment.",
    };
  }

  return {
    allowed: true,
    reasonCode: "ACTION_ALLOWED",
    message: "Command action is allowed.",
  };
}

export function getAllowedCommandActions(input: {
  actions: SCICommandAction[];
  session?: SCIStaffSession | null;
}) {
  return input.actions.filter(
    (action) =>
      resolveCommandActionAccess({
        action,
        session: input.session,
      }).allowed
  );
}
