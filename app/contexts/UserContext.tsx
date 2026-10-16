import {
  clearAllLocalStorage,
  getLocalStorageItem,
  setLocalStorageItem,
  setLocalStorageItems,
} from "@/lib/asyncStorage";
import { configureAuthFetch } from "@/lib/authFetch";
import type { RefreshedSessionInfo } from "@/lib/authFetch";
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
  updateUserProfile: (
    profile: Partial<Pick<BasicUser, "name" | "email">>,
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
  const sessionGeneration = useRef(0);
  const persistGate = useRef<Promise<void>>(Promise.resolve());

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
      const entries: Array<[string, string]> = [
        ["token", JSON.stringify(token)],
      ];
      if (nextRefreshToken) {
        entries.push(["refreshToken", JSON.stringify(nextRefreshToken)]);
      }
      if (nextUser && nextUser !== current.user) {
        entries.push(["user", JSON.stringify(nextUser)]);
      }
      await setLocalStorageItems(entries);
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
      await persistGate.current;
      sessionGeneration.current += 1;
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

  async function updateUserProfile(
    profile: Partial<Pick<BasicUser, "name" | "email">>,
  ) {
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
      console.log("Error updating user profile:", err);
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
        updateUserProfile,
        clearSessionExpired,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
