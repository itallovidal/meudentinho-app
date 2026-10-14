import { ArticlePreviewDTO, ArticleCategory } from "@/types/dtos/article";
import { ArticleListRender } from "./articleListRender";
import { SkeletonArticleListRender } from "@/skeletons/components/skeletonArticleListRender";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import type { TabName } from "@/navigation/types";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";

type ArticleListSectionProps = {
  withCategories?: boolean;
  articles?: ArticlePreviewDTO[];
  latestArticle?: ArticlePreviewDTO;
  categories?: ArticleCategory[];
  articlesByCategory?: Record<string, ArticlePreviewDTO[]>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  fromTab?: TabName;
};

export function ArticleListSection({
  withCategories = false,
  articles = [],
  latestArticle,
  categories = [],
  articlesByCategory = {},
  isLoading = false,
  isError = false,
  onRetry,
  fromTab,
}: ArticleListSectionProps) {
  const navigation = useNavigation<TabNavigatorNavigationProp>();

  if (isLoading || isError) {
    return (
      <>
        {isError && (
          <Wrapper
            direction="column"
            align="center"
            justify="center"
            gap="gap-4"
            className="w-full py-8"
          >
            <Text className="text-center">
              Parece que estamos com problemas para carregar os artigos.
            </Text>
            {onRetry && (
              <Button onPress={onRetry}>
                <Text>Tentar novamente</Text>
              </Button>
            )}
          </Wrapper>
        )}
        <SkeletonArticleListRender showBanner={isError ? false : true} />
      </>
    );
  }

  return (
    <View className="w-full flex-1 gap-4">
      {fromTab === "Home" && (
        <Text variant={"h4"} className="mb-4">
          Dicas e Artigos
        </Text>
      )}
      <ArticleListRender
        latestArticle={latestArticle}
        articles={articles}
        categories={categories}
        articlesByCategory={articlesByCategory}
        hasCategories={withCategories}
        fromTab={fromTab}
      />
      {fromTab === "Home" && (
        <Button
          className="w-full"
          onPress={() => navigation.navigate("Articles")}
        >
          <Text>Ver mais artigos</Text>
        </Button>
      )}
    </View>
  );
}
