import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { ArticleCard } from "@/components/articleCard";
import { Articles } from "../../../mock/articles";
import { Wrapper } from "@/components/wrapper";
import { Input } from "@/components/ui/input";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Index() {
  const categories = ["Higiene Oral", "Dentição", "Alimentação"];

  return (
    <ScrollView className="flex-1 bg-base-100">
      <Header />

      <Wrapper
        className="flex-1 px-6 py-4 bg-base-200"
        direction="column"
        align="start"
        justify="start"
        gap="gap-2"
      >
        <Wrapper
          className="flex-1 relative w-full"
          direction="row"
          align="center"
        >
          <Input
            placeholder="Buscar artigos e guias"
            className="bg-base-100 rounded-lg"
          />
          <FontAwesome
            name="search"
            size={16}
            color="gray"
            className="absolute right-4"
          />
        </Wrapper>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 -mx-6 px-6"
        >
          {categories.map((cat) => (
            <Badge
              key={cat}
              className="bg-base-100 border border-base-300 px-4 py-2 rounded-lg mr-2"
              variant={"outline"}
            >
              <Text className="text-sm">{cat}</Text>
            </Badge>
          ))}
        </ScrollView>

        <View className="mt-6 w-full rounded-3xl bg-primary-500 px-5 py-6">
          <Text className="text-xs text-base-100/80 mb-2">Destaque</Text>
          <Text variant="h2" className="text-base-100">
            O Guia Completo da Regra dos 6 Anos
          </Text>
          <View className="mt-3 flex-row items-center gap-2">
            <Entypo name="back-in-time" size={16} color="white" />
            <Text className="text-xs text-base-100/80">5 min de leitura</Text>
          </View>
        </View>

        <Text variant="h3" className="my-4">
          Hábitos Orais
        </Text>

        {Articles.map((article) => (
          <ArticleCard
            key={article.id}
            category={article.category}
            imageSrc={article.imageSrc}
            title={article.title}
            readingTime={article.readingTime}
            id={article.id}
          />
        ))}

        <Button
        className="w-full"
        variant={"default"}
        >
          <AntDesign name="plus" size={16} color="white" />
          <Text variant={"default"}>Criar Artigo</Text>
        </Button>
      </Wrapper>
    </ScrollView>
  );
}
