import { useCallback, useContext, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
} from "react-native";
import { ScreenContent } from "@/components/screenContent";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { useArticlesFeed } from "@/hooks/useArticlesFeed";
import { useArticleSearch } from "@/hooks/useArticleSearch";
import { errorMessage } from "@/lib/errorMessage";
import { ArticleCard } from "@/components/article/articleCard";
import { ArticleCategoriesFeed } from "@/components/article/articleCategoriesFeed";
import { ArticleFeedFooter } from "@/components/article/articleFeedFooter";
import { SearchInput } from "@/components/searchinput";
import { ErrorState } from "@/components/errorState";
import { Text } from "@/components/ui/text";
import { FloatingActionButton } from "@/components/ui/floatingActionButton";
import { SkeletonArticleListRender } from "@/skeletons/components/skeletonArticleListRender";
import { UserContext } from "@/contexts/UserContext";
import { THEME } from "@/lib/theme";
import type { ArticlesNavigationProp } from "@/navigation/ArticlesStack";
import type { ArticlePreviewDTO } from "@/types/dtos/article";
import { useNavigation } from "@react-navigation/native";
import { PlusIcon } from "phosphor-react-native";

export function Index() {
  const navigation = useNavigation<ArticlesNavigationProp>();
  const { user, hydrated } = useContext(UserContext)!;
  const {
    latestArticle,
    categories,
    selectedCategory,
    selectCategory,
    categoriesLoading,
    categoriesError,
    latestError,
    feed,
    isLoading,
    isError,
    isRefreshing,
    refetchError,
    onRefresh,
  } = useArticlesFeed();
  const [searchQuery, setSearchQuery] = useState("");
  const listRef = useRef<FlatList<ArticlePreviewDTO>>(null);
  const {
    results: searchResults,
    isFetching: isSearching,
    error: searchError,
    refetch: retrySearch,
    isSearchActive,
  } = useArticleSearch(searchQuery);

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchQuery(term);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const articles = isSearchActive
    ? isSearching || searchError
      ? []
      : searchResults
    : feed.articles;
  const pending = isSearchActive ? isSearching : isLoading;
  const failed = isSearchActive ? !!searchError : isError;

  function loadMore() {
    if (!isSearchActive && !feed.isFetchNextPageError) {
      feed.fetchNextPage();
    }
  }

  function handleSelectCategory(categoryId: string) {
    selectCategory(categoryId);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }

  return (
    <Wrapper direction="column" className="flex-1 bg-base-200">
      <Header />
      <View className="relative w-full flex-1">
        <FlatList
          ref={listRef}
          data={articles}
          keyExtractor={(article) => article.id}
          className="w-full flex-1"
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 96 }}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing && !isLoading}
              onRefresh={() => {
                void onRefresh();
                if (isSearchActive) void retrySearch();
              }}
            />
          }
          ListHeaderComponent={
            <ScreenContent gap="gap-4" className="pb-4">
              <SearchInput onSearchTermChange={handleSearchTermChange} />
              {!isSearchActive && (
                <ArticleCategoriesFeed
                  latestArticle={latestArticle}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  categoriesLoading={categoriesLoading}
                  categoriesError={categoriesError}
                  latestError={latestError}
                  refetchError={refetchError}
                  onRetry={() => void onRefresh()}
                />
              )}
            </ScreenContent>
          }
          renderItem={({ item }) => (
            <ScreenContent className="pb-2">
              <ArticleCard {...item} />
            </ScreenContent>
          )}
          ListEmptyComponent={
            <ScreenContent gap="gap-4">
              {failed && (
                <ErrorState
                  title={
                    isSearchActive
                      ? "Não foi possível buscar os artigos"
                      : "Não foi possível carregar os artigos"
                  }
                  message={errorMessage(
                    searchError,
                    "Verifique sua conexão e tente novamente.",
                  )}
                  onRetry={() =>
                    void (isSearchActive ? retrySearch() : onRefresh())
                  }
                />
              )}
              {pending || failed ? (
                <>
                  {isSearchActive && pending && (
                    <ActivityIndicator color={THEME.light.primary500} />
                  )}
                  <SkeletonArticleListRender showBanner={false} />
                </>
              ) : (
                !(latestArticle && !selectedCategory && !isSearchActive) && (
                  <Text className="w-full py-8 text-center text-muted-foreground">
                    {isSearchActive
                      ? `Nenhum artigo encontrado para "${searchQuery}"`
                      : selectedCategory
                        ? "Nenhum artigo nesta categoria."
                        : "Nenhum artigo disponível."}
                  </Text>
                )
              )}
            </ScreenContent>
          }
          ListFooterComponent={
            !isSearchActive && !isLoading && !isError ? (
              <ScreenContent>
                <ArticleFeedFooter
                  isError={feed.isFetchNextPageError}
                  isLoading={feed.isFetchingNextPage}
                  hasNextPage={feed.hasNextPage}
                  hasArticles={feed.articles.length > 0}
                  onLoadMore={feed.fetchNextPage}
                />
              </ScreenContent>
            ) : undefined
          }
        />
        {hydrated && user?.isAdmin && (
          <FloatingActionButton
            accessibilityLabel="Novo artigo"
            onPress={() => navigation.navigate("NewArticle")}
            icon={
              <PlusIcon
                size={24}
                weight="bold"
                color={THEME.light.primaryForeground}
              />
            }
          />
        )}
      </View>
    </Wrapper>
  );
}
