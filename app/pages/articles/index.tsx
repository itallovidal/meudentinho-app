import { useState } from "react";
import { ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { useArticles } from "@/hooks/useArticles";
import { ArticleListSection } from "@/components/article/articleListSection";
import { SearchInput } from "@/components/searchinput";
import { Text } from "@/components/ui/text";
import { ArticlePreviewDTO } from "@/types/dtos/article";

export function Index() {
  const {
    isRefreshing,
    onRefresh,
    articles,
    latestArticle,
    categories,
    articlesByCategory,
    isLoading,
  } = useArticles({ withCategories: true });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    ArticlePreviewDTO[] | null
  >(null);
  const [isSearching, setIsSearching] = useState(false);

  function handleSearchStart(query: string) {
    setSearchQuery(query);
    setSearchResults(null);
    setIsSearching(true);
  }

  function handleSearchComplete(query: string, results: ArticlePreviewDTO[]) {
    setSearchQuery(query);
    setSearchResults(results);
    setIsSearching(false);
  }

  function handleSearchReset() {
    setSearchQuery("");
    setSearchResults(null);
    setIsSearching(false);
  }

  const isSearchActive = searchQuery.trim() !== "";

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
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <Wrapper
          className="mx-6 my-4 flex-1"
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
        >
          <SearchInput
            onSearchStart={handleSearchStart}
            onSearchComplete={handleSearchComplete}
            onSearchReset={handleSearchReset}
          />

          {isSearching && (
            <Wrapper className="w-full items-center justify-center py-8">
              <ActivityIndicator size="large" color="gray" />
              <Text className="mt-2">Buscando artigos...</Text>
            </Wrapper>
          )}

          {!isSearching && searchResults !== null && isSearchActive && (
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
            />
          )}
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
