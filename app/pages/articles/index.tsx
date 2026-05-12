import { ScrollView, RefreshControl } from "react-native";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { ArticleCard } from "@/components/articleCard";
import { Wrapper } from "@/components/wrapper";
// import { Input } from "@/components/ui/input";
// import { MagnifyingGlassIcon } from "phosphor-react-native";
// import { Badge } from "@/components/ui/badge";
import { ArticleBanner } from "@/components/articleBanner";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import { getAllCategories } from "@/api/article/getAllCategories";
import { getAllArticlePreview } from "@/api/article/getArticles";
import { SkeletonArticleCard } from "@/components/skeletons/skeletonArticleCard";
import { SkeletonArticleBanner } from "@/components/skeletons/skeletonArticleBanner";
import { useFocusEffect } from "@react-navigation/native";

const PULLING_INTERVAL = 5000;

export function Index() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articles, setArticles] = useState<ArticlePreviewDTO[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const articleTimeout = useRef(0);
  const isScreenFocused = useRef(false);

  const articlesByCategory = useMemo(() => {
    const map: Record<string, ArticlePreviewDTO[]> = {};

    categories.forEach((cat) => {
      map[cat.name] = [];
    });

    const [latest, ...list] = articles;

    list.forEach((article) => {
      if (map[article.categories]) {
        map[article.categories].push(article);
      }
    });

    return map;
  }, [articles, categories]);

  useFocusEffect(
    useCallback(() => {
      isScreenFocused.current = true;
      onLoad();

      return () => {
        isScreenFocused.current = false;
        if (articleTimeout.current) {
          console.log("Clearing articleList timeout");
          clearTimeout(articleTimeout.current);
          articleTimeout.current = 0;
        }
      };
    }, []),
  );

  async function onLoad() {
    if (!isScreenFocused.current) return;

    try {
      await Promise.all([loadCategories(), loadArticles()]);
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
      if (isScreenFocused.current) {
        const timeout = setTimeout(() => {
          onLoad();
        }, PULLING_INTERVAL);
        articleTimeout.current = timeout as unknown as number;
      }
    }
  }

  async function onRefresh() {
    setIsRefreshing(true);
    try {
      await Promise.all([loadCategories(), loadArticles()]);
    } catch (error) {
      console.log("Erro ao recarregar dados:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  // TODO: turn into a hook later?
  async function loadCategories() {
    const { data } = await getAllCategories();

    setCategories(
      data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        isSelected: false,
      })),
    );
  }

  async function loadArticles() {
    const { data } = await getAllArticlePreview();
    console.log("Articles fetched:", data);

    setArticles(data);
  }

  const latestArticle = articles.at(0);

  if (!articles.length || !categories.length) {
    return (
      <Wrapper
        direction="column"
        align="start"
        justify="start"
        className="bg-base-100 flex-1 w-full"
        gap="gap-2"
      >
        <Header />
        <ScrollView
          className="flex-1 w-full"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <Wrapper
            className="flex-1 px-6 py-4 bg-base-200"
            direction="column"
            align="start"
            justify="start"
            gap="gap-3"
          >
            <SkeletonArticleBanner />
            <SkeletonArticleCard />
            <SkeletonArticleCard />
            <SkeletonArticleCard />
          </Wrapper>
        </ScrollView>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="bg-base-100 flex-1 w-full"
    >
      <Header />
      <ScrollView
        className="flex-1 w-full"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <Wrapper
          className="flex-1 px-6 py-4 bg-base-200 "
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
        >
          {/* <Wrapper
            className="flex-1 relative w-full"
            direction="row"
            align="center"
          >
            <Input
              placeholder="Buscar artigos e guias"
              className="bg-base-100 rounded-lg"
            />
            <MagnifyingGlassIcon
              size={16}
              color="gray"
              weight="regular"
              style={{ position: "absolute", right: 16 }}
            />
          </Wrapper>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 -mx-6 px-6"
          >
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                className="bg-base-100 border border-base-300 px-4 py-2 rounded-lg mr-2"
                variant={"outline"}
              >
                <Text className="text-sm">{cat.name}</Text>
              </Badge>
            ))}
          </ScrollView> */}

          {latestArticle && (
            <ArticleBanner
              key={latestArticle.id}
              title={latestArticle.title}
              readingTime={latestArticle.readingTime}
              imageSrc={latestArticle.imageCoverURL}
              id={latestArticle.id}
            />
          )}

          {categories.map((category) => {
            return (
              articlesByCategory[category.name] &&
              articlesByCategory[category.name].length && (
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

                  {articlesByCategory[category.name].length > 0 &&
                    articlesByCategory[category.name].map((article) => (
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
              )
            );
          })}
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
