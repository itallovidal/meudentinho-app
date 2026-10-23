import {
  ToothReviewSummary,
  type ReviewCounts,
} from "@/components/smile/ToothReviewSummary";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Wrapper } from "@/components/wrapper";
import { THEME } from "@/lib/theme";
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

type PredictionsCardProps = {
  items: ToothPrediction[];
  reviewCounts: ReviewCounts | null;
  reviewError?: string | null;
  onPress?: () => void;
  onRetry?: () => void;
};

export function PredictionsCard({
  items,
  reviewCounts,
  reviewError,
  onPress,
  onRetry,
}: PredictionsCardProps) {
  const colors = THEME.light;

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
        <Text className="text-xl font-semibold text-base-100">Previsões</Text>
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          accessibilityRole="button"
          accessibilityLabel="Ver todas as previsões"
          hitSlop={8}
        >
          <ArrowRightIcon size={22} color={colors.base100} weight="bold" />
        </Pressable>
      </Wrapper>

      <View className="w-full gap-2">
        {items.length ? (
          items.map((item) => (
            <View
              key={item.id}
              className="w-full rounded-lg bg-base-100/10 p-3.5"
            >
              <Text className="text-sm font-semibold text-base-100">
                {item.title}
              </Text>
              <View className="mt-1 flex-row items-start gap-1.5">
                <View className="mt-0.5 opacity-60">
                  <ClockIcon size={14} color={colors.base100} weight="bold" />
                </View>
                <Text className="flex-1 text-xs text-base-100/60">
                  {`${PREDICTION_STATUS_LABEL[item.status]}: ${formatPredictionWindow(item.windowStart, item.windowEnd)}`}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-xs leading-5 text-base-100/80">
            Nenhuma previsão futura nas referências avaliadas.
          </Text>
        )}
      </View>

      <View className="mt-4 w-full gap-3">
        <Separator className="bg-base-100/20" />
        <ToothReviewSummary
          reviewCounts={reviewCounts}
          reviewError={reviewError}
          onRetry={onRetry}
          tone="inverse"
        />
      </View>

      <View
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        className="absolute bottom-0 right-0 opacity-[0.08]"
      >
        <CalendarBlankIcon size={80} color={colors.base100} weight="regular" />
      </View>
    </Wrapper>
  );
}
