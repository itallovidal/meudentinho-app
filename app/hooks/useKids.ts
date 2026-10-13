import { useQuery } from "@tanstack/react-query";
import { getAllKids } from "@/api/kids/getAllKids";
import { ApiError } from "@/types/domain";

export type KidsLoadFailure = "auth" | "network";

export function useKids(authToken: string | null | undefined) {
  const query = useQuery({
    queryKey: ["kids", authToken],
    queryFn: () => getAllKids(authToken!).then((res) => res.data ?? []),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  let failure: KidsLoadFailure | null = null;
  if (query.isError) {
    const error = query.error;
    failure =
      error instanceof ApiError && error.code === "INVALID_CREDENTIALS"
        ? "auth"
        : "network";
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
