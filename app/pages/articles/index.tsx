import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Plus } from "phosphor-react-native";
import { ArticleCard } from "@/components/articleCard";
import { Articles } from "../../../mock/articles";
import { Wrapper } from "@/components/wrapper";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "phosphor-react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArticleBanner } from "@/components/articleBanner";

export function Index() {
  const categories = ["Higiene Oral", "Dentição", "Alimentação"];

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="bg-base-100 flex-1"
    >
      <Header />
      <ScrollView>
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
            <MagnifyingGlassIcon
              size={16}
              color="gray"
              style={{ position: "absolute", right: 16 }}
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

          <ArticleBanner
            imageSrc="https://img.magnific.com/free-photo/smiley-little-girl-red-dress_23-2148984784.jpg"
            title="O Guia Completo da Regra dos 6 Anos"
            readingTime="7"
            id="2"
          ></ArticleBanner>

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

          <Button className="w-full" variant={"default"}>
            <Plus size={16} color="white" />
            <Text variant={"default"}>Criar Artigo</Text>
          </Button>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
