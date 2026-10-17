import {
  clearAllLocalStorage,
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/asyncStorage";
import { configureAuthFetch } from "@/lib/authFetch";
import { getUserIdFromToken } from "@/lib/utils";
import { BasicUser } from "@/types/domain";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [user, setUser] = useState<BasicUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const sessionRef = useRef({ user, authToken, refreshToken, userId });
  sessionRef.current = { user, authToken, refreshToken, userId };

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
    await setLocalStorageItem("token", JSON.stringify(token));
    if (refresh) {
      await setLocalStorageItem("refreshToken", JSON.stringify(refresh));
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

  async function clearSessionCache() {
    await queryClient.cancelQueries();
    queryClient.clear();
  }

  async function loadUserFromStorage() {
    try {
      const storedUser = await getLocalStorageItem("user");
      const storedToken = await getLocalStorageItem("token");
      const storedRefreshToken = await getLocalStorageItem("refreshToken");
      const storedUserId = await getLocalStorageItem("userId");

      if (!storedUser || !storedToken) {
        if (storedUser || storedToken || storedRefreshToken || storedUserId) {
          await clearAllLocalStorage();
        }
        return;
      }

      const parsedUser = safeParse<BasicUser>(storedUser);
      const parsedToken = safeParse<string>(storedToken);
      const parsedRefresh = safeParse<string>(storedRefreshToken);
      const parsedUserId = safeParse<string>(storedUserId);

      const storageCorrupted =
        (storedUser && !parsedUser) ||
        (storedToken && !parsedToken) ||
        (storedRefreshToken && !parsedRefresh) ||
        (storedUserId && !parsedUserId);

      if (storageCorrupted || !parsedUser || !parsedToken) {
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
      await setLocalStorageItem("token", JSON.stringify(authToken));
      if (nextRefreshToken) {
        await setLocalStorageItem(
          "refreshToken",
          JSON.stringify(nextRefreshToken),
        );
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
