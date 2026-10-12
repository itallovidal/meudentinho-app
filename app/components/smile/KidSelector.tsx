import { ScrollView, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export type KidOption = {
  id: string;
  name: string;
};

type KidSelectorProps = {
  kids: KidOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd?: () => void;
};

export function KidSelector({
  kids,
  selectedId,
  onSelect,
  onAdd,
}: KidSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="w-full"
    >
      <View className="flex-row gap-2 pr-1">
        {kids.map((kid) => (
          <Button
            key={kid.id}
            size="sm"
            variant={kid.id === selectedId ? "default" : "outline"}
            onPress={() => onSelect(kid.id)}
          >
            <Text>{kid.name}</Text>
          </Button>
        ))}
        {onAdd && (
          <Button size="sm" variant="outline" onPress={onAdd}>
            <Text>+</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
