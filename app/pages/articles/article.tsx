import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { Badge } from "@/components/ui/badge";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "react-native";


type ArticleRouteProp = RouteProp<ArticlesStackParamList, "Article">;

export function Article() {
  const route = useRoute<ArticleRouteProp>();
  const id = route.params?.id ?? "";

  return (
    <Wrapper
      className="bg-base-100 flex-1"
      direction="column"
      align="start"
      justify="start"
    >
      <Header hasBackButton />

      {/* Article Content */}
      <Wrapper
        className="bg-base-100 flex-1 mx-8"
        direction="column"
        align="start"
        justify="start"
      >
      {/* Badge and readingTime */}
        <Wrapper direction="row" align="center" gap="gap-4">
          <Badge variant="secondary" className="">
            <Text>Higiene Oral</Text>
          </Badge>
          <Wrapper direction="row" align="center" gap="gap-1">
            <AntDesign name="clock-circle" size={16} color="gray" />
            <Text variant="small" className="text-base-500">
              5 min de leitura
            </Text>
          </Wrapper>
        </Wrapper>

        <Wrapper
        className="flex-1"
        direction="column"
        align="start"
        justify="start">
        <Text variant="h2">O Guia Completo da Regra dos 6 Anos</Text>
        <Image
          className="w-80 h-48 rounded-lg bg-base-200 "
          src=""

        />
        <Text>{`Id - ${id}`}</Text>
      </Wrapper>

      </Wrapper>
      
    </Wrapper>
  );
}
