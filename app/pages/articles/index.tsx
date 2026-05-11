import { ScrollView } from "react-native";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { ArticleCard } from "@/components/articleCard";
import { Articles } from "../../../mock/articles";
import { Wrapper } from "@/components/wrapper";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "phosphor-react-native";
import { Badge } from "@/components/ui/badge";
import { ArticleBanner } from "@/components/articleBanner";

export function Index() {
  const categories = ["Higiene Oral", "Dentição", "Alimentação"];

  const ArticlesByCategory = (category: string) => {
    return Articles.filter((article) => article.category === category);
  };

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
              weight="regular"
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

          {Articles.filter((article) => article.isSpotlight).map((article) => (
            <ArticleBanner
              key={article.id}
              title={article.title}
              readingTime={article.readingTime}
              imageSrc={article.imageSrc}
              id={article.id}
            />
          ))}

          {categories.map((category) => {
            if (ArticlesByCategory(category).length === 0) {
              return null;
            }

            return (
              <Wrapper
                key={category}
                direction="column"
                align="start"
                justify="start"
                gap="gap-3"
              >
                <Text variant="h3" className="mt-2">
                  {category}
                </Text>

                {ArticlesByCategory(category).map(
                  (article) =>
                    !article.isSpotlight && (
                      <ArticleCard
                        key={article.id}
                        title={article.title}
                        category={article.category}
                        readingTime={article.readingTime}
                        imageSrc={article.imageSrc}
                        id={article.id}
                      />
                    ),
                )}
              </Wrapper>
            );
          })}
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
