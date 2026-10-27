import { useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { CaretDownIcon, CaretUpIcon } from "phosphor-react-native";
import { AnimatedHeight } from "@/components/animatedHeight";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  initiallyExpanded?: boolean;
};

export function CollapsibleSection({
  title,
  children,
  initiallyExpanded = false,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const Caret = expanded ? CaretUpIcon : CaretDownIcon;

  function toggleExpanded() {
    setExpanded((current) => !current);
  }

  return (
    <View className="w-full">
      <Pressable
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? "Recolher" : "Expandir"} ${title.toLowerCase()}`}
        accessibilityState={{ expanded }}
        className="min-h-11 w-full flex-row items-center justify-between gap-3 py-2"
      >
        <Text className="min-w-0 flex-1 text-sm font-semibold text-primary-800">
          {title}
        </Text>
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <Caret size={20} color={THEME.light.primary400} weight="bold" />
        </View>
      </Pressable>
      <AnimatedHeight expanded={expanded}>
        <View className="w-full pt-2">{children}</View>
      </AnimatedHeight>
    </View>
  );
}
