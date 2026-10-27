import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { cn } from "@/lib/utils";

type GenderSelectionProps = {
  gender?: "male" | "female";
  onChange: (gender: "male" | "female") => void;
  className?: string;
};

const OPTIONS = [
  { value: "male", label: "M", a11yLabel: "Masculino" },
  { value: "female", label: "F", a11yLabel: "Feminino" },
] as const;

export function GenderSelector({
  gender,
  onChange,
  className,
}: GenderSelectionProps) {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(gender === "female" ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(gender === "female" ? 1 : 0, {
      duration: 200,
    });
  }, [gender, progress]);

  const cellWidth = Math.max(0, (width - 8) / 2);
  const indicatorStyle = useAnimatedStyle(() => ({
    width: cellWidth,
    transform: [{ translateX: progress.value * cellWidth }],
  }));

  return (
    <Wrapper direction="column" className={cn("w-full", className)} gap="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
        Sexo
      </Text>

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Sexo"
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        className="relative h-14 w-full flex-row rounded-lg bg-base-200 p-1"
      >
        {gender ? (
          <Animated.View
            pointerEvents="none"
            className="absolute bottom-1 left-1 top-1 rounded-md bg-primary-500"
            style={indicatorStyle}
          />
        ) : null}
        {OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: gender === option.value }}
            aria-checked={gender === option.value}
            accessibilityLabel={option.a11yLabel}
            className="flex-1 items-center justify-center"
          >
            <Text
              className={
                gender === option.value
                  ? "font-bold text-base-100"
                  : "font-medium text-muted-foreground"
              }
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Wrapper>
  );
}
