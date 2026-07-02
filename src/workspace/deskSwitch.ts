import type {
  SCIInternalStaff,
  SCIStaffDesk,
  SCIStaffRole,
  SCIStaffSession,
} from "../internal";
import { resolveStaffAccess } from "../internal/access";

export interface DeskSwitchDecision {
  allowed: boolean;
  message: string;
  session?: SCIStaffSession;
}

export function switchStaffDesk(input: {
  staff: SCIInternalStaff;
  role: SCIStaffRole;
  desk: SCIStaffDesk;
}): DeskSwitchDecision {
  const decision = resolveStaffAccess({
    staff: input.staff,
    role: input.role,
    desk: input.desk,
  });

  if (!decision.allowed || !decision.session) {
    return {
      allowed: false,
      message: decision.message,
    };
  }

  localStorage.setItem("sci_staff_session", JSON.stringify(decision.session));

  return {
    allowed: true,
    message: "Desk switched successfully.",
    session: decision.session,
  };
}
