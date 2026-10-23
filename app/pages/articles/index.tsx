import {
  type ComponentRef,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { useArticlesFeed } from "@/hooks/useArticlesFeed";
import { useArticleSearch } from "@/hooks/useArticleSearch";
import { errorMessage } from "@/lib/errorMessage";
import { ArticleListSection } from "@/components/article/articleListSection";
import { ArticleCategoriesFeed } from "@/components/article/articleCategoriesFeed";
import { SearchInput } from "@/components/searchinput";
import { ErrorState } from "@/components/errorState";
import { Text } from "@/components/ui/text";
import { FloatingActionButton } from "@/components/ui/floatingActionButton";
import { UserContext } from "@/contexts/UserContext";
import { THEME } from "@/lib/theme";
import { ArticlesNavigationProp } from "@/navigation/ArticlesStack";
import { useNavigation } from "@react-navigation/native";
import { PlusIcon } from "phosphor-react-native";

const LOAD_MORE_THRESHOLD = 200;

export function Index() {
  const navigation = useNavigation<ArticlesNavigationProp>();
  const { user, hydrated } = useContext(UserContext)!;
  const colors = THEME.light;
  const {
    latestArticle,
    categories,
    selectedCategory,
    selectCategory,
    previews,
    feed,
    isLoading,
    isError,
    isRefreshing,
    refetchError,
    onRefresh,
  } = useArticlesFeed();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
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

  function loadMore() {
    if (isSearchActive) {
      return;
    }
    feed.fetchNextPage();
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - LOAD_MORE_THRESHOLD
    ) {
      loadMore();
    }
  }

  function handleSelectCategory(categoryId: string) {
    selectCategory(categoryId);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

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
          ref={scrollRef}
          className="w-full flex-1"
          onLayout={(event) =>
            setViewportHeight(event.nativeEvent.layout.height)
          }
          onContentSizeChange={(_, height) => {
            if (
              !isSearchActive &&
              viewportHeight > 0 &&
              height <= viewportHeight
            ) {
              loadMore();
            }
          }}
          onScroll={handleScroll}
          scrollEventThrottle={200}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing && !isLoading}
              onRefresh={() => void onRefresh()}
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
                  <ArticleListSection articles={searchResults} />
                )}
              </>
            )}

            {!isSearching && !isSearchActive && (
              <ArticleCategoriesFeed
                latestArticle={latestArticle}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                previews={previews}
                feed={feed}
                isLoading={isLoading}
                isError={isError}
                refetchError={refetchError}
                onRetry={() => void onRefresh()}
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
