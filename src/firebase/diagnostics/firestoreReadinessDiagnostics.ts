import { getFirebaseConnectionState } from "../firebaseConnectionState";
import { getSCIFirestoreRepositories } from "../repositories";

export interface SCIFirestoreDiagnostic {
  name: string;
  passed: boolean;
  status: string;
  message: string;
}

export function runFirestoreReadinessDiagnostics(): SCIFirestoreDiagnostic[] {
  const connection = getFirebaseConnectionState();
  const repositories = getSCIFirestoreRepositories();

  return [
    {
      name: "Firebase Configuration",
      passed: connection.mode !== "not_configured",
      status: connection.mode,
      message: connection.message,
    },
    {
      name: "Firestore Repository Provider",
      passed: repositories.ready,
      status: repositories.ready ? "ready" : "not_ready",
      message: repositories.message,
    },
    {
      name: "Internal Staff Repository",
      passed: Boolean(repositories.internalStaff),
      status: repositories.internalStaff ? "ready" : "not_ready",
      message: repositories.internalStaff
        ? "Internal staff repository is available."
        : "Internal staff repository is not available.",
    },
    {
      name: "Licensing Repository",
      passed: Boolean(repositories.licensing),
      status: repositories.licensing ? "ready" : "not_ready",
      message: repositories.licensing
        ? "Licensing repository is available."
        : "Licensing repository is not available.",
    },
    {
      name: "Vendor Repository",
      passed: Boolean(repositories.vendors),
      status: repositories.vendors ? "ready" : "not_ready",
      message: repositories.vendors
        ? "Vendor repository is available."
        : "Vendor repository is not available.",
    },
  ];
}
