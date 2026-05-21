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
import { RegisterKidSection } from "@/components/home/registerKidSection";
import RecentEventsList from "@/components/smile/RecentEventsList";

export function Home() {
  const [isKidSectionVisible, setKidSectionVisible] = useState(false);
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
  const hasKids = kids.length === 0;

  useEffect(() => {
    setKidSectionVisible(hasKids);
  }, [hasKids]);

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
          {isKidSectionVisible && (
            <RegisterKidSection
              onRegisterKid={onRegisterKid}
              registerKidError={registerKidError}
            />
          )}

          <RecentEventsList items={[]} />

          <Text variant={"h4"} className="my-4">
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
