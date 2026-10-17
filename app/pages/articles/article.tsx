import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { ErrorState } from "@/components/errorState";
import { Text } from "@/components/ui/text";
import { getArticleById } from "@/api/article/getArticleById";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { Badge } from "@/components/ui/badge";
import { Image, RefreshControl, ScrollView } from "react-native";
import { Markdown } from "react-native-remark";
import { ClockIcon } from "phosphor-react-native";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { SkeletonArticlePage } from "@/skeletons/pages/skeletonArticlePage";

type ArticleRouteProp = RouteProp<ArticlesStackParamList, "Article">;

const ARTICLE_RETRY_COUNT = 3;
const MAX_RETRY_DELAY_MS = 5000;

export function Article() {
  const route = useRoute<ArticleRouteProp>();
  const id = route.params?.id ?? "";

  const {
    data: article,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["article", id],
    queryFn: () => getArticleById(id).then((res) => res.data),
    enabled: id.length > 0,
    retry: ARTICLE_RETRY_COUNT,
    retryDelay: (attemptIndex) =>
      Math.min(500 * 2 ** attemptIndex, MAX_RETRY_DELAY_MS),
    staleTime: 1000 * 60 * 5,
  });

  const categories = article?.categories.join(", ") ?? "";

  useFocusEffect(
    useCallback(() => {
      if (id.length > 0) {
        void refetch();
      }
    }, [id, refetch]),
  );

  function handleRetry(): void {
    void refetch();
  }

  function handleRefresh(): void {
    void refetch();
  }

  if (!id || isError) {
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
          <ErrorState
            title="Não foi possível carregar o artigo"
            message="Verifique sua conexão e tente novamente."
            onRetry={handleRetry}
          />
        </Wrapper>
      </Wrapper>
    );
  }

  if (isPending || !article) {
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

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isPending}
            onRefresh={handleRefresh}
          />
        }
      >
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
              source={{ uri: article.imageCoverURL }}
              className="h-56 w-full rounded-2xl bg-base-200"
            />

            <Markdown markdown={article.content} />
          </Wrapper>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
