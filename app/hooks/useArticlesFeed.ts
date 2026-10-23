import { useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useQueries,
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
import type { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";

const ALL_CATEGORY_ID = "all";
const GROUP_FETCH_SIZE = 4;
const GROUP_DISPLAY_SIZE = 3;
export const ARTICLE_FEED_PAGE_SIZE = 20;

export type ArticleCategoryPreview = {
  category: ArticleCategory;
  articles: ArticlePreviewDTO[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export type ArticleFeedState = {
  articles: ArticlePreviewDTO[];
  isPending: boolean;
  isLoadingError: boolean;
  isRefetchError: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
};

export function useArticlesFeed() {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);

  const latestQuery = useQuery({
    queryKey: articlePreviewsQueryKey("", 1, 1),
    queryFn: () =>
      getAllArticlePreview({ page: 1, perPage: 1 }).then(
        (response) => response.data[0],
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
  const isAllSelected = !selectedCategory;
  const activeCategoryName = selectedCategory?.name ?? "";
  const latestArticle = latestQuery.data;

  const previewResults = useQueries({
    queries: categories.map((category) => ({
      queryKey: articlePreviewsQueryKey(category.name, 1, GROUP_FETCH_SIZE),
      queryFn: () =>
        getAllArticlePreview({
          category: category.name,
          page: 1,
          perPage: GROUP_FETCH_SIZE,
        }),
      enabled: isAllSelected,
      staleTime: 1000 * 60 * 5,
      retry: retryQuery,
    })),
  });

  const previews = useMemo<ArticleCategoryPreview[]>(() => {
    return categories.map((category, index) => {
      const result = previewResults[index];
      const rawArticles = result?.data?.data ?? [];
      const articles = (latestArticle
        ? rawArticles.filter((article) => article.id !== latestArticle.id)
        : rawArticles
      )
        .filter((article) =>
          (article.categories ?? []).includes(category.name),
        )
        .slice(0, GROUP_DISPLAY_SIZE);

      return {
        category,
        articles,
        isLoading: result?.isLoading ?? false,
        isError: result?.isError ?? false,
        refetch: () => {
          void result?.refetch();
        },
      };
    });
  }, [categories, latestArticle, previewResults]);

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
    enabled: !!selectedCategory,
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  const rawFeedArticles =
    feedQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const feedArticles = activeCategoryName
    ? (latestArticle
        ? rawFeedArticles.filter((article) => article.id !== latestArticle.id)
        : rawFeedArticles
      ).filter((article) =>
        (article.categories ?? []).includes(activeCategoryName),
      )
    : latestArticle
    ? rawFeedArticles.filter((article) => article.id !== latestArticle.id)
    : rawFeedArticles;

  function selectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
  }

  function fetchNextPage() {
    if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
      void feedQuery.fetchNextPage();
    }
  }

  const activePreviewResults = isAllSelected ? previewResults : [];
  const isLoading =
    categoriesQuery.isLoading ||
    (isAllSelected
      ? activePreviewResults.some((result) => result.isLoading)
      : feedQuery.isLoading);
  const isError =
    categoriesQuery.isError || (!isAllSelected && feedQuery.isLoadingError);
  const isRefreshing =
    categoriesQuery.isRefetching ||
    latestQuery.isRefetching ||
    activePreviewResults.some((result) => result.isRefetching) ||
    (!isAllSelected && feedQuery.isRefetching);
  const refetchError =
    categoriesQuery.isRefetchError ||
    latestQuery.isRefetchError ||
    activePreviewResults.some((result) => result.isRefetchError) ||
    (!isAllSelected && feedQuery.isRefetchError);

  async function onRefresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["articles-preview"] }),
      queryClient.invalidateQueries({ queryKey: ["article-categories"] }),
    ]);
  }

  const feed: ArticleFeedState = {
    articles: feedArticles,
    isPending: feedQuery.isLoading,
    isLoadingError: feedQuery.isLoadingError,
    isRefetchError: feedQuery.isRefetchError,
    isFetchNextPageError: feedQuery.isFetchNextPageError,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    hasNextPage: feedQuery.hasNextPage,
    fetchNextPage,
    refetch: () => {
      void feedQuery.refetch();
    },
  };

  return {
    latestArticle,
    categories,
    selectedCategoryId,
    selectedCategory,
    selectCategory,
    previews,
    feed,
    isLoading,
    isError,
    isRefreshing,
    refetchError,
    onRefresh,
  };
}
