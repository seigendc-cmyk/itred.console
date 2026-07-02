import type {
  SCIInternalStaff,
  SCIStaffDesk,
  SCIStaffRole,
  SCIStaffSession,
} from "../staffTypes";

export interface StaffAccessResolutionInput {
  staff: SCIInternalStaff;
  role: SCIStaffRole;
  desk: SCIStaffDesk;
}

export interface StaffAccessResolution {
  allowed: boolean;
  reasonCode:
    | "ACCESS_GRANTED"
    | "STAFF_INACTIVE"
    | "ROLE_INACTIVE"
    | "DESK_INACTIVE"
    | "DESK_NOT_ASSIGNED"
    | "NO_MENU_ACCESS";
  message: string;
  session?: SCIStaffSession;
}

export function resolveStaffAccess(
  input: StaffAccessResolutionInput
): StaffAccessResolution {
  const { staff, role, desk } = input;

  if (staff.status !== "active") {
    return {
      allowed: false,
      reasonCode: "STAFF_INACTIVE",
      message: "Staff member is not active.",
    };
  }

  if (role.status !== "active") {
    return {
      allowed: false,
      reasonCode: "ROLE_INACTIVE",
      message: "Staff role is not active.",
    };
  }

  if (desk.status !== "active") {
    return {
      allowed: false,
      reasonCode: "DESK_INACTIVE",
      message: "Selected desk is not active.",
    };
  }

  if (!staff.assignedDeskIds.includes(desk.deskId)) {
    return {
      allowed: false,
      reasonCode: "DESK_NOT_ASSIGNED",
      message: "This staff member is not assigned to the selected desk.",
    };
  }

  const grantedMenuFeatureIds = Array.from(
    new Set([...role.menuFeatureIds, ...desk.menuFeatureIds])
  );

  if (grantedMenuFeatureIds.length === 0) {
    return {
      allowed: false,
      reasonCode: "NO_MENU_ACCESS",
      message: "No menu access has been granted for this staff and desk combination.",
    };
  }

  return {
    allowed: true,
    reasonCode: "ACCESS_GRANTED",
    message: "Staff access granted.",
    session: {
      staffId: staff.staffId,
      fullName: staff.fullName,
      email: staff.email,
      roleId: role.roleId,
      activeDeskId: desk.deskId,
      grantedMenuFeatureIds,
      canCreateEmployee: staff.canCreateEmployee || role.canCreateEmployee,
      dashboardType: desk.dashboardType || staff.dashboardType,
      signedIn: true,
    },
  };
}
