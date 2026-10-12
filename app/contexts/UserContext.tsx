import {
  clearAllLocalStorage,
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/asyncStorage";
import { BasicUser } from "@/types/domain";
import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface UserContextProps {
  user: BasicUser | null;
  authToken: string | null;
  hydrated: boolean;
  updateAppUser: (user: BasicUser | null, authToken: string | null) => void;
}

export const UserContext = createContext<UserContextProps | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  async function loadUserFromStorage() {
    try {
      const storedUser = await getLocalStorageItem("user");
      const storedToken = await getLocalStorageItem("token");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        const parsedToken = JSON.parse(storedToken);
        if (parsedUser && parsedToken) {
          setUser(parsedUser);
          setAuthToken(parsedToken);
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
  ) {
    try {
      if (user === null || authToken === null) {
        setAuthToken(null);
        setUser(null);
        await clearAllLocalStorage();

        return;
      }

      setUser(user);
      setAuthToken(authToken);

      await setLocalStorageItem("user", JSON.stringify(user));
      await setLocalStorageItem("token", JSON.stringify(authToken));
    } catch (err) {
      console.log("Error updating user:", err);
    }
  }

  return (
    <UserContext.Provider value={{ user, authToken, hydrated, updateAppUser }}>
      {children}
    </UserContext.Provider>
  );
}
