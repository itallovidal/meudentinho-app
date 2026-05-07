import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { Badge } from "@/components/ui/badge";
import { AntDesign } from "@expo/vector-icons";
import { Image, ScrollView } from "react-native";
import { Markdown } from "react-native-remark";
import { Articles } from "../../../mock/articles";

type ArticleRouteProp = RouteProp<ArticlesStackParamList, "Article">;

export function Article() {
  const route = useRoute<ArticleRouteProp>();
  const id = route.params?.id ?? "";

  const article = Articles[id - 1];

  return (
    <Wrapper
      className="bg-base-100 flex-1"
      direction="column"
      align="start"
      justify="start"
    >
      <Header hasBackButton />

      <ScrollView>
        <Wrapper
          className="bg-base-100 flex-1 mx-8"
          direction="column"
          align="start"
          justify="start"
        >
          <Wrapper direction="row" align="center" gap="gap-4">
            <Badge variant="secondary" className="">
              <Text>{article.category}</Text>
            </Badge>
            <Wrapper direction="row" align="center" gap="gap-1">
              <AntDesign name="clock-circle" size={16} color="gray" />
              <Text variant="small" className="text-base-500">
                {article.readingTime} min de leitura
              </Text>
            </Wrapper>
          </Wrapper>

          <Wrapper
            className="my-4"
            direction="column"
            align="start"
            justify="start"
            gap="gap-4"
          >
            <Image
              src={article.imageSrc}
              className="w-80 h-48 rounded-2xl bg-base-200"
            />

            <Markdown markdown={article.content} />
          </Wrapper>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
