import { Fragment } from "react";
import { Pressable, View, type GestureResponderEvent } from "react-native";
import {
  ClockCountdownIcon,
  ClockCounterClockwiseIcon,
  TimerIcon,
} from "phosphor-react-native";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type ReviewCounts = {
  active: number;
  snoozed: number;
  historical: number;
};

type ToothReviewSummaryProps = {
  reviewCounts: ReviewCounts | null;
  reviewError?: string | null;
  onRetry?: () => void;
  tone?: "default" | "inverse";
};

export function ToothReviewSummary({
  reviewCounts,
  reviewError,
  onRetry,
  tone = "default",
}: ToothReviewSummaryProps) {
  const colors = THEME.light;
  const inverse = tone === "inverse";
  const iconColor = inverse ? colors.base100 : colors.primary400;
  const textClassName = inverse ? "text-base-100/80" : "text-primary-700";
  const errorClassName = inverse ? "text-base-100" : "text-primary-800";
  const separatorClassName = inverse ? "bg-base-100/20" : "bg-base-200";
  const skeletonClassName = inverse ? "bg-base-100/20" : "bg-base-200";
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
          label: `${reviewCounts.snoozed} ${reviewCounts.snoozed === 1 ? "registro adiado" : "registros adiados"}`,
        },
        {
          key: "historical",
          icon: ClockCounterClockwiseIcon,
          label: `${reviewCounts.historical} ${reviewCounts.historical === 1 ? "registro incompleto" : "registros incompletos"}`,
        },
      ]
    : null;

  function handleRetry(event: GestureResponderEvent) {
    event.stopPropagation();
    onRetry?.();
  }

  return (
    <View className="w-full gap-3">
      {reviews ? (
        <View className="w-full flex-row items-center gap-2">
          {reviews.map((review, index) => {
            const Icon = review.icon;
            return (
              <Fragment key={review.key}>
                {index > 0 && (
                  <Separator
                    orientation="vertical"
                    className={cn("h-auto self-stretch", separatorClassName)}
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
                    <Icon size={14} color={iconColor} weight="regular" />
                  </View>
                  <Text
                    className={cn(
                      "min-w-0 flex-1 text-[11px] leading-4",
                      textClassName,
                    )}
                  >
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
              className={cn("h-8 flex-1 rounded-md", skeletonClassName)}
            />
          ))}
        </View>
      )}
      {reviewError && (
        <View className="gap-2">
          <Text
            accessibilityRole="alert"
            className={cn("text-xs leading-5", errorClassName)}
          >
            {reviewError}
          </Text>
          {onRetry && (
            <Pressable
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Atualizar revisão dos registros"
              hitSlop={8}
              className="self-start py-1"
            >
              <Text
                className={cn(
                  "text-xs font-semibold underline",
                  errorClassName,
                )}
              >
                Tentar novamente
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
