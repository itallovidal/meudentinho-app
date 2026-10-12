import {
  clearAllLocalStorage,
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/asyncStorage";
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
  ) => void;
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
        setSessionExpired(true);
        void updateAppUser(null, null);
      },
    });
    return () => configureAuthFetch(null);
  }, []);

  async function loadUserFromStorage() {
    try {
      const storedUser = await getLocalStorageItem("user");
      const storedToken = await getLocalStorageItem("token");
      const storedRefreshToken = await getLocalStorageItem("refreshToken");
      const storedUserId = await getLocalStorageItem("userId");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        const parsedToken = JSON.parse(storedToken);
        if (parsedUser && parsedToken) {
          setUser(parsedUser);
          setAuthToken(parsedToken);
          if (storedRefreshToken) {
            const parsedRefresh = JSON.parse(storedRefreshToken);
            if (parsedRefresh) {
              setRefreshToken(parsedRefresh);
            }
          }
          if (storedUserId) {
            const parsedUserId = JSON.parse(storedUserId);
            if (parsedUserId) {
              setUserId(parsedUserId);
            }
          }
        } else {
          await clearAllLocalStorage();
        }
      }
    } catch (err) {
      console.log("Error loading user from storage:", err);
    } finally {
      setHydrated(true);
    }
  }

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  async function updateAppUser(
    user: BasicUser | null,
    authToken: string | null = null,
    refreshToken: string | null = null,
    userId: string | null = null,
  ) {
    try {
      if (user === null || authToken === null) {
        setAuthToken(null);
        setUser(null);
        setRefreshToken(null);
        setUserId(null);
        await clearAllLocalStorage();

        return;
      }

      setUser(user);
      setAuthToken(authToken);
      setRefreshToken(refreshToken);
      setUserId(userId);
      setSessionExpired(false);

      await setLocalStorageItem("user", JSON.stringify(user));
      await setLocalStorageItem("token", JSON.stringify(authToken));
      if (refreshToken) {
        await setLocalStorageItem(
          "refreshToken",
          JSON.stringify(refreshToken),
        );
      }
      if (userId) {
        await setLocalStorageItem("userId", JSON.stringify(userId));
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
