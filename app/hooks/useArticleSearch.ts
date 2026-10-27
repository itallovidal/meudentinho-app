import { useQuery } from "@tanstack/react-query";
import { searchArticles } from "@/api/article/searchArticles";
import { retryQuery } from "@/lib/queryRetry";

const MIN_SEARCH_LENGTH = 2;

export function useArticleSearch(term: string) {
  const trimmed = term.trim();
  const isSearchActive = trimmed.length >= MIN_SEARCH_LENGTH;

  const query = useQuery({
    queryKey: ["articles-search", trimmed],
    queryFn: () => searchArticles(trimmed).then((res) => res.data ?? []),
    enabled: isSearchActive,
    staleTime: 0,
    retry: retryQuery,
  });

  return { ...query, results: query.data ?? [], isSearchActive };
}
