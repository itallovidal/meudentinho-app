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
import { ApiError } from "@/types/domain";
import type { BasicUser } from "@/types/domain";

export type StoredSession = {
  user: BasicUser;
  authToken: string;
  refreshToken: string | null;
  userId: string | null;
};

export type SessionStorageState = {
  session: StoredSession | null;
  pendingRevocations: string[];
};

const SESSION_KEY = "authSession";

export async function markSessionInvalidated(): Promise<void> {
  try {
    await setLocalStorageItem("sessionInvalidated", "true");
  } catch (error) {
    throw sessionStorageError(error);
  }
}

export function sessionStorageError(cause: unknown): ApiError {
  return new ApiError(
    "Não foi possível acessar o armazenamento seguro da sessão. Tente novamente.",
    "SESSION_STORAGE_ERROR",
    undefined,
    cause,
  );
}

async function removeLegacySession() {
  for (const key of ["token", "refreshToken", "user", "userId"]) {
    await removeLocalStorageItem(key);
  }
  await removeSecureItem("token");
  await removeSecureItem("refreshToken");
}

function isStoredSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== "object") {
    return false;
  }
  const session = value as StoredSession;
  return (
    typeof session.authToken === "string" &&
    session.authToken.length > 0 &&
    (session.refreshToken === null ||
      typeof session.refreshToken === "string") &&
    (session.userId === null || typeof session.userId === "string") &&
    !!session.user &&
    typeof session.user.name === "string" &&
    typeof session.user.email === "string" &&
    typeof session.user.isAdmin === "boolean"
  );
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
      const state = JSON.parse(raw) as SessionStorageState;
      if (
        (state.session !== null && !isStoredSession(state.session)) ||
        !Array.isArray(state.pendingRevocations) ||
        !state.pendingRevocations.every((token) => typeof token === "string")
      ) {
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
