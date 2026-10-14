import { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import { ArticleBanner } from "./articleBanner";
import { ArticleCard } from "./articleCard";
import { Wrapper } from "../wrapper";
import { Text } from "../ui/text";
import { PropsBadge } from "../propsBadge";
import { useEffect, useState } from "react";
import type { TabName } from "@/navigation/types";

type ArticleListRenderProps = {
  latestArticle?: ArticlePreviewDTO;
  articles: ArticlePreviewDTO[];
  categories?: ArticleCategory[];
  articlesByCategory?: Record<string, ArticlePreviewDTO[]>;
  hasCategories?: boolean;
  fromTab?: TabName;
};

/**
 * Regra de negócio (fonte: `useArticles`): o artigo mais recente
 * (`latestArticle`, `articles[0]` da API) é exibido em destaque no
 * `ArticleBanner` e é EXCLUÍDO das listas por categoria — `articles` e
 * `articlesByCategory` já vêm sem ele (`articles.slice(1)`). Não
 * re-incluir o latest nas categorias aqui.
 */
export function ArticleListRender({
  latestArticle,
  articles,
  categories = [],
  articlesByCategory = {},
  hasCategories = false,
  fromTab,
}: ArticleListRenderProps) {
  const ALL_CATEGORY_ID = "all";
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID);

  useEffect(() => {
    if (selectedCategoryId === ALL_CATEGORY_ID) return;

    const hasSelectedCategory = categories.some(
      (category) => category.id === selectedCategoryId,
    );

    if (!hasSelectedCategory) {
      setSelectedCategoryId(ALL_CATEGORY_ID);
    }
  }, [categories, selectedCategoryId]);

  function handleCategoryPress(category: ArticleCategory) {
    setSelectedCategoryId(category.id);
  }

  const categoriesWithAll = [
    {
      id: ALL_CATEGORY_ID,
      name: "Todos",
      isSelected: selectedCategoryId === ALL_CATEGORY_ID,
    },
    ...categories.map((category) => ({
      ...category,
      isSelected: category.id === selectedCategoryId,
    })),
  ];

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const isAllSelected = selectedCategoryId === ALL_CATEGORY_ID;
  const visibleCategories =
    isAllSelected || !selectedCategory ? categories : [selectedCategory];

  const hasAnyContent = Boolean(latestArticle) || articles.length > 0;

  if (!hasAnyContent) {
    return (
      <Wrapper
        direction="column"
        align="center"
        justify="center"
        gap="gap-2"
        className="w-full py-8"
      >
        <Text className="text-center">Nenhum artigo</Text>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      gap={hasCategories ? "gap-0" : "gap-2"}
    >
      {latestArticle && (
        <ArticleBanner
          key={latestArticle.id}
          title={latestArticle.title}
          readingTime={latestArticle.readingTime}
          imageSrc={latestArticle.imageCoverURL}
          id={latestArticle.id}
          fromTab={fromTab}
        />
      )}

      {hasCategories && (
        <PropsBadge
          props={categoriesWithAll}
          onPress={handleCategoryPress}
          className="my-4"
        />
      )}

      {hasCategories
        ? visibleCategories.map((category) => {
            const categoryArticles = articlesByCategory[category.name];
            if (!categoryArticles || categoryArticles.length === 0) {
              return null;
            }

            return (
              <Wrapper
                key={category.id}
                direction="column"
                align="start"
                justify="start"
                gap="gap-2"
              >
                <Text variant="h3" className="mt-2">
                  {category.name}
                </Text>

                {categoryArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    title={article.title}
                    categories={article.categories}
                    readingTime={article.readingTime}
                    imageCoverURL={article.imageCoverURL}
                    id={article.id}
                    fromTab={fromTab}
                  />
                ))}
              </Wrapper>
            );
          })
        : articles.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              categories={article.categories}
              readingTime={article.readingTime}
              imageCoverURL={article.imageCoverURL}
              id={article.id}
              fromTab={fromTab}
            />
          ))}
    </Wrapper>
  );
}
