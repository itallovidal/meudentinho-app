import { ScrollView, View } from "react-native";
import type { Renderers } from "react-native-remark";
import { Text } from "@/components/ui/text";

export function MarkdownCode({
  node,
}: Parameters<Renderers["CodeRenderer"]>[0]) {
  return (
    <View className="gap-2 rounded-md bg-base-200 p-3">
      {!!node.lang && (
        <Text className="text-xs text-muted-foreground">{node.lang}</Text>
      )}
      <ScrollView horizontal>
        <Text selectable className="font-mono text-sm leading-6 text-base-800">
          {node.value}
        </Text>
      </ScrollView>
    </View>
  );
}
