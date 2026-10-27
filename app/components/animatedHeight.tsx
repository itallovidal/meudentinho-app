import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type AnimatedHeightProps = {
  children: ReactNode;
  expanded?: boolean;
};

export function AnimatedHeight({
  children,
  expanded = true,
}: AnimatedHeightProps) {
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const height = useSharedValue(0);
  const opacity = useSharedValue(expanded ? 1 : 0);
  const measured = useRef(false);

  useLayoutEffect(() => {
    if (contentHeight === null) return;
    const targetHeight = expanded ? contentHeight : 0;
    height.value = measured.current
      ? withTiming(targetHeight, { duration: 250 })
      : targetHeight;
    opacity.value = withTiming(expanded ? 1 : 0, { duration: 200 });
    measured.current = true;
  }, [expanded, contentHeight, height, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  function handleLayout(event: LayoutChangeEvent) {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    setContentHeight(nextHeight);
  }

  return (
    <Animated.View
      style={
        contentHeight === null
          ? expanded
            ? undefined
            : { height: 0, opacity: 0 }
          : animatedStyle
      }
      className="w-full overflow-hidden"
      pointerEvents={expanded ? "auto" : "none"}
      accessibilityElementsHidden={!expanded}
      importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
    >
      <View
        className={
          contentHeight === null
            ? "w-full"
            : "absolute left-0 right-0 top-0 w-full"
        }
        onLayout={handleLayout}
      >
        {children}
      </View>
    </Animated.View>
  );
}
