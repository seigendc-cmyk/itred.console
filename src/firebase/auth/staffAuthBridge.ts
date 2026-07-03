import type { User } from "firebase/auth";
import type { SCIInternalStaff } from "../../internal";

export interface SCIStaffAuthMatch {
  matched: boolean;
  staff?: SCIInternalStaff;
  email?: string;
  message: string;
}

export function matchGoogleUserToInternalStaff(input: {
  user?: User | null;
  email?: string | null;
  staffList: SCIInternalStaff[];
}): SCIStaffAuthMatch {
  const email = input.user?.email ?? input.email ?? "";

  if (!email) {
    return {
      matched: false,
      message: "No Google email was provided.",
    };
  }

  const staff = input.staffList.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );

  if (!staff) {
    return {
      matched: false,
      email,
      message: "No internal staff profile is linked to this Google email.",
    };
  }

  if (staff.status !== "active") {
    return {
      matched: false,
      email,
      staff,
      message: "Matched staff profile is not active.",
    };
  }

  return {
    matched: true,
    email,
    staff,
    message: "Google user matched to active internal staff profile.",
  };
}
