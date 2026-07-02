export type SCIEnvironmentMode =
  | "prototype"
  | "local_demo"
  | "staging"
  | "production";

export interface SCIEnvironmentState {
  mode: SCIEnvironmentMode;
  label: string;
  storageMode: "localOnly" | "cloud";
  firebaseWritesAllowed: boolean;
  demoWatermarkEnabled: boolean;
  productionActionsEnabled: boolean;
  description: string;
}

export const SCI_ENVIRONMENT_STATES: Record<SCIEnvironmentMode, SCIEnvironmentState> = {
  prototype: {
    mode: "prototype",
    label: "Prototype Mode",
    storageMode: "localOnly",
    firebaseWritesAllowed: false,
    demoWatermarkEnabled: true,
    productionActionsEnabled: false,
    description: "Prototype mode uses mock data and localStorage only.",
  },
  local_demo: {
    mode: "local_demo",
    label: "Local Demo Mode",
    storageMode: "localOnly",
    firebaseWritesAllowed: false,
    demoWatermarkEnabled: true,
    productionActionsEnabled: false,
    description: "Local demo mode is used for sales demos and training.",
  },
  staging: {
    mode: "staging",
    label: "Staging Mode",
    storageMode: "cloud",
    firebaseWritesAllowed: false,
    demoWatermarkEnabled: false,
    productionActionsEnabled: false,
    description: "Staging mode is reserved for testing before production.",
  },
  production: {
    mode: "production",
    label: "Production Mode",
    storageMode: "cloud",
    firebaseWritesAllowed: true,
    demoWatermarkEnabled: false,
    productionActionsEnabled: true,
    description: "Production mode enables approved cloud-backed operations.",
  },
};

const STORAGE_KEY = "sci_environment_mode";

export function getSCIEnvironmentMode(): SCIEnvironmentMode {
  const saved = localStorage.getItem(STORAGE_KEY) as SCIEnvironmentMode | null;

  if (
    saved === "prototype" ||
    saved === "local_demo" ||
    saved === "staging" ||
    saved === "production"
  ) {
    return saved;
  }

  return "prototype";
}

export function getSCIEnvironmentState(): SCIEnvironmentState {
  return SCI_ENVIRONMENT_STATES[getSCIEnvironmentMode()];
}

export function setSCIEnvironmentMode(mode: SCIEnvironmentMode) {
  localStorage.setItem(STORAGE_KEY, mode);
  return SCI_ENVIRONMENT_STATES[mode];
}

export function canWriteToFirebase() {
  return getSCIEnvironmentState().firebaseWritesAllowed;
}

export function isProductionEnvironment() {
  return getSCIEnvironmentMode() === "production";
}

export function isLocalOnlyEnvironment() {
  return getSCIEnvironmentState().storageMode === "localOnly";
}
