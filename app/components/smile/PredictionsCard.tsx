import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import type { ToothPrediction } from "@/types/teeth";
import {
  formatPredictionWindow,
  PREDICTION_STATUS_LABEL,
} from "@/lib/toothPredictions";
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  ClockIcon,
} from "phosphor-react-native";

export default function PredictionsCard({
  items,
  onPress,
}: {
  items: ToothPrediction[];
  onPress?: () => void;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="w-full flex-1 overflow-hidden rounded-2xl bg-primary-500 p-5"
    >
      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="mb-4 w-full"
      >
        <Text className="text-xl font-semibold text-white">Previsões</Text>
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          accessibilityRole="button"
          accessibilityLabel="Ver todas as previsões"
          hitSlop={8}
        >
          <ArrowRightIcon size={22} color="white" weight="bold" />
        </Pressable>
      </Wrapper>

      <View className="w-full gap-2">
        {items.map((it: ToothPrediction) => (
          <View key={it.id} className="w-full rounded-lg bg-white/10 p-3.5">
            <Text className="text-sm font-semibold text-white">{it.title}</Text>
            <View className="mt-1 flex-row items-start gap-1.5">
              <View className="mt-0.5">
                <ClockIcon
                  size={14}
                  color="rgba(255, 255, 255, 0.6)"
                  weight="bold"
                />
              </View>
              <Text className="flex-1 text-xs text-white/60">
                {`${PREDICTION_STATUS_LABEL[it.status]}: ${formatPredictionWindow(it.windowStart, it.windowEnd)}`}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="absolute bottom-0 right-0 opacity-[0.08]">
        <CalendarBlankIcon size={80} color="white" weight="regular" />
      </View>
    </Wrapper>
  );
}
