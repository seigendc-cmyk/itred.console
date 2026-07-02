export interface SCIFirebaseReadinessCheck {
  name: string;
  collection: string;
  purpose: string;
  ready: boolean;
}

export const SCI_FIREBASE_READINESS_CHECKS: SCIFirebaseReadinessCheck[] = [
  {
    name: "Vendor Ownership",
    collection: "owner_accounts",
    purpose: "Links one Google account to many vendor companies.",
    ready: false,
  },
  {
    name: "Vendor Records",
    collection: "vendors",
    purpose: "Stores verified and pending vendors.",
    ready: false,
  },
  {
    name: "Platform Plans",
    collection: "platform_plans",
    purpose: "Stores SCI pricing and platform capacity plans.",
    ready: false,
  },
  {
    name: "POS Licenses",
    collection: "pos_licenses",
    purpose: "Shared license records consumed by iTredPOS.",
    ready: false,
  },
  {
    name: "Activation Requests",
    collection: "activation_requests",
    purpose: "Stores pending vendor registrations and app activations.",
    ready: false,
  },
  {
    name: "Audit Logs",
    collection: "audit_logs",
    purpose: "Stores admin actions and license events.",
    ready: false,
  },
];
