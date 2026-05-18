import { useArticles } from "@/hooks/useArticles";
import { ArticleListRender } from "./articleListRender";
import { SkeletonArticleListRender } from "@/skeletons/components/skeletonArticleListRender";

export function ArticleListSection({
  withCategories = false,
}: {
  withCategories?: boolean;
}) {
  const {
    articles,
    latestArticle,
    categories,
    isLoading,
    articlesByCategory,
  } = useArticles({
    withCategories,
  });

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
