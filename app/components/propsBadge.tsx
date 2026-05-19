import { ArticleCategory } from "@/types/dtos/article";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { ScrollView } from "react-native";

type PropsItem = {
  id: string;
  name: string;
  isSelected: boolean;
};

type PropsBadgeProps = {
  props: PropsItem[];
  onPress: (category: PropsItem) => void;
  wrap?: boolean;
  className?: string;
};

export function PropsBadge({
  props,
  onPress,
  wrap,
  className,
}: PropsBadgeProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Wrapper
        direction="row"
        align="start"
        justify="start"
        gap="gap-2"
        className={` ${className || (wrap ? " flex-wrap " : " flex-nowrap ")}`}
      >
        {props.map((prop) => (
          <Button
            variant={prop.isSelected ? "default" : "outline"}
            key={prop.id}
            onPress={() => onPress(prop)}
          >
            <Text>{prop.name}</Text>
          </Button>
        ))}
      </Wrapper>
    </ScrollView>
  );
}
