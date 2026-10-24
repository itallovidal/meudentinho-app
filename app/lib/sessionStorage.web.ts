import { ENV } from "@/lib/env";
import {
  isSessionStorageState,
  sessionStorageError,
} from "@/lib/sessionStorageState";
import type { SessionStorageState } from "@/lib/sessionStorageState";

export { sessionStorageError } from "@/lib/sessionStorageState";
export type {
  SessionStorageState,
  StoredSession,
} from "@/lib/sessionStorageState";

const SESSION_KEY = `${ENV.LOCAL_STORAGE_KEY_PREFIX}_authSession`;
const INVALIDATED_KEY = `${ENV.LOCAL_STORAGE_KEY_PREFIX}_sessionInvalidated`;

export async function markSessionInvalidated(): Promise<void> {
  try {
    window.sessionStorage.setItem(INVALIDATED_KEY, "true");
  } catch (error) {
    throw sessionStorageError(error);
  }
}

export async function writeSessionStorage(
  state: SessionStorageState,
): Promise<void> {
  try {
    if (!isSessionStorageState(state)) {
      throw new Error("Invalid session storage");
    }
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    window.sessionStorage.removeItem(INVALIDATED_KEY);
  } catch (error) {
    throw sessionStorageError(error);
  }
}

export async function readSessionStorage(): Promise<SessionStorageState> {
  try {
    const storage = window.sessionStorage;
    const raw = storage.getItem(SESSION_KEY);
    if (!raw) {
      storage.removeItem(INVALIDATED_KEY);
      return { session: null, pendingRevocations: [] };
    }
    let state: unknown;
    try {
      state = JSON.parse(raw);
      if (!isSessionStorageState(state)) {
        throw new Error("Invalid session storage");
      }
    } catch (error) {
      storage.removeItem(SESSION_KEY);
      storage.removeItem(INVALIDATED_KEY);
      throw error;
    }
    if (storage.getItem(INVALIDATED_KEY)) {
      const refresh = state.session?.refreshToken;
      state = {
        session: null,
        pendingRevocations: [
          ...new Set([
            ...state.pendingRevocations,
            ...(refresh ? [refresh] : []),
          ]),
        ],
      };
      await writeSessionStorage(state as SessionStorageState);
    }
    return state as SessionStorageState;
  } catch (error) {
    throw sessionStorageError(error);
  }
}
