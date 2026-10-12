import { ENV } from "./env";

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
        const response = await fetch(`${ENV.BASE_API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (response.status === 401) {
          return { refreshed: false, expired: true };
        }
        if (!response.ok) {
          return { refreshed: false, expired: false };
        }
        const payload = (await response.json()) as {
          data?: { token?: string; refreshToken?: string | null };
        };
        if (!payload?.data?.token) {
          return { refreshed: false, expired: false };
        }
        handlers?.onSessionRefreshed(
          payload.data.token,
          payload.data.refreshToken ?? null,
        );
        logSessionRefresh(payload.data.token);
        return { refreshed: true };
      } catch {
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
  const response = await fetch(
    input,
    withToken(init, tokenOverride ?? session.authToken),
  );

  if (response.status !== 401 || !session.refreshToken) {
    if (response.status === 401 && !session.refreshToken) {
      handlers?.onSessionExpired();
    }
    return response;
  }

  const result = await tryRefresh(session.refreshToken);

  if (!result.refreshed) {
    if (result.expired) {
      handlers?.onSessionExpired();
    }
    return response;
  }

  const fresh = handlers?.getSession();
  return fetch(input, withToken(init, fresh?.authToken ?? null));
}
