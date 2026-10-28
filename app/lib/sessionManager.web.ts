import { refreshSession } from "@/api/auth/refresh";
import { logout } from "@/api/auth/logout";
import { readSessionStorage } from "@/lib/sessionStorage";
import type { StoredSession } from "@/lib/sessionStorageState";
import type { RefreshedSessionInfo } from "@/lib/authFetch";
import { ApiError } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export function createSessionManager({
  onChange,
  onClearCache,
}: {
  onChange: (session: StoredSession | null, expired: boolean) => void;
  onClearCache: () => Promise<void>;
}) {
  let session: StoredSession | null = null;
  let revision = 0;
  let gate: Promise<unknown> = Promise.resolve();

  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const task = gate.then(operation);
    gate = task.catch(() => undefined);
    return task;
  }

  async function publish(next: StoredSession | null, expired = false) {
    if (session?.userId !== next?.userId || !next) await onClearCache();
    session = next ? { ...next, refreshToken: null } : null;
    onChange(session, expired);
  }

  function restore() {
    const expectedRevision = revision;
    return enqueue(async () => {
      await readSessionStorage();
      try {
        const { data } = await refreshSession();
        if (
          !data?.token ||
          !data.userId ||
          !data.email ||
          !data.name ||
          typeof data.isAdmin !== "boolean"
        ) {
          throw new ApiError(
            "Resposta inválida ao restaurar a sessão.",
            "SESSION_REFRESH_FAILED",
          );
        }
        if (revision !== expectedRevision) return;
        await publish({
          authToken: data.token,
          refreshToken: null,
          userId: data.userId,
          user: { name: data.name, email: data.email, isAdmin: data.isAdmin },
        });
      } catch (error) {
        if (revision !== expectedRevision) return;
        if (isApiError(error) && error.status === 401) {
          await publish(null);
          return;
        }
        throw error;
      }
    });
  }

  function update(next: StoredSession | null) {
    revision += 1;
    return enqueue(() => publish(next));
  }

  function refresh(
    token: string,
    _refreshToken: string | null,
    info: RefreshedSessionInfo | undefined,
    expectedToken: string,
  ) {
    const expectedRevision = revision;
    return enqueue(async () => {
      if (
        !session ||
        revision !== expectedRevision ||
        session.authToken !== expectedToken
      ) {
        throw new ApiError(
          "A sessão foi alterada. Tente novamente.",
          "SESSION_CHANGED",
        );
      }
      await publish({
        ...session,
        authToken: token,
        user: {
          ...session.user,
          ...(info?.name ? { name: info.name } : {}),
          ...(typeof info?.isAdmin === "boolean"
            ? { isAdmin: info.isAdmin }
            : {}),
        },
      });
    });
  }

  function signOut() {
    revision += 1;
    return enqueue(async () => {
      if (!(await logout(""))) {
        throw new ApiError(
          "Não foi possível encerrar a sessão no servidor. Verifique sua conexão e tente novamente.",
          "LOGOUT_FAILED",
        );
      }
      await publish(null);
    });
  }

  function expire() {
    revision += 1;
    return enqueue(async () => {
      const revoked = await logout("");
      await publish(null, true);
      if (!revoked) {
        throw new ApiError(
          "A sessão foi encerrada neste app, mas não foi possível confirmar a revogação no servidor. Tente sair novamente quando houver conexão.",
          "LOGOUT_FAILED",
        );
      }
    });
  }

  function updateProfile(
    profile: Partial<Pick<StoredSession["user"], "name" | "email">>,
  ) {
    return enqueue(async () => {
      if (!session) return;
      await publish({ ...session, user: { ...session.user, ...profile } });
    });
  }

  async function retryPendingRevocations() {}

  return {
    getSession: () => session,
    getRevision: () => revision,
    restore,
    update,
    refresh,
    signOut,
    expire,
    updateProfile,
    retryPendingRevocations,
  };
}
