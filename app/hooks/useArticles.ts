import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllArticlePreview } from "@/api/article/getAllArticles";
import { retryQuery } from "@/lib/queryRetry";

export const HOME_ARTICLES_PAGE_KEY = ["articles-preview", "home"] as const;

export function useArticles() {
  const queryClient = useQueryClient();

  const articlesQuery = useQuery({
    queryKey: HOME_ARTICLES_PAGE_KEY,
    queryFn: () => getAllArticlePreview().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  const articles = articlesQuery.data ?? [];

  async function onRefresh() {
    await queryClient.invalidateQueries({ queryKey: ["articles-preview"] });
  }

  return {
    articles: articles.slice(1),
    latestArticle: articles.at(0),
    isLoading: articlesQuery.isLoading,
    isRefreshing: articlesQuery.isRefetching,
    isError: articlesQuery.isLoadingError,
    refetchError: articlesQuery.isRefetchError,
    onRefresh,
  };
}
