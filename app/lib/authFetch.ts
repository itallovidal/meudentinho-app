import { refreshSession } from "@/api/auth/refresh";
import { ApiError } from "@/types/domain";

type SessionSnapshot = {
  authToken: string | null;
  refreshToken: string | null;
};

type AuthFetchHandlers = {
  getSession: () => SessionSnapshot;
  onSessionRefreshed: (authToken: string, refreshToken: string | null) => void;
  onSessionExpired: () => void;
};

type RefreshResult =
  | { refreshed: true }
  | { refreshed: false; expired: boolean };

let handlers: AuthFetchHandlers | null = null;
let refreshPromise: Promise<RefreshResult> | null = null;

export function configureAuthFetch(next: AuthFetchHandlers | null) {
  handlers = next;
  refreshPromise = null;
}

function withToken(
  init: RequestInit,
  token: string | null,
): RequestInit {
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

async function tryRefresh(refreshToken: string): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = (async (): Promise<RefreshResult> => {
      try {
        const { data } = await refreshSession(refreshToken);
        if (!data?.token) {
          return { refreshed: false, expired: false };
        }
        handlers?.onSessionRefreshed(
          data.token,
          data.refreshToken ?? null,
        );
        logSessionRefresh(data.token);
        return { refreshed: true };
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.code === "INVALID_CREDENTIALS" ||
            err.code === "USER_NOT_FOUND")
        ) {
          return { refreshed: false, expired: true };
        }
        return { refreshed: false, expired: false };
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function authFetch(
  input: string,
  init: RequestInit = {},
  tokenOverride: string | null = null,
): Promise<Response> {
  const session = handlers?.getSession() ?? {
    authToken: null,
    refreshToken: null,
  };
  const effectiveToken = session.authToken ?? tokenOverride;
  const response = await fetch(
    input,
    withToken(init, effectiveToken),
  );

  if (response.status !== 401) {
    return response;
  }

  const latest = handlers?.getSession() ?? session;
  const latestRefresh = latest.refreshToken ?? session.refreshToken;
  if (!latestRefresh) {
    handlers?.onSessionExpired();
    throw new ApiError(
      "Sessão expirada. Faça login novamente.",
      "INVALID_CREDENTIALS",
    );
  }

  if (effectiveToken !== latest.authToken && latest.authToken) {
    const retry = await fetch(input, withToken(init, latest.authToken));
    if (retry.status !== 401) {
      return retry;
    }
  }

  const result = await tryRefresh(latestRefresh);

  if (!result.refreshed) {
    if (result.expired) {
      handlers?.onSessionExpired();
      throw new ApiError(
        "Sessão expirada. Faça login novamente.",
        "INVALID_CREDENTIALS",
      );
    }
    throw new ApiError(
      "Não foi possível renovar a sessão. Tente novamente.",
      "INTERNAL_SERVER_ERROR",
    );
  }

  const fresh = handlers?.getSession();
  return fetch(input, withToken(init, fresh?.authToken ?? null));
}
