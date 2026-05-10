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
  updateAppUser: (user: BasicUser | null, authToken: string | null) => void;
}

export const UserContext = createContext<UserContextProps | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  async function loadUserFromStorage() {
    try {
      const storedUser = await getLocalStorageItem("user");
      const storedToken = await getLocalStorageItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setAuthToken(JSON.parse(storedToken));
      }
    } catch (err) {
      console.log("Error loading user from storage:", err);
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
      if (user === null && authToken === null) {
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
    <UserContext.Provider value={{ user, authToken, updateAppUser }}>
      {children}
    </UserContext.Provider>
  );
}
