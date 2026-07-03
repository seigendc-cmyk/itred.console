import {
  INITIAL_INTERNAL_STAFF,
  INITIAL_MENU_FEATURES,
  INITIAL_STAFF_DESKS,
  INITIAL_STAFF_ROLES,
} from "../../internal";

import { SCI_FIREBASE_COLLECTIONS } from "../collections/collectionNames";

export interface SCIFirestoreSeedBundle {
  collectionName: string;
  records: unknown[];
}

export function buildFirestoreSeedBundles(): SCIFirestoreSeedBundle[] {
  return [
    {
      collectionName: SCI_FIREBASE_COLLECTIONS.staff,
      records: INITIAL_INTERNAL_STAFF,
    },
    {
      collectionName: SCI_FIREBASE_COLLECTIONS.staffRoles,
      records: INITIAL_STAFF_ROLES,
    },
    {
      collectionName: SCI_FIREBASE_COLLECTIONS.staffDesks,
      records: INITIAL_STAFF_DESKS,
    },
    {
      collectionName: SCI_FIREBASE_COLLECTIONS.menuFeatures,
      records: INITIAL_MENU_FEATURES,
    },
  ];
}

export function exportFirestoreSeedPreview() {
  return {
    generatedAt: new Date().toISOString(),
    mode: "preview_only",
    firebaseWritesAllowed: false,
    bundles: buildFirestoreSeedBundles(),
  };
}
