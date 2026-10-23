import { useEffect, useState, type ReactNode } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import { CaretDownIcon, CaretUpIcon } from "phosphor-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  const [contentHeight, setContentHeight] = useState(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(initiallyExpanded ? 1 : 0);
  const Caret = expanded ? CaretUpIcon : CaretDownIcon;

  useEffect(() => {
    height.value = withTiming(expanded ? contentHeight : 0, { duration: 250 });
    opacity.value = withTiming(expanded ? 1 : 0, { duration: 200 });
  }, [expanded, contentHeight, height, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  function handleLayout(event: LayoutChangeEvent) {
    setContentHeight(Math.ceil(event.nativeEvent.layout.height));
  }

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
      <Animated.View
        style={animatedStyle}
        className="w-full overflow-hidden"
        pointerEvents={expanded ? "auto" : "none"}
        accessibilityElementsHidden={!expanded}
        importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      >
        <View
          className="absolute left-0 right-0 top-0 w-full pt-2"
          onLayout={handleLayout}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}
