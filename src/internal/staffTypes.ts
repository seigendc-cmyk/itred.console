export type SCIInternalStatus = "active" | "inactive" | "suspended";

export interface SCIMenuFeature {
  featureId: string;
  label: string;
  parentId?: string;
  path?: string;
  category:
    | "dashboard"
    | "business"
    | "commercial"
    | "licensing"
    | "internal_admin"
    | "operations"
    | "platform";
  description: string;
  status: SCIInternalStatus;
}

export interface SCIStaffRole {
  roleId: string;
  roleName: string;
  description: string;
  menuFeatureIds: string[];
  canCreateEmployee: boolean;
  canCreateRole: boolean;
  canCreateDesk: boolean;
  canGrantMenuAccess: boolean;
  status: SCIInternalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SCIStaffDesk {
  deskId: string;
  deskName: string;
  deskCode: string;
  description: string;
  menuFeatureIds: string[];
  assignedStaffIds: string[];
  dashboardType: "executive" | "operations" | "sales" | "support" | "admin";
  status: SCIInternalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SCIInternalStaff {
  staffId: string;
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
  assignedDeskIds: string[];
  defaultDeskId?: string;
  canCreateEmployee: boolean;
  dashboardType: "executive" | "operations" | "sales" | "support" | "admin";
  status: SCIInternalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SCIStaffSession {
  staffId: string;
  fullName: string;
  email: string;
  roleId: string;
  activeDeskId: string;
  grantedMenuFeatureIds: string[];
  canCreateEmployee: boolean;
  dashboardType: string;
  signedIn: boolean;
}
