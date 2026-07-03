import { firebaseConfigPlaceholder, isFirebaseConfigReady } from "./firebaseConfig";

export type SCIFirebaseConnectionMode =
  | "not_configured"
  | "configured_not_connected"
  | "connected";

export interface SCIFirebaseConnectionState {
  mode: SCIFirebaseConnectionMode;
  projectId?: string;
  authDomain?: string;
  message: string;
}

export function getFirebaseConnectionState(): SCIFirebaseConnectionState {
  const ready = isFirebaseConfigReady(firebaseConfigPlaceholder);

  if (!ready) {
    return {
      mode: "not_configured",
      message: "Firebase environment variables are not configured yet.",
    };
  }

  return {
    mode: "configured_not_connected",
    projectId: firebaseConfigPlaceholder.projectId,
    authDomain: firebaseConfigPlaceholder.authDomain,
    message:
      "Firebase configuration is present, but live connection is not enabled in this skeleton.",
  };
}
