import type { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import { SkeletonArticleBanner } from "@/skeletons/components/skeletonArticleBanner";
import { ArticleBanner } from "./articleBanner";
import { PropsBadge } from "../propsBadge";
import { View } from "react-native";
import { Text } from "../ui/text";
import { QueryWarningBanner } from "../queryWarningBanner";

type ArticleCategoriesFeedProps = {
  latestArticle?: ArticlePreviewDTO;
  latestLoading: boolean;
  categories: ArticleCategory[];
  selectedCategory?: ArticleCategory;
  onSelectCategory: (categoryId: string) => void;
  categoriesLoading: boolean;
  categoriesError: boolean;
  latestError: boolean;
  refetchError: boolean;
  hideWarnings?: boolean;
  onRetry: () => void;
};

export function ArticleCategoriesFeed({
  latestArticle,
  latestLoading,
  categories,
  selectedCategory,
  onSelectCategory,
  categoriesLoading,
  categoriesError,
  latestError,
  refetchError,
  hideWarnings = false,
  onRetry,
}: ArticleCategoriesFeedProps) {
  const warningMessage = hideWarnings
    ? null
    : latestError || refetchError
      ? "Não foi possível atualizar todos os artigos. Tente novamente."
      : categoriesError
        ? "Não foi possível atualizar as categorias. Você ainda pode consultar todos os artigos."
        : null;

  return (
    <View className="w-full gap-4">
      {latestLoading && !latestArticle && <SkeletonArticleBanner />}
      {latestArticle && (
        <ArticleBanner
          title={latestArticle.title}
          readingTime={latestArticle.readingTime}
          imageSrc={latestArticle.imageCoverURL}
          id={latestArticle.id}
        />
      )}
      <PropsBadge
        props={[
          { id: "all", name: "Todos", isSelected: !selectedCategory },
          ...categories,
        ]}
        isLoading={categoriesLoading}
        onPress={(category) => onSelectCategory(category.id)}
      />
      {warningMessage && (
        <QueryWarningBanner message={warningMessage} onRetry={onRetry} />
      )}
      <Text variant="h3">{selectedCategory?.name ?? "Todos os artigos"}</Text>
    </View>
  );
}
