import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/api/article/getAllCategories";
import { retryQuery } from "@/lib/queryRetry";

export function useCategories() {
  const query = useQuery({
    queryKey: ["article-categories"],
    queryFn: () => getAllCategories().then((response) => response.data ?? []),
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isPending && query.fetchStatus !== "idle",
    isRefreshing: query.isRefetching,
    isError: query.isLoadingError,
    refetchError: query.isRefetchError,
    refetch: query.refetch,
  };
}
