export const SCI_FIREBASE_COLLECTIONS = {
  ownerAccounts: "owner_accounts",
  vendors: "vendors",
  companies: "companies",
  branches: "branches",
  warehouses: "warehouses",
  staff: "staff",
  terminals: "pos_terminals",
  platformPlans: "platform_plans",
  capacityAddons: "capacity_addons",
  businessModules: "business_modules",
  posLicenses: "pos_licenses",
  posActivations: "pos_activations",
  appLicenses: "app_licenses",
  activationRequests: "activation_requests",
  rpnAgents: "rpn_agents",
  auditLogs: "audit_logs",
  licenseEvents: "license_events",
} as const;

export type SCIFirebaseCollectionKey = keyof typeof SCI_FIREBASE_COLLECTIONS;
export type SCIFirebaseCollectionName =
  (typeof SCI_FIREBASE_COLLECTIONS)[SCIFirebaseCollectionKey];
