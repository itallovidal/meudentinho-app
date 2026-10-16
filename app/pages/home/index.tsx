import { useContext, useState } from "react";
import { ApiError } from "@/types/domain";
import { Alert, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { UserContext } from "@/contexts/UserContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArticleListSection } from "@/components/article/articleListSection";
import { RefreshControl } from "react-native-gesture-handler";
import { useArticles } from "@/hooks/useArticles";
import { useKids } from "@/hooks/useKids";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { KidRequestDTO } from "@/types/dtos/user";
import { KidFormValues } from "@/lib/schemas/kid";
import { buildKidRequest } from "@/lib/privacyPolicy";
import { RegisterKidSection } from "@/components/home/registerKidSection";
import { useToast } from "@/components/ui/toast";
import { createKid } from "@/api/kids/createKid";

const HOME_VISIBLE_ARTICLES = 2;

export function Home() {
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [registerKidError, setRegisterKidError] = useState<ApiError | null>(
    null,
  );
  const { authToken, hydrated } = useContext(UserContext)!;
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    isRefreshing,
    onRefresh,
    articles,
    latestArticle,
    categories,
    articlesByCategory,
    isLoading,
    isError,
  } = useArticles({ withCategories: false });

  const { kids, isLoading: kidsPending, failure: kidsFailure, refetch: refetchKids, isRefreshing: kidsRefreshing } =
    useKids(authToken);

  const showOnboarding =
    hydrated &&
    !!authToken &&
    !kidsPending &&
    !kidsFailure &&
    kids.length === 0;

  const showKidsError =
    hydrated && !!authToken && !kidsPending && kidsFailure !== null;

  const createKidMutation = useMutation({
    mutationFn: (kidDTO: KidRequestDTO) => createKid(kidDTO, authToken ?? ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kids"] }),
  });

  async function onRegisterKid(kidDTO: KidFormValues) {
    if (createKidMutation.isPending) {
      return;
    }
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      await createKidMutation.mutateAsync(buildKidRequest(kidDTO));

      setRegisterKidError(null);
      showToast("Dependente cadastrado com sucesso.");
    } catch (error) {
      if (error instanceof ApiError) {
        setRegisterKidError(error);
        return;
      }
      setRegisterKidError(
        new ApiError(
          "Não foi possível cadastrar o dependente. Verifique sua conexão e tente novamente.",
          "INTERNAL_SERVER_ERROR",
        ),
      );
    }
  }

  async function handleRefresh() {
    await Promise.all([onRefresh(), refetchKids()]);
  }

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="flex-1"
    >
      <Header />
      <ScrollView
        className="w-full flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || kidsRefreshing}
            onRefresh={() => void handleRefresh()}
          />
        }
      >
        <Wrapper
          className="mx-6 mb-4 mt-2 flex-1"
          direction="column"
          align="start"
          justify="start"
          gap="gap-4"
        >
          {hydrated && showOnboarding && (
            <RegisterKidSection
              onRegisterKid={onRegisterKid}
              registerKidError={registerKidError}
              isPending={createKidMutation.isPending}
            />
          )}

          {hydrated && showKidsError && (
            <Wrapper
              direction="column"
              gap="gap-2"
              className="mt-4 w-full rounded-xl bg-base-100 p-5"
            >
              <Text variant="h4" className="mb-0">
                {kidsFailure === "auth"
                  ? "Sessão expirada"
                  : "Não foi possível carregar"}
              </Text>
              <Text className="text-muted">
                {kidsFailure === "auth"
                  ? "Faça login novamente para cadastrar o dependente."
                  : "Verifique sua conexão e tente novamente."}
              </Text>
              {kidsFailure !== "auth" && (
                <Button
                  className="mt-2 w-full"
                  onPress={() => void refetchKids()}
                >
                  <Text>Tentar novamente</Text>
                </Button>
              )}
            </Wrapper>
          )}

          {hydrated && !authToken && (
            <Wrapper direction="column" gap="gap-1" className="mb-2 mt-4">
              <Text variant="h2" className="mb-0">
                Bem-vindo!
              </Text>
              <Text className="text-muted">
                Acompanhe a saúde bucal do seu filho.
              </Text>
            </Wrapper>
          )}

          <Wrapper
            direction="column"
            align="start"
            justify="start"
            className="w-full"
          >
            <ArticleListSection
              articles={articles.slice(0, HOME_VISIBLE_ARTICLES)}
              latestArticle={latestArticle}
              categories={categories}
              articlesByCategory={articlesByCategory}
              isLoading={isLoading}
              isError={isError}
              onRetry={onRefresh}
              fromTab="Home"
            />
          </Wrapper>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
