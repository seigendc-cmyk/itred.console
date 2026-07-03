import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getSCIAuth, initializeSCIFirebase } from "../firebaseClient";

export interface SCIGoogleAuthResult {
  success: boolean;
  user?: User;
  email?: string;
  displayName?: string | null;
  message: string;
}

export async function signInWithGoogleProvider(): Promise<SCIGoogleAuthResult> {
  const firebase = initializeSCIFirebase();

  if (!firebase.ready) {
    return {
      success: false,
      message: "Firebase is not configured. Google Auth is unavailable in prototype mode.",
    };
  }

  const auth = getSCIAuth();

  if (!auth) {
    return {
      success: false,
      message: "Firebase Auth is not initialized.",
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    return {
      success: true,
      user: result.user,
      email: result.user.email ?? undefined,
      displayName: result.user.displayName,
      message: "Google sign-in successful.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Google sign-in failed.",
    };
  }
}

export async function signOutGoogleProvider() {
  const auth = getSCIAuth();

  if (!auth) {
    return {
      success: false,
      message: "Firebase Auth is not initialized.",
    };
  }

  await signOut(auth);

  return {
    success: true,
    message: "Signed out successfully.",
  };
}
