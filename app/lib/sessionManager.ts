import { logout } from "@/api/auth/logout";
import type { RefreshedSessionInfo } from "@/lib/authFetch";
import {
  markSessionInvalidated,
  readSessionStorage,
  writeSessionStorage,
} from "@/lib/sessionStorage";
import type { SessionStorageState, StoredSession } from "@/lib/sessionStorage";
import { ApiError } from "@/types/domain";

type SessionManagerOptions = {
  onChange: (session: StoredSession | null, expired: boolean) => void;
  onClearCache: () => Promise<void>;
};

function logoutError(): ApiError {
  return new ApiError(
    "Não foi possível encerrar a sessão no servidor. Verifique sua conexão e tente novamente.",
    "LOGOUT_FAILED",
  );
}

export function createSessionManager({
  onChange,
  onClearCache,
}: SessionManagerOptions) {
  let state: SessionStorageState = { session: null, pendingRevocations: [] };
  let gate: Promise<unknown> = Promise.resolve();
  let revision = 0;

  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const task = gate.then(operation);
    gate = task.catch(() => undefined);
    return task;
  }

  async function commit(next: SessionStorageState, expired = false) {
    await writeSessionStorage(next);
    state = next;
    onChange(state.session, expired);
  }

  function getSession() {
    return state.session;
  }

  function getRevision() {
    return revision;
  }

  function restore() {
    return enqueue(async () => {
      state = await readSessionStorage();
      onChange(
        state.session,
        state.session === null && state.pendingRevocations.length > 0,
      );
    });
  }

  function update(session: StoredSession | null) {
    revision += 1;
    return enqueue(async () => {
      const switched = state.session?.userId !== session?.userId;
      if (switched) {
        await onClearCache();
      }
      try {
        await commit({ ...state, session });
      } catch (error) {
        if (
          session?.refreshToken &&
          session.refreshToken !== state.session?.refreshToken
        ) {
          await logout(session.refreshToken);
        }
        throw error;
      }
      if (!session && !switched) {
        await onClearCache();
      }
    });
  }

  function retryPendingRevocations() {
    return enqueue(async () => {
      for (const token of [...state.pendingRevocations]) {
        if (!(await logout(token))) {
          throw logoutError();
        }
        await commit(
          {
            ...state,
            pendingRevocations: state.pendingRevocations.filter(
              (pending) => pending !== token,
            ),
          },
          state.session === null,
        );
      }
    });
  }

  function refresh(
    token: string,
    refreshToken: string | null,
    info: RefreshedSessionInfo | undefined,
    expectedRefreshToken: string,
  ) {
    const expectedRevision = revision;
    return enqueue(async () => {
      const current = state.session;
      if (
        !current ||
        current.refreshToken !== expectedRefreshToken ||
        revision !== expectedRevision
      ) {
        if (refreshToken && !(await logout(refreshToken))) {
          await commit({
            ...state,
            pendingRevocations: [
              ...new Set([...state.pendingRevocations, refreshToken]),
            ],
          });
        }
        throw new ApiError(
          "A sessão foi alterada. Tente novamente.",
          "SESSION_CHANGED",
        );
      }
      const session: StoredSession = {
        ...current,
        authToken: token,
        refreshToken: refreshToken ?? current.refreshToken,
        user: {
          ...current.user,
          ...(info?.name ? { name: info.name } : {}),
          ...(typeof info?.isAdmin === "boolean"
            ? { isAdmin: info.isAdmin }
            : {}),
        },
      };
      try {
        await markSessionInvalidated();
        await commit({ ...state, session });
      } catch (error) {
        const pending = session.refreshToken;
        revision += 1;
        state = {
          session: null,
          pendingRevocations: [
            ...new Set([
              ...state.pendingRevocations,
              expectedRefreshToken,
              ...(pending ? [pending] : []),
            ]),
          ],
        };
        onChange(null, true);
        await onClearCache();
        for (const token of [...state.pendingRevocations]) {
          if (await logout(token)) {
            state.pendingRevocations = state.pendingRevocations.filter(
              (pendingToken) => pendingToken !== token,
            );
          }
        }
        throw error;
      }
    });
  }

  function updateProfile(
    profile: Partial<Pick<StoredSession["user"], "name" | "email">>,
  ) {
    return enqueue(async () => {
      if (!state.session) {
        return;
      }
      await commit({
        ...state,
        session: {
          ...state.session,
          user: {
            ...state.session.user,
            ...(profile.name !== undefined
              ? { name: profile.name.trim() }
              : {}),
            ...(profile.email !== undefined
              ? { email: profile.email.trim() }
              : {}),
          },
        },
      });
    });
  }

  function signOut() {
    revision += 1;
    return enqueue(async () => {
      if (
        state.session?.refreshToken &&
        !(await logout(state.session.refreshToken))
      ) {
        throw logoutError();
      }
      await commit({ ...state, session: null });
      await onClearCache();
    });
  }

  function expire(expectedRefreshToken?: string | null) {
    revision += 1;
    return enqueue(async () => {
      const current = state.session;
      if (
        !current ||
        (expectedRefreshToken !== undefined &&
          current.refreshToken !== expectedRefreshToken)
      ) {
        return;
      }
      const revoked =
        !current.refreshToken || (await logout(current.refreshToken));
      await commit(
        {
          session: null,
          pendingRevocations:
            revoked || !current.refreshToken
              ? state.pendingRevocations
              : [
                  ...new Set([
                    ...state.pendingRevocations,
                    current.refreshToken,
                  ]),
                ],
        },
        true,
      );
      await onClearCache();
      if (!revoked) {
        throw new ApiError(
          "Sua sessão foi encerrada neste aparelho. A revogação no servidor será tentada novamente quando você voltar ao app com conexão.",
          "LOGOUT_FAILED",
        );
      }
    });
  }

  return {
    getSession,
    getRevision,
    restore,
    update,
    refresh,
    updateProfile,
    signOut,
    expire,
    retryPendingRevocations,
  };
}
