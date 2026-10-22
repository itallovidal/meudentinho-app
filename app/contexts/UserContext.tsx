import { AppState } from "react-native";
import { FeedbackSheet } from "@/components/feedbackSheet";
import { configureAuthFetch } from "@/lib/authFetch";
import { createSessionManager } from "@/lib/sessionManager";
import { errorMessage } from "@/lib/errorMessage";
import { getUserIdFromToken } from "@/lib/utils";
import type { StoredSession } from "@/lib/sessionStorage";
import type { BasicUser } from "@/types/domain";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  expireSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const UserContext = createContext<UserContextProps | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [manager] = useState(() =>
    createSessionManager({
      onChange: (next, expired) => {
        setSession(next);
        setSessionExpired(expired);
      },
      onClearCache: async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
      },
    }),
  );

  const showSessionError = useCallback((error: unknown) => {
    setSessionError(
      errorMessage(
        error,
        "Não foi possível atualizar a sessão. Tente novamente.",
      ),
    );
  }, []);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      try {
        await manager.restore();
      } catch (error) {
        if (active) {
          showSessionError(error);
        }
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
      if (active) {
        void manager.retryPendingRevocations().catch(showSessionError);
      }
    }
    void restoreSession();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void manager.retryPendingRevocations().catch(showSessionError);
      }
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [manager, showSessionError]);

  const updateAppUser = useCallback(
    async (
      user: BasicUser | null,
      authToken: string | null,
      refreshToken?: string | null,
      userId?: string | null,
    ) => {
      if (!user || !authToken) {
        await manager.update(null);
        return;
      }
      const current = manager.getSession();
      const nextUserId = userId ?? getUserIdFromToken(authToken);
      const sameAccount = current?.userId === nextUserId;
      await manager.update({
        user,
        authToken,
        refreshToken:
          refreshToken === undefined && sameAccount
            ? (current?.refreshToken ?? null)
            : (refreshToken ?? null),
        userId: nextUserId,
      });
    },
    [manager],
  );

  const expireSession = useCallback(async () => {
    try {
      await manager.expire();
    } catch (error) {
      showSessionError(error);
    }
  }, [manager, showSessionError]);

  useEffect(() => {
    configureAuthFetch({
      getSession: () => ({
        authToken: manager.getSession()?.authToken ?? null,
        refreshToken: manager.getSession()?.refreshToken ?? null,
        generation: manager.getRevision(),
      }),
      onSessionRefreshed: async (token, refresh, info, expectedRefresh) => {
        try {
          await manager.refresh(token, refresh, info, expectedRefresh);
        } catch (error) {
          showSessionError(error);
          throw error;
        }
      },
      onSessionExpired: async (expectedRefresh) => {
        try {
          await manager.expire(expectedRefresh);
        } catch (error) {
          showSessionError(error);
        }
      },
    });
    return () => configureAuthFetch(null);
  }, [manager, showSessionError]);

  const updateUserProfile = useCallback(
    (profile: Partial<Pick<BasicUser, "name" | "email">>) =>
      manager.updateProfile(profile),
    [manager],
  );
  const signOut = useCallback(() => manager.signOut(), [manager]);
  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);
  const contextValue = useMemo(
    () => ({
      user: session?.user ?? null,
      authToken: session?.authToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      userId: session?.userId ?? null,
      hydrated,
      sessionExpired,
      updateAppUser,
      updateUserProfile,
      clearSessionExpired,
      expireSession,
      signOut,
    }),
    [
      session,
      hydrated,
      sessionExpired,
      updateAppUser,
      updateUserProfile,
      clearSessionExpired,
      expireSession,
      signOut,
    ],
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
      <FeedbackSheet
        title="Não foi possível concluir a operação"
        message={sessionError}
        onClose={() => setSessionError(null)}
      />
    </UserContext.Provider>
  );
}
