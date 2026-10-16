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
import { BasicUser } from "@/types/domain";
import { createContext, useEffect, useRef, useState } from "react";
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
  clearSessionExpired: () => void;
}

export const UserContext = createContext<UserContextProps | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const sessionRef = useRef({ user, authToken, refreshToken, userId });
  sessionRef.current = { user, authToken, refreshToken, userId };

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
  ) {
    sessionRef.current = {
      ...sessionRef.current,
      authToken: token,
      refreshToken: refresh ?? sessionRef.current.refreshToken,
    };
    setAuthToken(token);
    if (refresh) {
      setRefreshToken(refresh);
    }
    await writeToken("token", token);
    if (refresh) {
      await writeToken("refreshToken", refresh);
    }
  }

  useEffect(() => {
    configureAuthFetch({
      getSession: () => ({
        authToken: sessionRef.current.authToken,
        refreshToken: sessionRef.current.refreshToken,
      }),
      onSessionRefreshed: (token, refresh) => {
        void persistRefreshedSession(token, refresh);
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
      if (parsedUserId) {
        setUserId(parsedUserId);
      }
    } catch (err) {
      console.log("Error loading user from storage:", err);
      await clearAllLocalStorage();
    } finally {
      setHydrated(true);
    }
  }

  useEffect(() => {
    void loadUserFromStorage();
  }, []);

  async function updateAppUser(
    user: BasicUser | null,
    authToken: string | null = null,
    refreshToken?: string | null,
    userId?: string | null,
  ) {
    try {
      if (user === null || authToken === null) {
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
      const nextUserId =
        userId === undefined ? sessionRef.current.userId : userId;

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
      console.log("Error updating user:", err);
    }
  }

  function clearSessionExpired() {
    setSessionExpired(false);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        authToken,
        refreshToken,
        userId,
        hydrated,
        sessionExpired,
        updateAppUser,
        clearSessionExpired,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
