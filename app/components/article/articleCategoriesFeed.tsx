import { ActivityIndicator, View } from "react-native";
import { CaretDownIcon } from "phosphor-react-native";
import type { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import type {
  ArticleCategoryPreview,
  ArticleFeedState,
} from "@/hooks/useArticlesFeed";
import { ArticleBanner } from "./articleBanner";
import { ArticleCard } from "./articleCard";
import { PropsBadge } from "../propsBadge";
import { Wrapper } from "../wrapper";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { ErrorState } from "../errorState";
import { QueryWarningBanner } from "../queryWarningBanner";
import { SkeletonArticleListRender } from "@/skeletons/components/skeletonArticleListRender";
import { SkeletonArticleCard } from "@/skeletons/components/skeletonArticleCard";
import { THEME } from "@/lib/theme";

const ALL_CATEGORY_ID = "all";

type ArticleCategoriesFeedProps = {
  latestArticle?: ArticlePreviewDTO;
  categories: ArticleCategory[];
  selectedCategory?: ArticleCategory;
  onSelectCategory: (categoryId: string) => void;
  previews: ArticleCategoryPreview[];
  feed: ArticleFeedState;
  isLoading: boolean;
  isError: boolean;
  refetchError: boolean;
  onRetry: () => void;
};

function ArticleCardList({ articles }: { articles: ArticlePreviewDTO[] }) {
  return (
    <View className="w-full gap-2">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          title={article.title}
          categories={article.categories}
          readingTime={article.readingTime}
          imageCoverURL={article.imageCoverURL}
          id={article.id}
        />
      ))}
    </View>
  );
}

function CategoryPreviewSection({
  preview,
  onShowMore,
}: {
  preview: ArticleCategoryPreview;
  onShowMore: () => void;
}) {
  if (!preview.isLoading && !preview.isError && preview.articles.length === 0) {
    return null;
  }

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      gap="gap-2"
      className="w-full"
    >
      <Text variant="h3" className="mt-2">
        {preview.category.name}
      </Text>

      {preview.isLoading && preview.articles.length === 0 && (
        <View className="w-full gap-2">
          <SkeletonArticleCard />
          <SkeletonArticleCard />
        </View>
      )}

      {preview.isError && preview.articles.length === 0 && (
        <Wrapper
          direction="row"
          align="center"
          justify="between"
          gap="gap-3"
          className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3"
        >
          <Text className="flex-1 text-sm text-base-600">
            Não foi possível carregar esta categoria.
          </Text>
          <Button variant="ghost" size="sm" onPress={preview.refetch}>
            <Text className="text-sm font-bold text-primary-500">
              Tentar novamente
            </Text>
          </Button>
        </Wrapper>
      )}

      {preview.articles.length > 0 && (
        <View className="w-full gap-2">
          <ArticleCardList articles={preview.articles} />
          {preview.articles.length > 0 && (
            <Wrapper
              direction="row"
              align="center"
              justify="center"
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 4,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onPress={onShowMore}
                accessibilityLabel={`Ver mais artigos de ${preview.category.name}`}
              >
                <Text className="text-sm font-bold text-primary-500">
                  Ver mais
                </Text>
                <CaretDownIcon
                  size={16}
                  color={THEME.light.primary500}
                  weight="bold"
                />
              </Button>
            </Wrapper>
          )}
        </View>
      )}
    </Wrapper>
  );
}

function CategoryFeedFooter({ feed }: { feed: ArticleFeedState }) {
  if (feed.isFetchNextPageError) {
    return (
      <View className="w-full items-center py-2">
        <Button variant="outline" size="sm" onPress={feed.fetchNextPage}>
          <Text className="text-sm font-bold text-primary-500">
            Tentar novamente
          </Text>
        </Button>
      </View>
    );
  }

  if (feed.isFetchingNextPage) {
    return (
      <View className="w-full items-center py-2">
        <ActivityIndicator size="small" color={THEME.light.primary500} />
      </View>
    );
  }

  if (!feed.hasNextPage && feed.articles.length > 0) {
    return (
      <Text className="w-full py-2 text-center text-sm text-base-500">
        Você chegou ao fim dos artigos
      </Text>
    );
  }

  return null;
}

