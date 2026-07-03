export type SCIFirestoreMode =
  | "local_prototype"
  | "firestore_read"
  | "firestore_write";

export interface SCIFirestoreModeState {
  mode: SCIFirestoreMode;
  label: string;
  description: string;
  readsAllowed: boolean;
  writesAllowed: boolean;
  productionSafe: boolean;
}

export const SCI_FIRESTORE_MODES: Record<SCIFirestoreMode, SCIFirestoreModeState> = {
  local_prototype: {
    mode: "local_prototype",
    label: "Local Prototype Mode",
    description: "Uses localStorage only. No Firestore reads or writes.",
    readsAllowed: false,
    writesAllowed: false,
    productionSafe: true,
  },
  firestore_read: {
    mode: "firestore_read",
    label: "Firestore Read Mode",
    description: "Allows Firestore reads for testing. Writes remain disabled.",
    readsAllowed: true,
    writesAllowed: false,
    productionSafe: true,
  },
  firestore_write: {
    mode: "firestore_write",
    label: "Firestore Write Mode",
    description: "Allows Firestore writes. Use only after security rules are tested.",
    readsAllowed: true,
    writesAllowed: true,
    productionSafe: false,
  },
};

const STORAGE_KEY = "sci_firestore_mode";

export function getSCIFirestoreMode(): SCIFirestoreMode {
  const saved = localStorage.getItem(STORAGE_KEY) as SCIFirestoreMode | null;

  if (
    saved === "local_prototype" ||
    saved === "firestore_read" ||
    saved === "firestore_write"
  ) {
    return saved;
  }

  return "local_prototype";
}

export function getSCIFirestoreModeState(): SCIFirestoreModeState {
  return SCI_FIRESTORE_MODES[getSCIFirestoreMode()];
}

export function setSCIFirestoreMode(mode: SCIFirestoreMode) {
  localStorage.setItem(STORAGE_KEY, mode);
  return SCI_FIRESTORE_MODES[mode];
}

export function canReadFromFirestore() {
  return getSCIFirestoreModeState().readsAllowed;
}

export function canWriteToFirestore() {
  return getSCIFirestoreModeState().writesAllowed;
}
