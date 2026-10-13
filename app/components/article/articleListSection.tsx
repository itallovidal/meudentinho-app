import { ArticlePreviewDTO, ArticleCategory } from "@/types/dtos/article";
import { ArticleListRender } from "./articleListRender";
import { SkeletonArticleListRender } from "@/skeletons/components/skeletonArticleListRender";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import type { TabName } from "@/navigation/types";

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
  if (isLoading) {
    return <SkeletonArticleListRender />;
  }

  if (isError) {
    return (
      <Wrapper
        direction="column"
        align="center"
        justify="center"
        gap="gap-4"
        className="w-full py-8"
      >
        <Text className="text-center">
          Não foi possível carregar os artigos. Verifique sua conexão.
        </Text>
        {onRetry && (
          <Button onPress={onRetry}>
            <Text>Tentar novamente</Text>
          </Button>
        )}
      </Wrapper>
    );
  }

  return (
    <ArticleListRender
      latestArticle={latestArticle}
      articles={articles}
      categories={categories}
      articlesByCategory={articlesByCategory}
      hasCategories={withCategories}
      fromTab={fromTab}
    />
  );
}
