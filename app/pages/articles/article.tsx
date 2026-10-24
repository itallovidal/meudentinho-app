import { ArticleContent } from "@/components/article/articleContent";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { ErrorState } from "@/components/errorState";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { FloatingActionButton } from "@/components/ui/floatingActionButton";
import { getArticleById } from "@/api/article/getArticleById";
import { UserContext } from "@/contexts/UserContext";
import { THEME } from "@/lib/theme";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type {
  ArticlesNavigationProp,
  ArticlesStackParamList,
} from "@/navigation/ArticlesStack";
import { RefreshControl, ScrollView, View } from "react-native";
import { PencilSimpleIcon } from "phosphor-react-native";
import { useQuery } from "@tanstack/react-query";
import { retryQuery } from "@/lib/queryRetry";
import { isApiError } from "@/types/predicates";
import { SkeletonArticlePage } from "@/skeletons/pages/skeletonArticlePage";
import { useContext } from "react";

type ArticleRouteProp = RouteProp<ArticlesStackParamList, "Article">;

export function Article() {
  const route = useRoute<ArticleRouteProp>();
  const navigation = useNavigation<ArticlesNavigationProp>();
  const { user, hydrated } = useContext(UserContext)!;
  const colors = THEME.light;
  const id = route.params?.id ?? "";

  const {
    data: article,
    isPending,
    isFetching,
    isLoadingError,
    isRefetchError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["article", id],
    queryFn: () => getArticleById(id).then((res) => res.data),
    enabled: id.length > 0,
    retry: retryQuery,
    staleTime: 1000 * 60 * 5,
  });

  const articleNotFound =
    isApiError(error) && error.code === "ARTICLES_NOT_FOUND";

  function handleRefresh(): void {
    void refetch();
  }

  function handleEditArticle(): void {
    if (!article) {
      return;
    }
    navigation.navigate("ArticleEditor", { articleId: article.id });
  }

  if (!id) {
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
            onRetry={handleRefresh}
          />
        </Wrapper>
      </Wrapper>
    );
  }

  if (articleNotFound && !article) {
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
            title="Artigo não encontrado"
            message="Este artigo foi removido ou não está mais disponível."
            retryLabel="Voltar"
            onRetry={() => navigation.goBack()}
          />
        </Wrapper>
      </Wrapper>
    );
  }

  if (isLoadingError) {
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
            onRetry={handleRefresh}
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

      <View className="relative w-full flex-1">
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
            {isRefetchError && (
              <QueryWarningBanner
                message={
                  articleNotFound
                    ? "Este artigo não está mais disponível. Mostrando a última versão carregada."
                    : "Não foi possível atualizar o artigo. Mostrando a versão carregada anteriormente."
                }
                onRetry={handleRefresh}
              />
            )}

            <ArticleContent
              title={article.title}
              categories={article.categories}
              readingTime={article.readingTime}
              imageCoverURL={article.imageCoverURL}
              content={article.content}
            />
          </Wrapper>
        </ScrollView>

        {hydrated && user?.isAdmin && (
          <FloatingActionButton
            accessibilityLabel="Editar artigo"
            onPress={handleEditArticle}
            icon={
              <PencilSimpleIcon
                size={24}
                weight="bold"
                color={colors.primaryForeground}
              />
            }
          />
        )}
      </View>
    </Wrapper>
  );
}
