import { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import { ArticleBanner } from "./articleBanner";
import { ArticleCard } from "./articleCard";
import { Wrapper } from "../wrapper";
import { Text } from "../ui/text";

type ArticleListRenderProps = {
  latestArticle?: ArticlePreviewDTO;
  articles: ArticlePreviewDTO[];
  categories?: ArticleCategory[];
  articlesByCategory?: Record<string, ArticlePreviewDTO[]>;
  hasCategoryTitle?: boolean;
};

export function ArticleListRender({
  latestArticle,
  articles,
  categories = [],
  articlesByCategory = {},
  hasCategoryTitle = false,
}: ArticleListRenderProps) {
  return (
    <>
      {latestArticle && (
        <ArticleBanner
          key={latestArticle.id}
          title={latestArticle.title}
          readingTime={latestArticle.readingTime}
          imageSrc={latestArticle.imageCoverURL}
          id={latestArticle.id}
        />
      )}

      {hasCategoryTitle
        ? categories.map((category) => {
            const categoryArticles = articlesByCategory[category.name];
            if (!categoryArticles || categoryArticles.length === 0) return null;

            return (
              <Wrapper
                key={category.id}
                direction="column"
                align="start"
                justify="start"
                gap="gap-3"
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
            />
          ))}
    </>
  );
}
