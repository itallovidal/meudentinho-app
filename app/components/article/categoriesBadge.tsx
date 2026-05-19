import { ArticleCategory } from "@/types/dtos/article";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { ScrollView } from "react-native";

type CategoriesBadgeProps = {
  categories: (ArticleCategory & { isSelected: boolean })[];
  onPress: (category: ArticleCategory) => void;
  wrap?: boolean;
  className?: string;
};

export function CategoriesBadge({
  categories,
  onPress,
  wrap,
  className,
}: CategoriesBadgeProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Wrapper
        direction="row"
        align="start"
        justify="start"
        gap="gap-2"
        className={
          ` ${className || (wrap ? " flex-wrap " : " flex-nowrap ")}` + "mt-4"
        }
      >
        {categories.map((category) => (
          <Button
            variant={category.isSelected ? "default" : "outline"}
            key={category.id}
            onPress={() => onPress(category)}
          >
            <Text>{category.name}</Text>
          </Button>
        ))}
      </Wrapper>
    </ScrollView>
  );
}
