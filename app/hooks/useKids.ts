import { useContext, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllKids } from "@/api/kids/getAllKids";
import { kidsSubject } from "@/lib/kidsSubject";
import { kidsQueryKey, resolveAccountId } from "@/lib/queryKeys";
import { retryQuery } from "@/lib/queryRetry";
import { UserContext } from "@/contexts/UserContext";
import { ApiError } from "@/types/domain";
import type { KidResponseDTO } from "@/types/dtos/user";

export type KidsLoadFailure = "auth" | "network";

export function useKids(authToken: string | null | undefined) {
  const queryClient = useQueryClient();
  const { userId } = useContext(UserContext)!;
  const accountId = resolveAccountId(userId, authToken);
  const kidsKey = useMemo(() => kidsQueryKey(accountId), [accountId]);
  const query = useQuery({
    queryKey: kidsKey,
    queryFn: () => getAllKids(authToken!).then((res) => res.data ?? []),
    enabled: !!authToken && !!accountId,
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  useEffect(() => {
    const unsubscribe = kidsSubject.subscribe((event) => {
      const changedKid = event.kid;
      queryClient.setQueryData<KidResponseDTO[]>(kidsKey, (previous) => {
        if (!previous) {
          return previous;
        }
        if (event.type === "created" && changedKid) {
          const alreadyListed = previous.some(
            (kid) => kid.id === changedKid.id,
          );
          if (alreadyListed) {
            return previous;
          }
          return [...previous, changedKid];
        }
        if (event.type === "updated" && changedKid) {
          return previous.map((kid) =>
            kid.id === changedKid.id ? changedKid : kid,
          );
        }
        if (event.type === "deleted" && event.kidId) {
          const removedId = event.kidId;
          return previous.filter((kid) => kid.id !== removedId);
        }
        return previous;
      });
      void queryClient.invalidateQueries({ queryKey: kidsKey });
    });
    return unsubscribe;
  }, [queryClient, accountId, kidsKey]);

  let failure: KidsLoadFailure | null = null;
  if (query.isLoadingError) {
    const error = query.error;
    if (error instanceof ApiError) {
      const message = error.message ?? "";
      const isAuth =
        error.code === "INVALID_CREDENTIALS" ||
        /401|unauthori|expir|sess[aã]o expir|token expir|invalid token/i.test(
          message,
        );
      failure = isAuth ? "auth" : "network";
    } else {
      failure = "network";
    }
  }

  const kids = useMemo(
    () =>
      [...(query.data ?? [])].sort(
        (left, right) =>
          left.name.localeCompare(right.name, "pt-BR", {
            sensitivity: "base",
          }) || left.id.localeCompare(right.id),
      ),
    [query.data],
  );

  return {
    kids: accountId ? kids : [],
    isLoading: query.isPending && query.fetchStatus !== "idle",
    isRefreshing: query.isRefetching,
    isFetching: query.isFetching,
    failure,
    refetchError: query.isRefetchError,
    refetch: query.refetch,
  };
}
