import { Pressable, View } from "react-native";
import {
  CalendarBlankIcon,
  CaretRightIcon,
  ClockIcon,
  ToothIcon,
} from "phosphor-react-native";
import { Text } from "@/components/ui/text";
import {
  archLabel,
  dentitionLabel,
  sideLabel,
  toothDentitionLabel,
} from "@/lib/teethLabels";
import { formatDatePtBR } from "@/lib/utils";
import { THEME } from "@/lib/theme";
import type { ToothMilestone } from "@/lib/toothMilestones";

type ToothAlertItemProps = {
  milestone: ToothMilestone;
  snoozedUntil?: string;
  disabled: boolean;
  onPress: () => void;
};

export function ToothAlertItem({
  milestone,
  snoozedUntil,
  disabled,
  onPress,
}: ToothAlertItemProps) {
  const colors = THEME.light;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`Revisar ${toothDentitionLabel(milestone.toothType, milestone.dentition)}, ${dentitionLabel(milestone.dentition)}, ${archLabel(milestone.arch)}, ${sideLabel(milestone.side)}`}
      className="gap-3 rounded-2xl border border-base-200 bg-base-100 p-4 active:opacity-70 disabled:opacity-50"
    >
      <View className="flex-row items-start gap-3">
        <View
          importantForAccessibility="no-hide-descendants"
          className="h-9 w-9 items-center justify-center rounded-xl bg-primary-100"
        >
          <ToothIcon size={19} weight="fill" color={colors.primary400} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-semibold leading-5 text-primary-800">
                {toothDentitionLabel(milestone.toothType, milestone.dentition)}
              </Text>
              <Text className="text-xs leading-[18px] text-primary-400">
                {dentitionLabel(milestone.dentition)} ·{" "}
                {archLabel(milestone.arch)} · {sideLabel(milestone.side)}
              </Text>
            </View>
            <CaretRightIcon size={16} color={colors.primary400} weight="bold" />
          </View>
        </View>
      </View>
      <View className="gap-2 rounded-xl bg-secondary-100 px-3 py-2.5">
        <View className="flex-row items-center gap-2">
          <CalendarBlankIcon
            size={15}
            color={colors.primary400}
            weight="regular"
          />
          <Text className="flex-1 text-xs leading-[18px] text-primary-400">
            Limite estimado: {formatDatePtBR(milestone.limitDate ?? "")}
          </Text>
        </View>
        {snoozedUntil && (
          <View className="flex-row items-center gap-2">
            <ClockIcon size={15} color={colors.primary400} />
            <Text className="flex-1 text-xs leading-[18px] text-primary-400">
              Adiado até{" "}
              {new Date(snoozedUntil).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
