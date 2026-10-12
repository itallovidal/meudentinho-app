import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { getArticleById } from "@/api/article/getArticleById";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { Badge } from "@/components/ui/badge";
import { Image, ScrollView, View } from "react-native";
import { Markdown } from "react-native-remark";
import { ClockIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { Article as ArticleDomain } from "@/types/domain";
import { SkeletonArticlePage } from "@/skeletons/pages/skeletonArticlePage";

type ArticleRouteProp = RouteProp<ArticlesStackParamList, "Article">;

const MAX_LOAD_ATTEMPTS = 3;

export function Article() {
  const route = useRoute<ArticleRouteProp>();
  const id = route.params?.id ?? "";
  const [article, setArticle] = useState<ArticleDomain | null>(null);
  const [loadError, setLoadError] = useState(false);

  const categories = article?.categories.join(", ") ?? "";

  useFocusEffect(
    useCallback(() => {
      setArticle(null);
      setLoadError(false);
      void loadArticle(MAX_LOAD_ATTEMPTS);
    }, [id]),
  );

  async function loadArticle(triesLeft: number): Promise<void> {
    try {
      const { data } = await getArticleById(id);
      setArticle(data);
    } catch {
      if (triesLeft > 1) {
        await loadArticle(triesLeft - 1);
      } else {
        setLoadError(true);
      }
    }
  }

  function handleRetry(): void {
    setLoadError(false);
    void loadArticle(MAX_LOAD_ATTEMPTS);
  }

  if (loadError) {
    return (
      <Wrapper
        className="flex-1 bg-base-100"
        direction="column"
        align="start"
        justify="start"
        gap="gap-0"
      >
        <Header hasBackButton />

        <Wrapper
          className="flex-1 px-6"
          direction="column"
          align="center"
          justify="center"
          gap="gap-4"
        >
          <Text className="text-center">
            Não foi possível carregar o artigo. Verifique sua conexão.
          </Text>
          <Button onPress={handleRetry}>
            <Text>Tentar novamente</Text>
          </Button>
        </Wrapper>
      </Wrapper>
    );
  }

  if (!article) {
    return <SkeletonArticlePage />;
  }

  return (
    <Wrapper
      className="flex-1 bg-base-100"
      direction="column"
      align="start"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />

      <ScrollView>
        <Wrapper
          className="mx-6 flex-1 bg-base-100"
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
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
              className="h-56 w-full rounded-2xl bg-base-200"
            />

            <Markdown markdown={article.content} />
          </Wrapper>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
