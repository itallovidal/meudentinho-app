import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import { getAllCategories } from "@/api/article/getAllCategories";
import { getAllArticlePreview } from "@/api/article/getAllArticles";

type UseArticlesOptions = {
  withCategories?: boolean;
};
const MAX_ATTEMPTS = 2

export function useArticles(options: UseArticlesOptions = {}) {
  const { withCategories = true } = options;
  const queryClient = useQueryClient();

  const { data: articlesData, isFetching: isArticlesFetching } = useQuery({
    queryKey: ["articles-preview"],
    queryFn: () => getAllArticlePreview().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      const r = error as any;
      if (r.response && r.response?.status == 404) return false;
      if (r.response && r.response?.status != 404) return true;
      return failureCount < MAX_ATTEMPTS;
    }
  });

  const { data: categoriesData, isFetching: isCategoriesFetching } = useQuery({
    queryKey: ["article-categories"],
    queryFn: () => getAllCategories().then((res) => res.data),
    enabled: withCategories,
    staleTime: 1000 * 60 * 5,
  });

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
      if (map[article.categories]) {
        map[article.categories].push(article);
      }
    });

    return map;
  }, [articles, categories, withCategories]);

  const latestArticle = articles.at(0);
  const isLoading = !articles.length || (withCategories && !categories.length);

  const isRefreshing = isArticlesFetching || (withCategories && isCategoriesFetching);

  async function onRefresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["articles-preview"] }),
      queryClient.invalidateQueries({ queryKey: ["article-categories"] }),
    ]);
  }

  return {
    articles: articles.slice(1),
    categories,
    articlesByCategory,
    latestArticle,
    isLoading,
    isRefreshing,
    onRefresh,
  };
}
