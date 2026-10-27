import type { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import { ArticleBanner } from "./articleBanner";
import { PropsBadge } from "../propsBadge";
import { View } from "react-native";
import { Text } from "../ui/text";
import { QueryWarningBanner } from "../queryWarningBanner";

type ArticleCategoriesFeedProps = {
  latestArticle?: ArticlePreviewDTO;
  categories: ArticleCategory[];
  selectedCategory?: ArticleCategory;
  onSelectCategory: (categoryId: string) => void;
  categoriesLoading: boolean;
  categoriesError: boolean;
  latestError: boolean;
  refetchError: boolean;
  onRetry: () => void;
};

export function ArticleCategoriesFeed({
  latestArticle,
  categories,
  selectedCategory,
  onSelectCategory,
  categoriesLoading,
  categoriesError,
  latestError,
  refetchError,
  onRetry,
}: ArticleCategoriesFeedProps) {
  return (
    <View className="w-full gap-4">
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
      {categoriesError && (
        <QueryWarningBanner
          message="Não foi possível atualizar as categorias. Você ainda pode consultar todos os artigos."
          onRetry={onRetry}
        />
      )}
      {(latestError || refetchError) && (
        <QueryWarningBanner
          message="Não foi possível atualizar todos os artigos. Tente novamente."
          onRetry={onRetry}
        />
      )}
      <Text variant="h3">{selectedCategory?.name ?? "Todos os artigos"}</Text>
    </View>
  );
}
