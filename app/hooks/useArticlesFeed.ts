import { useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getAllArticlePreview } from "@/api/article/getAllArticles";
import { getAllCategories } from "@/api/article/getAllCategories";
import {
  articlePreviewsInfiniteQueryKey,
  articlePreviewsQueryKey,
} from "@/lib/queryKeys";
import { retryQuery } from "@/lib/queryRetry";
import type { ArticleCategory } from "@/types/dtos/article";

const ALL_CATEGORY_ID = "all";
export const ARTICLE_FEED_PAGE_SIZE = 20;

export function useArticlesFeed() {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);

  const latestQuery = useQuery({
    queryKey: articlePreviewsQueryKey("", 1, 1),
    queryFn: () =>
      getAllArticlePreview({ page: 1, perPage: 1 }).then(
        (response) => response.data[0] ?? null,
      ),
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  const categoriesQuery = useQuery({
    queryKey: ["article-categories"],
    queryFn: () => getAllCategories().then((response) => response.data),
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  const categories = useMemo<ArticleCategory[]>(() => {
    const data = categoriesQuery.data ?? [];
    return data.map((category) => ({
      id: category.id,
      name: category.name,
      isSelected: category.id === selectedCategoryId,
    }));
  }, [categoriesQuery.data, selectedCategoryId]);

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const activeCategoryName = selectedCategory?.name ?? "";
  const latestArticle = latestQuery.data ?? undefined;

  const feedQuery = useInfiniteQuery({
    queryKey: articlePreviewsInfiniteQueryKey(
      activeCategoryName,
      ARTICLE_FEED_PAGE_SIZE,
    ),
    queryFn: ({ pageParam }) =>
      getAllArticlePreview({
        category: activeCategoryName,
        page: pageParam,
        perPage: ARTICLE_FEED_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      return meta && meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  const rawFeedArticles =
    feedQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const seenIds = new Set<string>();
  const feedArticles = rawFeedArticles.filter((article) => {
    if (article.id === latestArticle?.id || seenIds.has(article.id)) {
      return false;
    }
    seenIds.add(article.id);
    return true;
  });

  function selectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
  }

  function fetchNextPage() {
    if (feedQuery.hasNextPage && !feedQuery.isFetching) {
      void feedQuery.fetchNextPage();
    }
  }

  const isLoading = feedQuery.isLoading || latestQuery.isLoading;
  const isError = feedQuery.isLoadingError;
  const isRefreshing =
    categoriesQuery.isRefetching ||
    latestQuery.isRefetching ||
    feedQuery.isRefetching;
  const refetchError = feedQuery.isRefetchError || latestQuery.isRefetchError;

  async function onRefresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["articles-preview"] }),
      queryClient.invalidateQueries({ queryKey: ["article-categories"] }),
    ]);
  }

  const feed = {
    articles: feedArticles,
    isFetchNextPageError: feedQuery.isFetchNextPageError,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    hasNextPage: feedQuery.hasNextPage,
    fetchNextPage,
  };

  return {
    latestArticle,
    latestLoading: latestQuery.isLoading,
    categories,
    selectedCategoryId,
    selectedCategory,
    selectCategory,
    categoriesLoading: categoriesQuery.isLoading,
    categoriesError: categoriesQuery.isError,
    latestError: latestQuery.isLoadingError,
    feed,
    isLoading,
    isError,
    isRefreshing,
    refetchError,
    onRefresh,
  };
}
