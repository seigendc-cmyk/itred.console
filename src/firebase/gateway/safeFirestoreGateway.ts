import { canReadFromFirestore, canWriteToFirestore, getSCIFirestoreModeState } from "../mode";
import { getSCIFirestoreRepositories } from "../repositories";

export interface SCIFirestoreGatewayResult<T> {
  success: boolean;
  data?: T;
  message: string;
  mode: string;
}

export async function safeFirestoreRead<T>(
  operation: (repositories: ReturnType<typeof getSCIFirestoreRepositories>) => Promise<T>
): Promise<SCIFirestoreGatewayResult<T>> {
  const mode = getSCIFirestoreModeState();

  if (!canReadFromFirestore()) {
    return {
      success: false,
      message: "Firestore reads are disabled in the current mode.",
      mode: mode.mode,
    };
  }

  const repositories = getSCIFirestoreRepositories();

  if (!repositories.ready) {
    return {
      success: false,
      message: repositories.message,
      mode: mode.mode,
    };
  }

  try {
    const data = await operation(repositories);

    return {
      success: true,
      data,
      message: "Firestore read completed.",
      mode: mode.mode,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Firestore read failed.",
      mode: mode.mode,
    };
  }
}

export async function safeFirestoreWrite<T>(
  operation: (repositories: ReturnType<typeof getSCIFirestoreRepositories>) => Promise<T>
): Promise<SCIFirestoreGatewayResult<T>> {
  const mode = getSCIFirestoreModeState();

  if (!canWriteToFirestore()) {
    return {
      success: false,
      message: "Firestore writes are disabled in the current mode.",
      mode: mode.mode,
    };
  }

  const repositories = getSCIFirestoreRepositories();

  if (!repositories.ready) {
    return {
      success: false,
      message: repositories.message,
      mode: mode.mode,
    };
  }

  try {
    const data = await operation(repositories);

    return {
      success: true,
      data,
      message: "Firestore write completed.",
      mode: mode.mode,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Firestore write failed.",
      mode: mode.mode,
    };
  }
}
