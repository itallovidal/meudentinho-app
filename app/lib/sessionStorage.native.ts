import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
} from "@/lib/secureStorage";
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/asyncStorage";
import { getUserIdFromToken } from "@/lib/utils";
import {
  isSessionStorageState,
  isStoredSession,
  sessionStorageError,
} from "@/lib/sessionStorageState";
import type { SessionStorageState } from "@/lib/sessionStorageState";

export { sessionStorageError } from "@/lib/sessionStorageState";
export type {
  SessionStorageState,
  StoredSession,
} from "@/lib/sessionStorageState";

const SESSION_KEY = "authSession";

export async function markSessionInvalidated(): Promise<void> {
  try {
    await setLocalStorageItem("sessionInvalidated", "true");
  } catch (error) {
    throw sessionStorageError(error);
  }
}

async function removeLegacySession() {
  for (const key of ["token", "refreshToken", "user", "userId"]) {
    await removeLocalStorageItem(key);
  }
  await removeSecureItem("token");
  await removeSecureItem("refreshToken");
}

export async function writeSessionStorage(
  state: SessionStorageState,
): Promise<void> {
  try {
    await setSecureItem(SESSION_KEY, JSON.stringify(state));
    await removeLegacySession();
    await removeLocalStorageItem("sessionInvalidated");
  } catch (error) {
    throw sessionStorageError(error);
  }
}

export async function readSessionStorage(): Promise<SessionStorageState> {
  try {
    const raw = await getSecureItem(SESSION_KEY);
    const invalidated = await getLocalStorageItem("sessionInvalidated");
    if (raw) {
      const state: unknown = JSON.parse(raw);
      if (!isSessionStorageState(state)) {
        throw new Error("Invalid session storage");
      }
      if (invalidated) {
        if (state.session?.refreshToken) {
          state.pendingRevocations = [
            ...new Set([
              ...state.pendingRevocations,
              state.session.refreshToken,
            ]),
          ];
        }
        state.session = null;
        await writeSessionStorage(state);
      } else {
        await removeLegacySession();
      }
      return state;
    }

    const user = await getLocalStorageItem("user");
    const token =
      (await getSecureItem("token")) ?? (await getLocalStorageItem("token"));
    const refresh =
      (await getSecureItem("refreshToken")) ??
      (await getLocalStorageItem("refreshToken"));
    const userId = await getLocalStorageItem("userId");
    const authToken: unknown = token ? JSON.parse(token) : null;
    const session =
      user && typeof authToken === "string" && authToken
        ? {
            user: JSON.parse(user),
            authToken,
            refreshToken: refresh ? JSON.parse(refresh) : null,
            userId: userId ? JSON.parse(userId) : getUserIdFromToken(authToken),
          }
        : null;
    if (session && !isStoredSession(session)) {
      throw new Error("Invalid legacy session");
    }
    const state: SessionStorageState = { session, pendingRevocations: [] };
    await writeSessionStorage(state);
    return state;
  } catch (error) {
    throw sessionStorageError(error);
  }
}
