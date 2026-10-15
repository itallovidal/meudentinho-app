import { useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllKids } from "@/api/kids/getAllKids";
import { kidsSubject } from "@/lib/kidsSubject";
import { UserContext } from "@/contexts/UserContext";
import { ApiError } from "@/types/domain";
import { KidResponseDTO } from "@/types/dtos/user";

export type KidsLoadFailure = "auth" | "network";

export function useKids(authToken: string | null | undefined) {
  const queryClient = useQueryClient();
  const { userId } = useContext(UserContext)!;
  const accountKey = userId ?? authToken ?? "";
  const query = useQuery({
    queryKey: ["kids", accountKey],
    queryFn: () => getAllKids(authToken!).then((res) => res.data ?? []),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  useEffect(() => {
    const unsubscribe = kidsSubject.subscribe((event) => {
      const changedKid = event.kid;
      const kidsKey = ["kids", accountKey];
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
  }, [queryClient, accountKey]);

  useEffect(() => {
    if (!authToken) {
      queryClient.removeQueries({ queryKey: ["kids"] });
    }
  }, [authToken, queryClient]);

  let failure: KidsLoadFailure | null = null;
  if (query.isError) {
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

  return {
    kids: query.data ?? [],
    isLoading: query.isPending && query.fetchStatus !== "idle",
    isRefreshing: query.isRefetching,
    isFetching: query.isFetching,
    failure,
    refetch: query.refetch,
  };
}
