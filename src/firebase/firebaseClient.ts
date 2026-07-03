import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfigPlaceholder, isFirebaseConfigReady } from "./firebaseConfig";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initializeSCIFirebase() {
  if (!isFirebaseConfigReady(firebaseConfigPlaceholder)) {
    return {
      ready: false,
      app: null,
      auth: null,
      db: null,
      message: "Firebase config is not ready. Running in local prototype mode.",
    };
  }

  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfigPlaceholder);
  auth = getAuth(app);
  db = getFirestore(app);

  return {
    ready: true,
    app,
    auth,
    db,
    message: "Firebase initialized successfully.",
  };
}

export function getSCIFirebaseApp() {
  return app;
}

export function getSCIAuth() {
  return auth;
}

export function getSCIDatabase() {
  return db;
}
