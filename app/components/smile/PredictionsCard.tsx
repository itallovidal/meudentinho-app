import { Fragment } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  ClockCountdownIcon,
  ClockCounterClockwiseIcon,
  ClockIcon,
  TimerIcon,
} from "phosphor-react-native";

type ReviewCounts = {
  active: number;
  snoozed: number;
  historical: number;
};

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
  const reviews = reviewCounts
    ? [
        {
          key: "active",
          icon: ClockCountdownIcon,
          label: `${reviewCounts.active} ${reviewCounts.active === 1 ? "registro para revisar" : "registros para revisar"}`,
        },
        {
          key: "snoozed",
          icon: TimerIcon,
          label: `${reviewCounts.snoozed} ${reviewCounts.snoozed === 1 ? "adiado" : "adiados"}`,
        },
        {
          key: "historical",
          icon: ClockCounterClockwiseIcon,
          label: `${reviewCounts.historical} ${reviewCounts.historical === 1 ? "incompleto" : "incompletos"}`,
        },
      ]
    : null;

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
        {reviews ? (
          <View className="w-full flex-row items-center gap-2">
            {reviews.map((review, index) => {
              const Icon = review.icon;
              return (
                <Fragment key={review.key}>
                  {index > 0 && (
                    <Separator
                      orientation="vertical"
                      className="h-auto self-stretch bg-base-100/20"
                    />
                  )}
                  <View
                    accessible
                    accessibilityLabel={review.label}
                    className="min-w-0 flex-1 flex-row items-center gap-1.5"
                  >
                    <View
                      importantForAccessibility="no-hide-descendants"
                      accessibilityElementsHidden
                      className="shrink-0 opacity-80"
                    >
                      <Icon size={14} color={colors.base100} weight="regular" />
                    </View>
                    <Text className="min-w-0 flex-1 text-[11px] leading-4 text-base-100/80">
                      {review.label}
                    </Text>
                  </View>
                </Fragment>
              );
            })}
          </View>
        ) : (
          <View
            accessibilityLabel="Carregando revisão dos registros"
            className="w-full flex-row gap-3"
          >
            {[0, 1, 2].map((index) => (
              <Skeleton
                key={index}
                className="h-8 flex-1 rounded-md bg-base-100/20"
              />
            ))}
          </View>
        )}
        {reviewError && (
          <View className="gap-2">
            <Text
              accessibilityRole="alert"
              className="text-xs leading-5 text-base-100"
            >
              {reviewError}
            </Text>
            {onRetry && (
              <Pressable
                onPress={onRetry}
                accessibilityRole="button"
                accessibilityLabel="Atualizar revisão dos registros"
                hitSlop={8}
                className="self-start py-1"
              >
                <Text className="text-xs font-semibold text-base-100 underline">
                  Tentar novamente
                </Text>
              </Pressable>
            )}
          </View>
        )}
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
