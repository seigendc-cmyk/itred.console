import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";

import type {
  SCIPlatformPlan,
  SCIPOSLicense,
  SCIPOSActivation,
  SCIAppLicense,
} from "../../domain";

export interface SCILicenseEvent {
  id: string;
  eventId: string;
  vendorId: string;
  licenseId: string;
  licenseType: "pos" | "app";
  action: string;
  previousStatus?: string;
  newStatus?: string;
  actorId: string;
  actorName: string;
  message: string;
  createdAt: string;
}

export const LICENSING_COLLECTIONS = {
  platformPlans: "platform_plans",
  posLicenses: "pos_licenses",
  posActivations: "pos_activations",
  appLicenses: "app_licenses",
  licenseEvents: "license_events",
} as const;

async function listCollection<T>(db: Firestore, collectionName: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((item) => item.data() as T);
}

async function listByField<T>(
  db: Firestore,
  collectionName: string,
  fieldName: string,
  value: string
): Promise<T[]> {
  const q = query(collection(db, collectionName), where(fieldName, "==", value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => item.data() as T);
}

async function upsertDocument<T extends Record<string, unknown>>(
  db: Firestore,
  collectionName: string,
  id: string,
  value: T
) {
  await setDoc(doc(db, collectionName, id), value, { merge: true });
  return value;
}

export function createLicensingFirestoreRepository(db: Firestore) {
  return {
    listPlatformPlans: () =>
      listCollection<SCIPlatformPlan>(db, LICENSING_COLLECTIONS.platformPlans),

    upsertPlatformPlan: (plan: SCIPlatformPlan) =>
      upsertDocument(db, LICENSING_COLLECTIONS.platformPlans, plan.planId, {
        ...plan,
      } as unknown as Record<string, unknown>),

    listPOSLicenses: () =>
      listCollection<SCIPOSLicense>(db, LICENSING_COLLECTIONS.posLicenses),

    listPOSLicensesByVendor: (vendorId: string) =>
      listByField<SCIPOSLicense>(
        db,
        LICENSING_COLLECTIONS.posLicenses,
        "vendorId",
        vendorId
      ),

    upsertPOSLicense: (license: SCIPOSLicense) =>
      upsertDocument(db, LICENSING_COLLECTIONS.posLicenses, license.licenseId, {
        ...license,
      } as unknown as Record<string, unknown>),

    listPOSActivations: () =>
      listCollection<SCIPOSActivation>(db, LICENSING_COLLECTIONS.posActivations),

    listPOSActivationsByVendor: (vendorId: string) =>
      listByField<SCIPOSActivation>(
        db,
        LICENSING_COLLECTIONS.posActivations,
        "vendorId",
        vendorId
      ),

    upsertPOSActivation: (activation: SCIPOSActivation) =>
      upsertDocument(
        db,
        LICENSING_COLLECTIONS.posActivations,
        activation.activationId,
        {
          ...activation,
        } as unknown as Record<string, unknown>
      ),

    listAppLicenses: () =>
      listCollection<SCIAppLicense>(db, LICENSING_COLLECTIONS.appLicenses),

    listAppLicensesByVendor: (vendorId: string) =>
      listByField<SCIAppLicense>(
        db,
        LICENSING_COLLECTIONS.appLicenses,
        "vendorId",
        vendorId
      ),

    upsertAppLicense: (license: SCIAppLicense) =>
      upsertDocument(db, LICENSING_COLLECTIONS.appLicenses, license.appLicenseId, {
        ...license,
      } as unknown as Record<string, unknown>),

    listLicenseEvents: () =>
      listCollection<SCILicenseEvent>(db, LICENSING_COLLECTIONS.licenseEvents),

    listLicenseEventsByVendor: (vendorId: string) =>
      listByField<SCILicenseEvent>(
        db,
        LICENSING_COLLECTIONS.licenseEvents,
        "vendorId",
        vendorId
      ),

    upsertLicenseEvent: (event: SCILicenseEvent) =>
      upsertDocument(db, LICENSING_COLLECTIONS.licenseEvents, event.eventId, {
        ...event,
      } as unknown as Record<string, unknown>),
  };
}
