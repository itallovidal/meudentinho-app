import { useContext, useState } from "react";
import { ApiError } from "@/types/domain";
import { Alert, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { UserContext } from "@/contexts/UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArticleListSection } from "@/components/article/articleListSection";
import { RefreshControl } from "react-native-gesture-handler";
import { useArticles } from "@/hooks/useArticles";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { KidRequestDTO } from "@/types/dtos/user";
import { RegisterKidSection } from "@/components/home/registerKidSection";
import { useToast } from "@/components/ui/toast";
import { getAllKids } from "@/api/kids/getAllKids";
import { createKid } from "@/api/kids/createKid";

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

  const { data: kidsResponse, isPending: kidsPending } = useQuery({
    queryKey: ["kids", authToken],
    queryFn: () => getAllKids(authToken!),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
  });

  const kids = kidsResponse?.data ?? [];
  const showOnboarding =
    hydrated && !!authToken && !kidsPending && kids.length === 0;

  const createKidMutation = useMutation({
    mutationFn: (kidDTO: KidRequestDTO) => createKid(kidDTO, authToken ?? ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kids"] }),
  });

  async function onRegisterKid(kidDTO: KidRequestDTO) {
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      await createKidMutation.mutateAsync(kidDTO);

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
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
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
            />
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
          >
            <Text variant={"h4"} className="mb-4">
              Dicas e Artigos
            </Text>

            <ArticleListSection
              articles={articles}
              latestArticle={latestArticle}
              categories={categories}
              articlesByCategory={articlesByCategory}
              isLoading={isLoading}
              isError={isError}
              onRetry={onRefresh}
            />
          </Wrapper>

          <Button
            className="w-full"
            onPress={() => navigation.navigate("Articles")}
          >
            <Text>Ver mais artigos</Text>
          </Button>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
