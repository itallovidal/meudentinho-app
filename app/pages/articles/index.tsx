import { useCallback, useContext, useState } from "react";
import {
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  View,
} from "react-native";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { useArticles } from "@/hooks/useArticles";
import { useArticleSearch } from "@/hooks/useArticleSearch";
import { errorMessage } from "@/lib/errorMessage";
import { ArticleListSection } from "@/components/article/articleListSection";
import { SearchInput } from "@/components/searchinput";
import { ErrorState } from "@/components/errorState";
import { Text } from "@/components/ui/text";
import { FloatingActionButton } from "@/components/ui/floatingActionButton";
import { UserContext } from "@/contexts/UserContext";
import { THEME } from "@/lib/theme";
import { ArticlesNavigationProp } from "@/navigation/ArticlesStack";
import { useNavigation } from "@react-navigation/native";
import { PlusIcon } from "phosphor-react-native";

export function Index() {
  const navigation = useNavigation<ArticlesNavigationProp>();
  const { user, hydrated } = useContext(UserContext)!;
  const colors = THEME.light;
  const {
    isRefreshing,
    onRefresh,
    articles,
    latestArticle,
    categories,
    articlesByCategory,
    isLoading,
    isError,
    refetchError,
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

  const searchErrorMessage = errorMessage(
    searchError,
    "Verifique sua conexão e tente novamente.",
  );

  function handleCreateArticle() {
    navigation.navigate("ArticleEditor");
  }

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="flex-1"
    >
      <Header />
      <View className="relative w-full flex-1">
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
                    {`Nenhum artigo encontrado para "${searchQuery}"`}
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
                refetchError={refetchError}
                onRetry={onRefresh}
              />
            )}
          </Wrapper>
        </ScrollView>

        {hydrated && user?.isAdmin && (
          <FloatingActionButton
            accessibilityLabel="Novo artigo"
            onPress={handleCreateArticle}
            icon={
              <PlusIcon
                size={24}
                weight="bold"
                color={colors.primaryForeground}
              />
            }
          />
        )}
      </View>
    </Wrapper>
  );
}
