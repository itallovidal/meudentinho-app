import { useEffect, useState } from "react";
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
          {/* <Wrapper
            className="flex-1 relative w-full"
            direction="row"
            align="center"
          >
            <Input
              placeholder="Buscar artigos e guias"
              className="bg-base-100 rounded-lg"
            />
            <MagnifyingGlassIcon
              size={16}
              color="gray"
              weight="regular"
              style={{ position: "absolute", right: 16 }}
            />
          </Wrapper> */}

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
