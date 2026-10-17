import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import { getAllCategories } from "@/api/article/getAllCategories";
import { getAllArticlePreview } from "@/api/article/getAllArticles";

type UseArticlesOptions = {
  withCategories?: boolean;
};

export function useArticles(options: UseArticlesOptions = {}) {
  const { withCategories = true } = options;
  const queryClient = useQueryClient();

  const articlesQuery = useQuery({
    queryKey: ["articles-preview"],
    queryFn: () => getAllArticlePreview().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const categoriesQuery = useQuery({
    queryKey: ["article-categories"],
    queryFn: () => getAllCategories().then((res) => res.data),
    enabled: withCategories,
    staleTime: 1000 * 60 * 5,
  });

  const articlesData = articlesQuery.data;
  const categoriesData = categoriesQuery.data;

  const articles = articlesData ?? [];
  const categories = useMemo<ArticleCategory[]>(() => {
    if (!categoriesData) return [];
    return categoriesData.map((cat) => ({
      id: cat.id,
      name: cat.name,
      isSelected: false,
    }));
  }, [categoriesData]);

  const articlesByCategory = useMemo(() => {
    if (!withCategories) return {};

    const map: Record<string, ArticlePreviewDTO[]> = {};

    categories.forEach((cat) => {
      map[cat.name] = [];
    });

    const [latest, ...list] = articles;

    list.forEach((article) => {
      for (const category of article.categories ?? []) {
        if (map[category]) {
          map[category].push(article);
        }
      }
    });

    return map;
  }, [articles, categories, withCategories]);

  const latestArticle = articles.at(0);
  const isLoading =
    articlesQuery.isLoading || (withCategories && categoriesQuery.isLoading);

  const articlesLoadError = articlesQuery.isLoadingError;
  const categoriesLoadError = withCategories && categoriesQuery.isLoadingError;
  const isError = articlesLoadError || categoriesLoadError;

  const refetchError =
    articlesQuery.isRefetchError ||
    (withCategories && categoriesQuery.isRefetchError);

  const isRefreshing =
    articlesQuery.isRefetching ||
    (withCategories && categoriesQuery.isRefetching);

  async function onRefresh() {
    const jobs = [
      queryClient.invalidateQueries({ queryKey: ["articles-preview"] }),
    ];
    if (withCategories) {
      jobs.push(
        queryClient.invalidateQueries({ queryKey: ["article-categories"] }),
      );
    }
    await Promise.all(jobs);
  }

  return {
    articles: articles.slice(1),
    categories,
    articlesByCategory,
    latestArticle,
    isLoading,
    isRefreshing,
    isError,
    refetchError,
    onRefresh,
  };
}
