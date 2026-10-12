import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { THEME } from "@/lib/theme";

type GenderSelectionProps = {
  gender: "male" | "female";
  onChange: (gender: "male" | "female") => void;
  className?: string;
};

const OPTIONS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
] as const;

export function GenderSelector({
  gender,
  onChange,
  className,
}: GenderSelectionProps) {
  const colors = THEME.light;
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
    <Wrapper direction="column" className={className} gap="gap-2">
      <Text className="w-full font-bold">Gênero</Text>

      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        className="relative flex-row rounded-md bg-base-200 p-1 shadow-sm shadow-base-300"
      >
        <Animated.View
          pointerEvents="none"
          className="absolute bottom-1 left-1 top-1 rounded bg-primary"
          style={indicatorStyle}
        />
        {OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-1 items-center py-2"
          >
            <Text
              className={
                gender === option.value
                  ? "font-bold text-white"
                  : "text-base-500"
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
