import { ScrollView, RefreshControl } from "react-native";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { useArticles } from "@/hooks/useArticles";
import { ArticleListSection } from "@/components/article/articleListSection";

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
          <ArticleListSection
            withCategories
            articles={articles}
            latestArticle={latestArticle}
            categories={categories}
            articlesByCategory={articlesByCategory}
            isLoading={isLoading}
          />
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
