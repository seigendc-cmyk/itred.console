import { getSCIDatabase, initializeSCIFirebase } from "../firebaseClient";
import { createInternalStaffFirestoreRepository } from "./internalStaffFirestoreRepository";
import { createLicensingFirestoreRepository } from "./licensingFirestoreRepository";
import { createVendorFirestoreRepository } from "./vendorFirestoreRepository";

export function getSCIFirestoreRepositories() {
  const firebase = initializeSCIFirebase();

  if (!firebase.ready) {
    return {
      ready: false,
      message: "Firebase is not ready. Firestore repositories are unavailable in local prototype mode.",
      internalStaff: null,
      licensing: null,
      vendors: null,
    };
  }

  const db = getSCIDatabase();

  if (!db) {
    return {
      ready: false,
      message: "Firestore database is not initialized.",
      internalStaff: null,
      licensing: null,
      vendors: null,
    };
  }

  return {
    ready: true,
    message: "Firestore repositories are ready.",
    internalStaff: createInternalStaffFirestoreRepository(db),
    licensing: createLicensingFirestoreRepository(db),
    vendors: createVendorFirestoreRepository(db),
  };
}
