import type { ArticlePreviewDTO } from "@/types/dtos/article";
import { ArticleListRender } from "./articleListRender";
import { SkeletonArticleListRender } from "@/skeletons/components/skeletonArticleListRender";
import { ErrorState } from "../errorState";
import { QueryWarningBanner } from "../queryWarningBanner";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import type { TabName } from "@/navigation/types";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";

type ArticleListSectionProps = {
  articles?: ArticlePreviewDTO[];
  latestArticle?: ArticlePreviewDTO;
  isLoading?: boolean;
  isError?: boolean;
  refetchError?: boolean;
  hideError?: boolean;
  onRetry?: () => void;
  fromTab?: TabName;
};

export function ArticleListSection({
  articles = [],
  latestArticle,
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
      <View className="w-full gap-4">
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
        <SkeletonArticleListRender showBanner={!isError} />
      </View>
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
      {!latestArticle && articles.length === 0 && (
        <Text className="w-full py-8 text-center text-muted-foreground">
          Nenhum artigo disponível.
        </Text>
      )}
      <ArticleListRender
        latestArticle={latestArticle}
        articles={articles}
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
