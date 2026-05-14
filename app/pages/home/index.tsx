import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import { useCallback, useContext, useState } from "react";
import { ApiError } from "@/types/domain";
import { Alert, ScrollView, View } from "react-native";
import { Button } from "@/components/ui/button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { UserContext } from "@/contexts/UserContext";
import { createKid, getAllKids } from "@/api/user/kids";
import { useArticles } from "@/hooks/useArticles";
import { ArticleListRender } from "@/components/articleListRender";

export function Home() {
  const [isVisible, setVisible] = useState(true);
  const [kids, setKids] = useState<KidResponseDTO[]>([]);
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [registerKidError, setRegisterKidError] = useState<ApiError | null>(
    null,
  );
  const { authToken } = useContext(UserContext)!;

  const { articles, latestArticle } = useArticles({ withCategories: false });

  async function loadKids() {
    const { data } = await getAllKids(authToken!);
    setKids(data || []);

    console.log("Loaded kids:", data.length);
    if (data.length > 0) {
      setVisible(false);
    }
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
      console.log("Loading kids...");
      loadKids();
    }, []),
  );

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="flex-1"
    >
      <Header />
      <ScrollView className="w-full flex-1">
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

          <ArticleListRender
            latestArticle={latestArticle}
            articles={articles.slice(1)}
            hasCategoryTitle={false}
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
