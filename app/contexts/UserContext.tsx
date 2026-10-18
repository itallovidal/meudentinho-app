import {
  clearAllLocalStorage,
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/asyncStorage";
import {
  getSecureItem,
  setSecureItem,
} from "@/lib/secureStorage";
import { configureAuthFetch } from "@/lib/authFetch";
import type { RefreshedSessionInfo } from "@/lib/authFetch";
import { getUserIdFromToken } from "@/lib/utils";
import type { BasicUser } from "@/types/domain";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface UserContextProps {
  user: BasicUser | null;
  authToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  hydrated: boolean;
  sessionExpired: boolean;
  updateAppUser: (
    user: BasicUser | null,
    authToken: string | null,
    refreshToken?: string | null,
    userId?: string | null,
  ) => Promise<void>;
  updateUserProfile: (
    profile: Partial<Pick<BasicUser, "name" | "email">>,
  ) => Promise<void>;
  clearSessionExpired: () => void;
}

export const UserContext = createContext<UserContextProps | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<BasicUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const sessionRef = useRef({ user, authToken, refreshToken, userId });
  sessionRef.current = { user, authToken, refreshToken, userId };
  const sessionGeneration = useRef(0);
  const persistGate = useRef<Promise<void>>(Promise.resolve());

  async function writeToken(
    key: "token" | "refreshToken",
    value: string,
  ): Promise<void> {
    const raw = JSON.stringify(value);
    try {
      await setSecureItem(key, raw);
    } catch {
      await setLocalStorageItem(key, raw);
    }
  }

  async function readMigratedToken(
    key: "token" | "refreshToken",
  ): Promise<string | null> {
    const secure = safeParse<string>(
      await getSecureItem(key).catch(() => null),
    );
    if (secure) {
      return secure;
    }
    const rawLegacy = await getLocalStorageItem(key);
    const legacy = safeParse<string>(rawLegacy);
    if (!legacy) {
      if (rawLegacy) {
        await removeLocalStorageItem(key).catch(() => undefined);
      }
      return null;
    }
    await writeToken(key, legacy);
    await removeLocalStorageItem(key).catch(() => undefined);
    return legacy;
  }

  async function persistRefreshedSession(
    token: string,
    refresh: string | null,
    info?: RefreshedSessionInfo,
  ) {
    const task = (async () => {
      const generation = sessionGeneration.current;
      const current = sessionRef.current;
      if (current.authToken == null) {
        return;
      }
      const nextRefreshToken = refresh ?? current.refreshToken;
      const nextUser =
        current.user && (info?.name || typeof info?.isAdmin === "boolean")
          ? {
              ...current.user,
              ...(info?.name ? { name: info.name } : null),
              ...(typeof info?.isAdmin === "boolean"
                ? { isAdmin: info.isAdmin }
                : null),
            }
          : current.user;
      await writeToken("token", token);
      if (nextRefreshToken) {
        await writeToken("refreshToken", nextRefreshToken);
      }
      if (nextUser && nextUser !== current.user) {
        await setLocalStorageItem("user", JSON.stringify(nextUser));
      }
      if (sessionGeneration.current !== generation) {
        if (sessionRef.current.authToken == null) {
          await clearAllLocalStorage();
        }
        return;
      }
      sessionRef.current = {
        ...current,
        user: nextUser,
        authToken: token,
        refreshToken: nextRefreshToken,
      };
      setAuthToken(token);
      setRefreshToken(nextRefreshToken);
      if (nextUser && nextUser !== current.user) {
        setUser(nextUser);
      }
    })();
    persistGate.current = task.then(
      () => undefined,
      () => undefined,
    );
    await task;
  }

  useEffect(() => {
    configureAuthFetch({
      getSession: () => ({
        authToken: sessionRef.current.authToken,
        refreshToken: sessionRef.current.refreshToken,
      }),
      onSessionRefreshed: (token, refresh, info) => {
        void persistRefreshedSession(token, refresh, info);
      },
      onSessionExpired: () => {
        void (async () => {
          await updateAppUser(null, null);
          setSessionExpired(true);
        })();
      },
    });
    return () => configureAuthFetch(null);
  }, []);

  function safeParse<T>(raw: string | null): T | null {
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async function clearSessionCache() {
    await queryClient.cancelQueries();
    queryClient.clear();
  }

  async function loadUserFromStorage() {
    try {
      const storedUser = await getLocalStorageItem("user");
      const storedUserId = await getLocalStorageItem("userId");
      const parsedToken = await readMigratedToken("token");
      const parsedRefresh = await readMigratedToken("refreshToken");

      if (!storedUser || !parsedToken) {
        if (storedUser || parsedToken || parsedRefresh || storedUserId) {
          await clearAllLocalStorage();
        }
        return;
      }

      const parsedUser = safeParse<BasicUser>(storedUser);
      const parsedUserId = safeParse<string>(storedUserId);

      const storageCorrupted =
        (storedUser && !parsedUser) || (storedUserId && !parsedUserId);

      if (storageCorrupted || !parsedUser) {
        await clearAllLocalStorage();
        return;
      }

      setUser(parsedUser);
      setAuthToken(parsedToken);
      if (parsedRefresh) {
        setRefreshToken(parsedRefresh);
      }
      let resolvedUserId = parsedUserId;
      if (!resolvedUserId && parsedToken) {
        try {
          const decoded = getUserIdFromToken(parsedToken);
          if (decoded) {
            resolvedUserId = decoded;
            await setLocalStorageItem("userId", JSON.stringify(decoded));
          }
        } catch {
          resolvedUserId = null;
        }
      }
      if (resolvedUserId) {
        setUserId(resolvedUserId);
      }
    } catch (err) {
      if (__DEV__) {
        console.log("Error loading user from storage:", err);
      }
      await clearAllLocalStorage();
    } finally {
      setHydrated(true);
    }
  }

  useEffect(() => {
    void loadUserFromStorage();
  }, []);

  const updateAppUser = useCallback(
    async (
      user: BasicUser | null,
      authToken: string | null = null,
      refreshToken?: string | null,
      userId?: string | null,
    ) => {
    try {
      await persistGate.current;
      sessionGeneration.current += 1;
      if (user === null || authToken === null) {
        await clearSessionCache();
        setAuthToken(null);
        setUser(null);
        setRefreshToken(null);
        setUserId(null);
        sessionRef.current = {
          user: null,
          authToken: null,
          refreshToken: null,
          userId: null,
        };
        setSessionExpired(false);
        await clearAllLocalStorage();

        return;
      }

      const nextRefreshToken =
        refreshToken === undefined
          ? sessionRef.current.refreshToken
          : refreshToken;
      let nextUserId =
        userId === undefined ? sessionRef.current.userId : userId;
      if (!nextUserId) {
        try {
          const decoded = getUserIdFromToken(authToken);
          if (decoded) {
            nextUserId = decoded;
          }
        } catch {
          nextUserId = null;
        }
      }

      const previousUserId = sessionRef.current.userId;
      const isAccountSwitch =
        !!previousUserId && previousUserId !== nextUserId;
      if (isAccountSwitch) {
        await clearSessionCache();
      }

      setUser(user);
      setAuthToken(authToken);
      setRefreshToken(nextRefreshToken);
      setUserId(nextUserId);
      sessionRef.current = {
        user,
        authToken,
        refreshToken: nextRefreshToken,
        userId: nextUserId,
      };
      setSessionExpired(false);

      await setLocalStorageItem("user", JSON.stringify(user));
      await writeToken("token", authToken);
      if (nextRefreshToken) {
        await writeToken("refreshToken", nextRefreshToken);
      }
      if (nextUserId) {
        await setLocalStorageItem("userId", JSON.stringify(nextUserId));
      }
    } catch (err) {
      if (__DEV__) {
        console.log("Error updating user:", err);
      }
    }
  },
  [],
);

  const updateUserProfile = useCallback(
    async (profile: Partial<Pick<BasicUser, "name" | "email">>) => {
    try {
      const current = sessionRef.current.user;
      if (!current) {
        return;
      }
      const nextUser: BasicUser = {
        ...current,
        ...(profile.name !== undefined
          ? { name: profile.name.trim() }
          : null),
        ...(profile.email !== undefined
          ? { email: profile.email.trim() }
          : null),
      };
      setUser(nextUser);
      sessionRef.current = { ...sessionRef.current, user: nextUser };
      await setLocalStorageItem("user", JSON.stringify(nextUser));
    } catch (err) {
      if (__DEV__) {
        console.log("Error updating user profile:", err);
      }
    }
  },
  [],
);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      authToken,
      refreshToken,
      userId,
      hydrated,
      sessionExpired,
      updateAppUser,
      updateUserProfile,
      clearSessionExpired,
    }),
    [
      user,
      authToken,
      refreshToken,
      userId,
      hydrated,
      sessionExpired,
      updateAppUser,
      updateUserProfile,
      clearSessionExpired,
    ],
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
