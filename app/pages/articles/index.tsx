import { useCallback, useState } from "react";
import { ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { useArticles } from "@/hooks/useArticles";
import { useArticleSearch } from "@/hooks/useArticleSearch";
import { ArticleListSection } from "@/components/article/articleListSection";
import { SearchInput } from "@/components/searchinput";
import { ErrorState } from "@/components/errorState";
import { Text } from "@/components/ui/text";
import { isApiError } from "@/types/predicates";

export function Index() {
  const {
    isRefreshing,
    onRefresh,
    articles,
    latestArticle,
    categories,
    articlesByCategory,
    isLoading,
    isError,
  } = useArticles({ withCategories: true });

  const [searchQuery, setSearchQuery] = useState("");
  const {
    results: searchResults,
    isFetching: isSearching,
    error: searchError,
    refetch: retrySearch,
    isSearchActive,
  } = useArticleSearch(searchQuery);

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchQuery(term);
  }, []);

  const searchErrorMessage = isApiError(searchError)
    ? searchError.message
    : "Verifique sua conexão e tente novamente.";

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="flex-1"
    >
      <Header />
      <ScrollView
        className="w-full flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing && !isLoading}
            onRefresh={onRefresh}
          />
        }
      >
        <Wrapper
          className="mx-6 my-4 flex-1"
          direction="column"
          align="start"
          justify="start"
          gap="gap-4"
        >
          <SearchInput onSearchTermChange={handleSearchTermChange} />

          {isSearching && (
            <Wrapper className="w-full items-center justify-center py-8">
              <ActivityIndicator size="large" color="gray" />
              <Text className="mt-2">Buscando artigos...</Text>
            </Wrapper>
          )}

          {!isSearching && isSearchActive && !!searchError && (
            <ErrorState
              title="Não foi possível buscar os artigos"
              message={searchErrorMessage}
              onRetry={() => void retrySearch()}
            />
          )}

          {!isSearching && isSearchActive && !searchError && (
            <>
              {searchResults.length === 0 ? (
                <Text className="py-8 text-center">
                  Nenhum artigo encontrado para "{searchQuery}"
                </Text>
              ) : (
                <ArticleListSection
                  withCategories={false}
                  articles={searchResults}
                />
              )}
            </>
          )}

          {!isSearching && !isSearchActive && (
            <ArticleListSection
              withCategories
              articles={articles}
              latestArticle={latestArticle}
              categories={categories}
              articlesByCategory={articlesByCategory}
              isLoading={isLoading}
              isError={isError}
              onRetry={onRefresh}
            />
          )}
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
