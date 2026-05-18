import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ArticleCategory, ArticlePreviewDTO } from "@/types/dtos/article";
import { getAllCategories } from "@/api/article/getAllCategories";
import { getAllArticlePreview } from "@/api/article/getArticles";

const PULLING_INTERVAL = 5000;

type UseArticlesOptions = {
  withCategories?: boolean;
};

export function useArticles(options: UseArticlesOptions = {}) {
  const { withCategories = true } = options;

  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [articles, setArticles] = useState<ArticlePreviewDTO[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const articleTimeout = useRef(0);
  const isScreenFocused = useRef(false);
  const dataLoaded = useRef(false);

  const articlesByCategory = useMemo(() => {
    if (!withCategories) return {};

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
  }, [articles, categories, withCategories]);

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
    if (dataLoaded.current) return;

    try {
      const fetches: Promise<void>[] = [loadArticles()];
      if (withCategories) {
        fetches.push(loadCategories());
      }
      await Promise.all(fetches);
      dataLoaded.current = true;
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
      const fetches: Promise<void>[] = [loadArticles()];
      if (withCategories) {
        fetches.push(loadCategories());
      }
      await Promise.all(fetches);
      dataLoaded.current = true;
    } catch (error) {
      console.log("Erro ao recarregar dados:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function loadCategories() {
    const { data } = await getAllCategories();
    console.log("Fetched categories");

    setCategories(
      data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        isSelected: false,
      })),
    );
  }

  async function loadArticles() {
    // console.log("Loading articles");
    const { data } = await getAllArticlePreview();
    console.log("Fetched articles");
    setArticles(data);
  }

  const latestArticle = articles.at(0);
  const isLoading = !articles.length || (withCategories && !categories.length);

  return {
    articles: articles.slice(1),
    categories,
    articlesByCategory,
    latestArticle,
    isLoading,
    isRefreshing,
    onRefresh,
  };
}
