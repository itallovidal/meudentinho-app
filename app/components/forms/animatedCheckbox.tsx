import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { CheckIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  accessibilityLabel?: string;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  accessibilityLabel,
}: AnimatedCheckboxProps) {
  const colors = THEME.light;
  const progress = useSharedValue(checked ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 50 });
  }, [checked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.base100, colors.primary500],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.base300, colors.primary500],
    ),
    transform: [{ scale: pressScale.value }],
  }));

  function handlePress() {
    onChange(!checked);
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <Animated.View
        style={boxStyle}
        className="h-5 w-5 items-center justify-center rounded-lg border-2"
      >
        {checked ? (
          <Animated.View
            entering={ZoomIn.springify()}
            exiting={ZoomOut.duration(20)}
          >
            <CheckIcon size={16} color={colors.base100} weight="bold" />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}
