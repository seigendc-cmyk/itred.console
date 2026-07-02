export type SCICommandPriority = "low" | "normal" | "high" | "critical";

export interface SCICommandAction {
  actionId: string;
  label: string;
  description: string;
  targetPath?: string;
  featureId?: string;
  priority: SCICommandPriority;
  category:
    | "navigation"
    | "approval"
    | "licensing"
    | "staff"
    | "rpn"
    | "finance"
    | "system";
}

export interface SCIUtilityPanelItem {
  itemId: string;
  title: string;
  description: string;
  type: "activity" | "approval" | "health" | "quick_action" | "warning";
  priority: SCICommandPriority;
  targetPath?: string;
  createdAt: string;
}

export const INITIAL_COMMAND_ACTIONS: SCICommandAction[] = [
  {
    actionId: "cmd_create_vendor",
    label: "Create Vendor",
    description: "Start a new vendor registration workflow.",
    targetPath: "/lifecycle/create-vendor",
    featureId: "vendors",
    priority: "normal",
    category: "navigation",
  },
  {
    actionId: "cmd_review_activations",
    label: "Review Activations",
    description: "Open pending activation requests.",
    targetPath: "/activations",
    featureId: "activation_requests",
    priority: "high",
    category: "approval",
  },
  {
    actionId: "cmd_issue_pos_license",
    label: "Issue POS License",
    description: "Open POS licensing workspace.",
    targetPath: "/pos",
    featureId: "pos_licensing",
    priority: "high",
    category: "licensing",
  },
  {
    actionId: "cmd_create_staff",
    label: "Create Staff",
    description: "Open staff management page.",
    targetPath: "/staff",
    featureId: "staff_management",
    priority: "normal",
    category: "staff",
  },
  {
    actionId: "cmd_create_rpn",
    label: "Create RPN Agent",
    description: "Register an independent vendor acquisition agent.",
    targetPath: "/rpn",
    featureId: "rpn_management",
    priority: "normal",
    category: "rpn",
  },
];

export const INITIAL_UTILITY_PANEL_ITEMS: SCIUtilityPanelItem[] = [
  {
    itemId: "uti_pending_activations",
    title: "Pending Activations",
    description: "Vendor and app activation requests require review.",
    type: "approval",
    priority: "high",
    targetPath: "/activations",
    createdAt: new Date().toISOString(),
  },
  {
    itemId: "uti_license_health",
    title: "License Health",
    description: "Review active, demo, suspended, and expired POS licenses.",
    type: "health",
    priority: "normal",
    targetPath: "/pos",
    createdAt: new Date().toISOString(),
  },
  {
    itemId: "uti_system_diagnostics",
    title: "System Diagnostics",
    description: "Run SCI runtime diagnostics and license engine checks.",
    type: "health",
    priority: "normal",
    targetPath: "/diagnostics",
    createdAt: new Date().toISOString(),
  },
];
