import { UserContext } from "@/contexts/UserContext";
import { useContext } from "react";
import type { ReactNode } from "react";

type SessionGateProps = {
  children: ReactNode;
  fallback: ReactNode;
  loadingFallback?: ReactNode;
};

export function SessionGate({
  children,
  fallback,
  loadingFallback = null,
}: SessionGateProps) {
  const { hydrated, authToken, user } = useContext(UserContext)!;

  if (!hydrated) {
    return <>{loadingFallback}</>;
  }

  if (!authToken || !user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
