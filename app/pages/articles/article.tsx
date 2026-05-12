import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { getArticleById } from "@/api/article/getArticleById";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { Badge } from "@/components/ui/badge";
import { Image, ScrollView, View } from "react-native";
import { Markdown } from "react-native-remark";
import { ClockIcon } from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Article as ArticleDomain } from "@/types/domain";
import { SkeletonImage } from "@/components/skeletons/skeletonImage";
import { SkeletonText } from "@/components/skeletons/skeletonText";
import { Skeleton } from "@/components/ui/skeleton";

type ArticleRouteProp = RouteProp<ArticlesStackParamList, "Article">;

const PULLING_INTERVAL = 5000;

// TOOD: change this name later, it's conflicting with the domain Article type, maybe ArticlePage or something like that
export function Article() {
  const route = useRoute<ArticleRouteProp>();
  const id = route.params?.id ?? "";
  const [article, setArticle] = useState<ArticleDomain | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const articleTimeout = useRef(0);
  const isScreenFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isScreenFocused.current = true;
      loadArticle();

      return () => {
        isScreenFocused.current = false;
        if (articleTimeout.current) {
          console.log(
            "Clearing article timeout with id:",
            articleTimeout.current,
          );
          clearTimeout(articleTimeout.current);
          articleTimeout.current = 0;
        }
      };
    }, [id]),
  );

  async function loadArticle() {
    if (!isScreenFocused.current) return;

    setIsLoading(true);
    try {
      const { data } = await getArticleById(id);
      setArticle(data);
    } catch (error) {
      console.log("Erro ao carregar artigo:", error);
      if (isScreenFocused.current) {
        const timeout = setTimeout(() => {
          loadArticle();
        }, PULLING_INTERVAL);
        articleTimeout.current = timeout as unknown as number;
      }
    } finally {
      if (isScreenFocused.current) {
        setIsLoading(false);
      }
    }
  }

  const categories = article?.categories.join(", ") ?? "";

  if (!article) {
    return (
      <Wrapper
        className="bg-base-100 flex-1"
        direction="column"
        align="center"
        justify="start"
        gap="gap-2"
      >
        <Header hasBackButton />

        <Wrapper
          className="bg-base-100 flex-1 mx-8"
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
        >
          <Wrapper
            className="flex-1 w-full h-24 my-4"
            direction="row"
            align="center"
            gap="gap-2"
          >
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </Wrapper>

          <SkeletonImage size="lg" />
          <SkeletonText variant="h1" />
          <SkeletonText variant="p" />
          <SkeletonText variant="p" />
          <SkeletonText variant="p" />
          <SkeletonText variant="p" />
          <SkeletonText variant="large" />
          <SkeletonText variant="default" />
          <SkeletonText variant="h1" />
          <SkeletonText variant="p" />
          <SkeletonText variant="p" />
          <SkeletonText variant="p" />
          <SkeletonText variant="large" />
          <SkeletonText variant="default" />
        </Wrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      className="bg-base-100 flex-1"
      direction="column"
      align="start"
      justify="start"
    >
      <Header hasBackButton />

      <ScrollView>
        <Wrapper
          className="bg-base-100 flex-1 mx-8"
          direction="column"
          align="start"
          justify="start"
        >
          <Wrapper direction="row" align="center" gap="gap-4">
            <Badge variant="secondary" className="">
              <Text>{categories}</Text>
            </Badge>
            <Wrapper direction="row" align="center" gap="gap-1">
              <ClockIcon size={16} color="gray" weight="regular" />
              <Text variant="small" className="text-base-500">
                {article.readingTime} min de leitura
              </Text>
            </Wrapper>
          </Wrapper>

          <Wrapper
            className="my-4 w-full"
            direction="column"
            align="center"
            justify="start"
            gap="gap-4"
          >
            <Image
              src={article.imageCoverURL}
              className="w-full h-56 rounded-2xl bg-base-200"
            />

            <Markdown markdown={article.content} />
          </Wrapper>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
