import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { ScrollView } from "react-native";
import { SkeletonPropsBadge } from "@/skeletons/components/skeletonPropsBadge";

type PropsItem = {
  id: string;
  name: string;
  isSelected: boolean;
};

type PropsBadgeProps = {
  props: PropsItem[];
  onPress: (category: PropsItem) => void;
  isLoading?: boolean;
  error?: Error & { onPress: () => void };
  wrap?: boolean;
  className?: string;
};

export function PropsBadge({
  props,
  onPress,
  isLoading,
  error,
  wrap,
  className,
}: PropsBadgeProps) {
  if (isLoading) {
    return <SkeletonPropsBadge className={className} wrap={wrap} />;
  }

  if (error) {
    return (
      <Wrapper
        direction="row"
        align="center"
        justify="center"
        gap="gap-2"
        className={` ${className || (wrap ? " flex-wrap " : " flex-nowrap ")} w-full`}
      >
        <Text className="text-base-500">Erro ao carregar as informações.</Text>
        <Button variant="outline" onPress={error.onPress}>
          <Text>Tentar novamente</Text>
        </Button>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      direction="row"
      align="center"
      justify="start"
    >
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
    </Wrapper>
  );
}
