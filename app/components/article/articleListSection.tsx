import { ArticlePreviewDTO, ArticleCategory } from "@/types/dtos/article";
import { ArticleListRender } from "./articleListRender";
import { SkeletonArticleListRender } from "@/skeletons/components/skeletonArticleListRender";

type ArticleListSectionProps = {
  withCategories?: boolean;
  articles?: ArticlePreviewDTO[];
  latestArticle?: ArticlePreviewDTO;
  categories?: ArticleCategory[];
  articlesByCategory?: Record<string, ArticlePreviewDTO[]>;
  isLoading?: boolean;
};

export function ArticleListSection({
  withCategories = false,
  articles = [],
  latestArticle,
  categories = [],
  articlesByCategory = {},
  isLoading = false,
}: ArticleListSectionProps) {
  if (isLoading) {
    return <SkeletonArticleListRender />;
  }

  return (
    <ArticleListRender
      latestArticle={latestArticle}
      articles={articles}
      categories={categories}
      articlesByCategory={articlesByCategory}
      hasCategoryTitle={withCategories}
    />
  );
}
