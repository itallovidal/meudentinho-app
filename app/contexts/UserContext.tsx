import { BasicUser } from "@/types/domain";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface UserContextProps {
  user: BasicUser | null;
  authToken: string | null;
  setUser: (user: BasicUser | null) => void;
  setAuthToken: (token: string | null) => void;
}

export const UserContext = createContext<UserContextProps | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ user, authToken, setUser, setAuthToken }}>
      {children}
    </UserContext.Provider>
  );
}
