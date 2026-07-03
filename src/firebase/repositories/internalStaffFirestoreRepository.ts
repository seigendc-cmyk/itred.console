import {
  collection,
  doc,
  getDocs,
  setDoc,
  type Firestore,
} from "firebase/firestore";

import type {
  SCIInternalStaff,
  SCIStaffRole,
  SCIStaffDesk,
  SCIMenuFeature,
} from "../../internal";

export const INTERNAL_COLLECTIONS = {
  staff: "sci_staff",
  roles: "sci_staff_roles",
  desks: "sci_staff_desks",
  menuFeatures: "sci_menu_features",
} as const;

async function listCollection<T>(db: Firestore, collectionName: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((item) => item.data() as T);
}

async function upsertDocument<T extends { [key: string]: unknown }>(
  db: Firestore,
  collectionName: string,
  id: string,
  value: T
) {
  await setDoc(doc(db, collectionName, id), value, { merge: true });
  return value;
}

export function createInternalStaffFirestoreRepository(db: Firestore) {
  return {
    listStaff: () =>
      listCollection<SCIInternalStaff>(db, INTERNAL_COLLECTIONS.staff),

    upsertStaff: (staff: SCIInternalStaff) =>
      upsertDocument(db, INTERNAL_COLLECTIONS.staff, staff.staffId, {
        ...staff,
      } as unknown as Record<string, unknown>),

    listRoles: () =>
      listCollection<SCIStaffRole>(db, INTERNAL_COLLECTIONS.roles),

    upsertRole: (role: SCIStaffRole) =>
      upsertDocument(db, INTERNAL_COLLECTIONS.roles, role.roleId, {
        ...role,
      } as unknown as Record<string, unknown>),

    listDesks: () =>
      listCollection<SCIStaffDesk>(db, INTERNAL_COLLECTIONS.desks),

    upsertDesk: (desk: SCIStaffDesk) =>
      upsertDocument(db, INTERNAL_COLLECTIONS.desks, desk.deskId, {
        ...desk,
      } as unknown as Record<string, unknown>),

    listMenuFeatures: () =>
      listCollection<SCIMenuFeature>(db, INTERNAL_COLLECTIONS.menuFeatures),

    upsertMenuFeature: (feature: SCIMenuFeature) =>
      upsertDocument(db, INTERNAL_COLLECTIONS.menuFeatures, feature.featureId, {
        ...feature,
      } as unknown as Record<string, unknown>),
  };
}
