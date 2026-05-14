import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import { useCallback, useContext, useEffect, useState } from "react";
import { ApiError } from "@/types/domain";
import { getAllArticlePreview } from "@/api/article/getArticles";
import { ArticlePreviewDTO } from "@/types/dtos/article";
import { ArticleBanner } from "@/components/articleBanner";
import { Alert, ScrollView, View } from "react-native";
import { ArticleCard } from "@/components/articleCard";
import { Button } from "@/components/ui/button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { UserContext } from "@/contexts/UserContext";
import { createKid, getAllKids } from "@/api/user/kids";

export function Home() {
  const [isVisible, setVisible] = useState(true);
  const [kids, setKids] = useState<KidResponseDTO[]>([]);
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [registerKidError, setRegisterKidError] = useState<ApiError | null>(
    null,
  );
  const [articles, setArticles] = useState<ArticlePreviewDTO[]>([]);
  const { authToken } = useContext(UserContext)!;

  function handleOpenArticle(articleId: string) {
    navigation.navigate("Articles", {
      screen: "Article",
      params: { id: articleId },
    });
  }

  async function loadKids() {
    const { data } = await getAllKids(authToken!);
    setKids(data || []);

    console.log("Loaded kids:", data.length);
    if (data.length > 0) {
      setVisible(false);
    }
  }

  async function loadArticles() {
    const { data } = await getAllArticlePreview();
    setArticles(data);
  }

  async function onRegisterKid(kidDTO: KidRequestDTO) {
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      const newKid = await createKid(kidDTO, authToken);
      console.log("New kid created:", newKid);

      // TODO: create better modals
      Alert.alert("Sucesso", "Dependente cadastrado com sucesso.");
    } catch (error) {
      console.error("Error creating dependent:", error);
      setRegisterKidError(error as ApiError);
    }
  }
  useFocusEffect(
    useCallback(() => {
      loadArticles();
      console.log("Loading kids...");
      loadKids();
    }, []),
  );

  const latestArticle = articles[0];

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="flex-1"
    >
      <Header />
      <ScrollView className="mb-4 flex-1 w-full px-4">
        <Wrapper
          className="bg-base-200 flex-1 w-full"
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
        >
          <Wrapper
            className="flex-1 my-4 w-full"
            direction="column"
            align="start"
            justify="start"
            gap="gap-2"
          >
            <Text variant={"h4"}>Bem Vindo ao MeuDentinho!</Text>
            {/* <Text>
              Precisamos de alguns dados básicos para começar a acompanhar o
              desenvolvimento dentário da criança de forma personalizada.
            </Text> */}

            {isVisible && (
              <View className="w-full">
                <View className="w-full">
                  <Text>
                    Precisamos de alguns dados básicos para começar a acompanhar
                    o desenvolvimento dentário da criança de forma
                    personalizada.
                  </Text>
                </View>
                <View className="w-full p-4 bg-base-100 rounded-lg">
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
          {latestArticle && (
            <ArticleBanner
              key={latestArticle.id}
              title={latestArticle.title}
              readingTime={latestArticle.readingTime}
              imageSrc={latestArticle.imageCoverURL}
              id={latestArticle.id}
              onPress={handleOpenArticle}
            />
          )}

          {[...articles.slice(1)].map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              categories={article.categories}
              readingTime={article.readingTime}
              imageCoverURL={article.imageCoverURL}
              id={article.id}
              onPress={handleOpenArticle}
            />
          ))}

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
