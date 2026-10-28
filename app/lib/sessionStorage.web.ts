import { ENV } from "@/lib/env";
import { sessionStorageError } from "@/lib/sessionStorageState";
import type { SessionStorageState } from "@/lib/sessionStorageState";

export { sessionStorageError } from "@/lib/sessionStorageState";
export type {
  SessionStorageState,
  StoredSession,
} from "@/lib/sessionStorageState";

function clearLegacySession() {
  try {
    for (const suffix of ["authSession", "sessionInvalidated"]) {
      window.sessionStorage.removeItem(
        `${ENV.LOCAL_STORAGE_KEY_PREFIX}_${suffix}`,
      );
    }
  } catch (error) {
    throw sessionStorageError(error);
  }
}

export async function markSessionInvalidated(): Promise<void> {
  clearLegacySession();
}

export async function writeSessionStorage(
  _state: SessionStorageState,
): Promise<void> {
  clearLegacySession();
}

export async function readSessionStorage(): Promise<SessionStorageState> {
  clearLegacySession();
  return { session: null, pendingRevocations: [] };
}
