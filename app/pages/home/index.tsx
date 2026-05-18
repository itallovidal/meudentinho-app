import { useContext, useState, useEffect } from "react";
import { ApiError } from "@/types/domain";
import { Alert, ScrollView, View } from "react-native";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { UserContext } from "@/contexts/UserContext";
import { createKid, getAllKids } from "@/api/user/kids";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArticleListSection } from "@/components/article/articleListSection";
import { RefreshControl } from "react-native-gesture-handler";
import { useArticles } from "@/hooks/useArticles";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { KidRequestDTO } from "@/types/dtos/user";

export function Home() {
  const [isVisible, setVisible] = useState(true);
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [registerKidError, setRegisterKidError] = useState<ApiError | null>(
    null,
  );
  const { authToken } = useContext(UserContext)!;
  const queryClient = useQueryClient();

  const {
    isRefreshing,
    onRefresh,
    articles,
    latestArticle,
    categories,
    articlesByCategory,
    isLoading,
  } = useArticles({ withCategories: false });

  const { data: kidsResponse } = useQuery({
    queryKey: ["kids", authToken],
    queryFn: () => getAllKids(authToken!),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
  });

  const kids = kidsResponse?.data || [];

  useEffect(() => {
    if (kids.length > 0) {
      setVisible(false);
    }
  }, [kids.length]);

  async function onRegisterKid(kidDTO: KidRequestDTO) {
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      await createKid(kidDTO, authToken);

      queryClient.invalidateQueries({ queryKey: ["kids", authToken] });

      Alert.alert("Sucesso", "Dependente cadastrado com sucesso.");
    } catch (error) {
      console.error("Error creating dependent:", error);
      setRegisterKidError(error as ApiError);
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
          className="mx-6 my-4 flex-1"
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
        >
          <Wrapper
            className="my-4 flex-1"
            direction="column"
            align="start"
            justify="start"
            gap="gap-2"
          >
            <Text variant={"h4"}>Bem Vindo ao MeuDentinho!</Text>

            {isVisible && (
              <View className="w-full">
                <View className="w-full">
                  <Text>
                    Precisamos de alguns dados básicos para começar a acompanhar
                    o desenvolvimento dentário da criança de forma
                    personalizada.
                  </Text>
                </View>
                <View className="w-full rounded-lg bg-base-100 p-4">
                  <RegisterKidForm
                    onSubmit={onRegisterKid}
                    submitError={registerKidError}
                  />
                </View>
              </View>
            )}
          </Wrapper>

          <Text variant={"h4"} className="mt-4">
            Dicas e Artigos
          </Text>

          <ArticleListSection
            articles={articles}
            latestArticle={latestArticle}
            categories={categories}
            articlesByCategory={articlesByCategory}
            isLoading={isLoading}
          />

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
