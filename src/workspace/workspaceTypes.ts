export type SCIWorkspaceCode =
  | "home"
  | "vendor_operations"
  | "licensing_centre"
  | "commercial"
  | "internal_administration"
  | "rpn_operations"
  | "finance"
  | "platform";

export interface SCIWorkspace {
  workspaceId: SCIWorkspaceCode;
  label: string;
  description: string;
  iconLabel: string;
  defaultPath: string;
  featureIds: string[];
}

export const SCI_WORKSPACES: SCIWorkspace[] = [
  {
    workspaceId: "home",
    label: "Home",
    description: "Executive command view for SCI operations.",
    iconLabel: "HOME",
    defaultPath: "/dashboard",
    featureIds: ["dashboard"],
  },
  {
    workspaceId: "vendor_operations",
    label: "Vendor Operations",
    description: "Vendor onboarding, activations, and lifecycle management.",
    iconLabel: "VND",
    defaultPath: "/vendors",
    featureIds: ["vendors", "activation_requests"],
  },
  {
    workspaceId: "licensing_centre",
    label: "Licensing Centre",
    description: "POS licensing, app licensing, plans, and activation bridge.",
    iconLabel: "LIC",
    defaultPath: "/plans",
    featureIds: ["plans_pricing", "pos_licensing", "app_licensing"],
  },
  {
    workspaceId: "commercial",
    label: "Commercial",
    description: "Capacity, pricing packages, renewals, and revenue views.",
    iconLabel: "COM",
    defaultPath: "/capacity",
    featureIds: ["plans_pricing"],
  },
  {
    workspaceId: "internal_administration",
    label: "Internal Administration",
    description: "Staff, roles, desks, and menu feature access.",
    iconLabel: "ADM",
    defaultPath: "/staff",
    featureIds: ["staff_management", "role_creator", "desk_creator", "menu_features"],
  },
  {
    workspaceId: "rpn_operations",
    label: "RPN Operations",
    description: "Independent vendor acquisition agent management.",
    iconLabel: "RPN",
    defaultPath: "/rpn",
    featureIds: ["rpn_management"],
  },
  {
    workspaceId: "finance",
    label: "Finance",
    description: "Billing records, collections, and revenue operations.",
    iconLabel: "FIN",
    defaultPath: "/finance",
    featureIds: ["finance"],
  },
  {
    workspaceId: "platform",
    label: "Platform",
    description: "Diagnostics, integrations, settings, and system administration.",
    iconLabel: "SYS",
    defaultPath: "/diagnostics",
    featureIds: ["settings", "diagnostics"],
  },
];
