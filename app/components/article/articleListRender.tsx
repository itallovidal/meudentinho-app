import type { ArticlePreviewDTO } from "@/types/dtos/article";
import { ArticleBanner } from "./articleBanner";
import { ArticleCard } from "./articleCard";
import { Wrapper } from "../wrapper";
import type { TabName } from "@/navigation/types";

type ArticleListRenderProps = {
  latestArticle?: ArticlePreviewDTO;
  articles: ArticlePreviewDTO[];
  fromTab?: TabName;
};

export function ArticleListRender({
  latestArticle,
  articles,
  fromTab,
}: ArticleListRenderProps) {
  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      gap="gap-2"
      className="w-full"
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

      {articles.map((article) => (
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