export function ArticleCategoriesFeed({
  latestArticle,
  categories,
  selectedCategory,
  onSelectCategory,
  previews,
  feed,
  isLoading,
  isError,
  refetchError,
  onRetry,
}: ArticleCategoriesFeedProps) {
  if (isLoading) {
    return (
      <Wrapper
        direction="column"
        align="start"
        justify="start"
        gap="gap-4"
        className="w-full"
      >
        {latestArticle && (
          <ArticleBanner
            key={latestArticle.id}
            title={latestArticle.title}
            readingTime={latestArticle.readingTime}
            imageSrc={latestArticle.imageCoverURL}
            id={latestArticle.id}
          />
        )}
        <SkeletonArticleListRender showBanner={!latestArticle} />
      </Wrapper>
    );
  }

  if (isError) {
    return (
      <Wrapper
        direction="column"
        align="start"
        justify="start"
        gap="gap-4"
        className="w-full"
      >
        {latestArticle && (
          <ArticleBanner
            key={latestArticle.id}
            title={latestArticle.title}
            readingTime={latestArticle.readingTime}
            imageSrc={latestArticle.imageCoverURL}
            id={latestArticle.id}
          />
        )}
        <ErrorState
          message="Parece que estamos com problemas para carregar os artigos."
          onRetry={onRetry}
        />
      </Wrapper>
    );
  }

  const isAllSelected = !selectedCategory;
  const categoriesWithAll = [
    {
      id: ALL_CATEGORY_ID,
      name: "Todos",
      isSelected: isAllSelected,
    },
    ...categories,
  ];

  const hasAnyPreview = previews.some(
    (preview) => preview.articles.length > 0 || preview.isLoading,
  );

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      gap="gap-4"
      className="w-full"
    >
      {latestArticle && (
        <ArticleBanner
          key={latestArticle.id}
          title={latestArticle.title}
          readingTime={latestArticle.readingTime}
          imageSrc={latestArticle.imageCoverURL}
          id={latestArticle.id}
        />
      )}

      {categories.length > 0 && (
        <PropsBadge
          props={categoriesWithAll}
          onPress={(category) => onSelectCategory(category.id)}
        />
      )}

      {refetchError && (
        <QueryWarningBanner
          message="Não foi possível atualizar os artigos. Mostrando a lista carregada anteriormente."
          onRetry={onRetry}
        />
      )}

      {isAllSelected &&
        previews.map((preview) => (
          <CategoryPreviewSection
            key={preview.category.id}
            preview={preview}
            onShowMore={() => onSelectCategory(preview.category.id)}
          />
        ))}

      {isAllSelected && !hasAnyPreview && !latestArticle && (
        <Text className="w-full py-8 text-center text-base-500">
          Nenhum artigo disponível.
        </Text>
      )}

      {!isAllSelected && selectedCategory && (
        <Wrapper
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
          className="w-full"
        >
          <Text variant="h3" className="mt-2">
            {selectedCategory.name}
          </Text>

          {feed.isPending && (
            <View className="w-full gap-2">
              <SkeletonArticleCard />
              <SkeletonArticleCard />
              <SkeletonArticleCard />
            </View>
          )}

          {feed.isLoadingError && (
            <ErrorState
              title="Não foi possível carregar os artigos"
              message="Verifique sua conexão e tente novamente."
              onRetry={feed.refetch}
            />
          )}

          {!feed.isPending && !feed.isLoadingError && (
            <>
              {feed.articles.length > 0 ? (
                <View className="w-full gap-2">
                  {feed.isRefetchError && (
                    <QueryWarningBanner
                      message="Não foi possível atualizar os artigos. Mostrando a lista carregada anteriormente."
                      onRetry={feed.refetch}
                    />
                  )}
                  <ArticleCardList articles={feed.articles} />
                </View>
              ) : (
                <Text className="w-full py-8 text-center text-base-500">
                  Nenhum artigo nesta categoria.
                </Text>
              )}
              <CategoryFeedFooter feed={feed} />
            </>
          )}
        </Wrapper>
      )}
    </Wrapper>
  );
}
