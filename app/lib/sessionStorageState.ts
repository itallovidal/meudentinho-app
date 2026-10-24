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

export function sessionStorageError(cause: unknown): ApiError {
  return new ApiError(
    "Não foi possível acessar o armazenamento da sessão. Tente novamente.",
    "SESSION_STORAGE_ERROR",
    undefined,
    cause,
  );
}

export function isStoredSession(value: unknown): value is StoredSession {
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

export function isSessionStorageState(
  value: unknown,
): value is SessionStorageState {
  if (!value || typeof value !== "object") {
    return false;
  }
  const state = value as SessionStorageState;
  return (
    (state.session === null || isStoredSession(state.session)) &&
    Array.isArray(state.pendingRevocations) &&
    state.pendingRevocations.every((token) => typeof token === "string")
  );
}
