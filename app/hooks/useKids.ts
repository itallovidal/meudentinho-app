import { useQuery } from "@tanstack/react-query";
import { getAllKids } from "@/api/kids/getAllKids";
import { ApiError } from "@/types/domain";

export type KidsLoadFailure = "auth" | "network";

export function useKids(authToken: string | null | undefined) {
  const query = useQuery({
    queryKey: ["kids"],
    queryFn: () => getAllKids(authToken!).then((res) => res.data ?? []),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

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
