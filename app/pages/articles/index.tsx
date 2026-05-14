import { ScrollView, RefreshControl } from "react-native";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { useArticles } from "@/hooks/useArticles";
import { ArticleListRender } from "@/components/articleListRender";
import { SkeletonArticleListPage } from "@/skeletons/pages/skeletonArticleListPage";
// import { Text } from "@/components/ui/text";
// import { Input } from "@/components/ui/input";
// import { MagnifyingGlassIcon } from "phosphor-react-native";
// import { Badge } from "@/components/ui/badge";

export function Index() {
  const {
    articles,
    categories,
    articlesByCategory,
    latestArticle,
    isLoading,
    isRefreshing,
    onRefresh,
  } = useArticles({ withCategories: true });
  console.log(articlesByCategory);

  if (isLoading) {
    return (
      <SkeletonArticleListPage
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }

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
          </Wrapper>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 -mx-6 px-6"
          >
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                className="bg-base-100 border border-base-300 px-4 py-2 rounded-lg mr-2"
                variant={"outline"}
              >
                <Text className="text-sm">{cat.name}</Text>
              </Badge>
            ))}
          </ScrollView> */}

          <ArticleListRender
            latestArticle={latestArticle}
            articles={articles.slice(1)}
            categories={categories}
            articlesByCategory={articlesByCategory}
            hasCategoryTitle={true}
          />
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
