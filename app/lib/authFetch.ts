import { refreshSession } from "@/api/auth/refresh";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError } from "@/types/domain";
import { isApiError } from "@/types/predicates";

type SessionSnapshot = {
  authToken: string | null;
  refreshToken: string | null;
  generation?: number;
};

export type RefreshedSessionInfo = {
  name?: string;
  isAdmin?: boolean;
  userId?: string;
};

type AuthFetchHandlers = {
  getSession: () => SessionSnapshot;
  onSessionRefreshed: (
    authToken: string,
    refreshToken: string | null,
    info: RefreshedSessionInfo | undefined,
    expectedRefreshToken: string,
  ) => Promise<void>;
  onSessionExpired: (
    expectedRefreshToken?: string | null,
  ) => void | Promise<void>;
};

type RefreshResult =
  | { refreshed: true; authToken: string }
  | { refreshed: false; expired: boolean; error?: ApiError };

let handlers: AuthFetchHandlers | null = null;
let refreshFlight: {
  id: symbol;
  owner: AuthFetchHandlers;
  refreshToken: string;
  promise: Promise<RefreshResult>;
} | null = null;

export function configureAuthFetch(next: AuthFetchHandlers | null) {
  handlers = next;
  refreshFlight = null;
}

function withToken(init: RequestInit, token: string | null): RequestInit {
  if (!token) {
    return init;
  }
  return {
    ...init,
    headers: {
      ...((init.headers as Record<string, string> | undefined) ?? {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

function logSessionRefresh(token: string) {
  if (!__DEV__) {
    return;
  }
  const now = new Date().toLocaleTimeString("pt-BR");
  try {
    const segment = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(segment)) as { exp?: number };
    const expiry =
      typeof claims?.exp === "number"
        ? new Date(claims.exp * 1000).toLocaleTimeString("pt-BR")
        : null;
    console.log(
      `[auth] access renovado às ${now}${expiry ? ` — expira às ${expiry}` : ""}`,
    );
  } catch {
    console.log(`[auth] access renovado às ${now}`);
  }
}

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";

async function sessionExpiredMessage(response: Response): Promise<string> {
  try {
    await parseResponse<unknown>(response);
  } catch (error) {
    if (isApiError(error) && error.code === "INVALID_CREDENTIALS") {
      return error.message;
    }
  }
  return SESSION_EXPIRED_MESSAGE;
}

async function tryRefresh(
  refreshToken: string,
  owner: AuthFetchHandlers,
): Promise<RefreshResult> {
  if (
    refreshFlight?.owner === owner &&
    refreshFlight.refreshToken === refreshToken
  ) {
    return refreshFlight.promise;
  }
  const flightId = Symbol();
  const promise = (async (): Promise<RefreshResult> => {
    try {
      const { data } = await refreshSession(refreshToken);
      if (!data?.token || !data.refreshToken) {
        throw new ApiError(
          "Resposta inválida ao renovar a sessão. Tente novamente.",
          "SESSION_REFRESH_FAILED",
        );
      }
      await owner.onSessionRefreshed(
        data.token,
        data.refreshToken,
        {
          name: data.name,
          isAdmin: data.isAdmin,
          userId: data.userId,
        },
        refreshToken,
      );
      if (handlers !== owner || owner.getSession().authToken !== data.token) {
        throw new ApiError(
          "A sessão foi alterada. Tente novamente.",
          "SESSION_CHANGED",
        );
      }
      logSessionRefresh(data.token);
      return { refreshed: true, authToken: data.token };
    } catch (err) {
      if (
        isApiError(err) &&
        (err.code === "INVALID_CREDENTIALS" || err.code === "USER_NOT_FOUND")
      ) {
        return { refreshed: false, expired: true };
      }
      return {
        refreshed: false,
        expired: false,
        error:
          isApiError(err) &&
          (err.code === "SESSION_STORAGE_ERROR" ||
            err.code === "SESSION_CHANGED")
            ? err
            : new ApiError(
                isApiError(err)
                  ? err.message
                  : "Não foi possível renovar a sessão. Tente novamente.",
                "SESSION_REFRESH_FAILED",
                isApiError(err) ? err.status : undefined,
                err,
              ),
      };
    } finally {
      if (refreshFlight?.id === flightId) {
        refreshFlight = null;
      }
    }
  })();
  refreshFlight = { id: flightId, owner, refreshToken, promise };
  return promise;
}

export async function authFetch(
  input: string,
  init: RequestInit = {},
  tokenOverride: string | null = null,
): Promise<Response> {
  const owner = handlers;
  const session = owner?.getSession() ?? {
    authToken: null,
    refreshToken: null,
  };
  function currentSession() {
    const current = owner?.getSession() ?? session;
    if (handlers !== owner || current.generation !== session.generation) {
      throw new ApiError(
        "A sessão foi alterada. Tente novamente.",
        "SESSION_CHANGED",
      );
    }
    return current;
  }
  const effectiveToken = session.authToken ?? tokenOverride;
  const response = await fetchWithTimeout(
    input,
    withToken(init, effectiveToken),
  );

  currentSession();
  if (response.status !== 401) {
    return response;
  }

  const expiredMessage = await sessionExpiredMessage(response);

  const latest = currentSession();
  const latestRefresh = latest.refreshToken ?? session.refreshToken;
  if (!latestRefresh) {
    if (latest.authToken) {
      await owner?.onSessionExpired(latest.refreshToken);
    }
    throw new ApiError(expiredMessage, "INVALID_CREDENTIALS", 401);
  }

  if (effectiveToken !== latest.authToken && latest.authToken) {
    const retry = await fetchWithTimeout(
      input,
      withToken(init, latest.authToken),
    );
    currentSession();
    if (retry.status !== 401) {
      return retry;
    }
  }

  if (!owner) {
    throw new ApiError(expiredMessage, "INVALID_CREDENTIALS", 401);
  }
  const result = await tryRefresh(
    currentSession().refreshToken ?? latestRefresh,
    owner,
  );
  if (!result.refreshed && result.error?.code === "SESSION_STORAGE_ERROR") {
    throw result.error;
  }
  const refreshedSession = currentSession();

  if (!result.refreshed) {
    if (result.expired) {
      await owner.onSessionExpired(refreshedSession.refreshToken);
      throw new ApiError(expiredMessage, "INVALID_CREDENTIALS", 401);
    }
    throw (
      result.error ??
      new ApiError(
        "Não foi possível renovar a sessão. Tente novamente.",
        "SESSION_REFRESH_FAILED",
      )
    );
  }

  const retry = await fetchWithTimeout(
    input,
    withToken(init, result.authToken),
  );
  currentSession();
  if (retry.status === 401) {
    const current = currentSession();
    if (current.authToken !== result.authToken) {
      throw new ApiError(
        "A sessão foi alterada. Tente novamente.",
        "SESSION_CHANGED",
      );
    }
    await owner.onSessionExpired(current.refreshToken);
    throw new ApiError(
      await sessionExpiredMessage(retry),
      "INVALID_CREDENTIALS",
      401,
    );
  }
  return retry;
}
