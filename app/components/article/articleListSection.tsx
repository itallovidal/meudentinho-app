import type { ArticlePreviewDTO, ArticleCategory } from "@/types/dtos/article";
import { ArticleListRender } from "./articleListRender";
import { SkeletonArticleListRender } from "@/skeletons/components/skeletonArticleListRender";
import { ErrorState } from "../errorState";
import { QueryWarningBanner } from "../queryWarningBanner";
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
  refetchError?: boolean;
  hideError?: boolean;
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
  refetchError = false,
  hideError = false,
  onRetry,
  fromTab,
}: ArticleListSectionProps) {
  const navigation = useNavigation<TabNavigatorNavigationProp>();

  if (isError && hideError) {
    return <SkeletonArticleListRender showBanner={false} />;
  }

  if (isLoading || isError) {
    return (
      <>
        {isError &&
          (onRetry ? (
            <ErrorState
              message="Parece que estamos com problemas para carregar os artigos."
              onRetry={() => onRetry()}
            />
          ) : (
            <Text className="w-full py-8 text-center">
              Parece que estamos com problemas para carregar os artigos.
            </Text>
          ))}
        <SkeletonArticleListRender showBanner={isError ? false : true} />
      </>
    );
  }

  return (
    <View className="w-full gap-4">
      {refetchError && onRetry && (
        <QueryWarningBanner
          message="Não foi possível atualizar os artigos. Mostrando a lista carregada anteriormente."
          onRetry={() => onRetry()}
        />
      )}
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
          onPress={() =>
            navigation.navigate("Articles", {
              screen: "ArticlesList",
              pop: true,
            })
          }
        >
          <Text>Ver mais artigos</Text>
        </Button>
      )}
    </View>
  );
}
