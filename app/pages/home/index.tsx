import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { RequestKidDTO } from "@/types/dtos/kid";
import { useEffect, useState } from "react";
import { ApiError } from "@/types/domain";
import { getAllArticlePreview } from "@/api/article/getArticles";
import { ArticlePreviewDTO } from "@/types/dtos/article";
import { ArticleBanner } from "@/components/articleBanner";
import { ScrollView, View } from "react-native";
import { ArticleCard } from "@/components/articleCard";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";

export function Home() {
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [registerKidError, setRegisterKidError] = useState<ApiError | null>(
    null,
  );
  const [articles, setArticles] = useState<ArticlePreviewDTO[]>([]);

  function handleOpenArticle(articleId: string) {
    navigation.navigate("Articles", {
      screen: "Article",
      params: { id: articleId },
    });
  }

  async function loadArticles() {
    const { data } = await getAllArticlePreview();
    // console.log("Articles fetched:", data);
    console.log("Fetched articles");

    setArticles(data);
  }

  async function onRegisterKid(kidDTO: RequestKidDTO) {
    try {
      throw new Error("Simulated registration error", {
        cause: kidDTO,
      });
    } catch (error) {
      setRegisterKidError(error as ApiError);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  const latestArticle = articles[0];

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
            <Text className="font-bolder" variant={"h3"}>
              Bem Vindo!
            </Text>
            <Text className="font-bold">
              Por enquanto, não há crianças registradas.
            </Text>

            <Text>
              Registre o primeiro dependente para começar o acompanhamento!
            </Text>

            <View className="rounded-lg bg-base-100 p-4">
              <RegisterKidForm
                onSubmit={onRegisterKid}
                submitError={registerKidError}
              />
            </View>
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
