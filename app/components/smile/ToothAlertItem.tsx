import { View } from "react-native";
import { CalendarBlankIcon, ClockIcon, ToothIcon } from "phosphor-react-native";
import { Button } from "@/components/ui/button";
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
  busy: boolean;
  onRegister: (unknown: boolean) => void;
  onSnooze?: () => void;
};

export function ToothAlertItem({
  milestone,
  snoozedUntil,
  disabled,
  busy,
  onRegister,
  onSnooze,
}: ToothAlertItemProps) {
  const colors = THEME.light;
  return (
    <View className="gap-3 rounded-2xl border border-base-200 bg-base-100 p-4">
      <View className="flex-row items-start gap-3">
        <View
          importantForAccessibility="no-hide-descendants"
          className="h-9 w-9 items-center justify-center rounded-xl bg-primary-100"
        >
          <ToothIcon size={19} weight="fill" color={colors.primary400} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-sm font-semibold leading-5 text-primary-800">
            {toothDentitionLabel(milestone.toothType, milestone.dentition)}
          </Text>
          <Text className="text-xs leading-[18px] text-primary-400">
            {dentitionLabel(milestone.dentition)} · {archLabel(milestone.arch)}{" "}
            · {sideLabel(milestone.side)}
          </Text>
        </View>
      </View>
      <View className="gap-2 rounded-xl bg-secondary-100 px-3 py-2.5">
        <View className="flex-row items-center gap-2">
          <CalendarBlankIcon size={15} color={colors.primary400} weight="regular"/>
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
      <Button
        disabled={disabled}
        onPress={() => onRegister(false)}
        className="min-h-11 rounded-xl bg-primary-500 px-3 py-3 "
      >
        <Text className="shrink text-center text-xs font-semibold text-base-100">
          Registrar nascimento com data
        </Text>
      </Button>
      <Button
        variant="outline"
        disabled={disabled}
        onPress={() => onRegister(true)}
        className="min-h-11 rounded-xl border-primary-200 bg-base-100 px-3 py-3"
      >
        <Text className="shrink text-center text-xs font-medium text-primary-600">
          Já nasceu, não sei a data
        </Text>
      </Button>
      {onSnooze && (
        <Button
          variant="ghost"
          disabled={disabled}
          onPress={onSnooze}
          className="min-h-10 gap-2 rounded-xl"
        >
          <ClockIcon size={15} color={colors.primary400} />
          <Text className="text-xs font-medium text-primary-400">
            {busy ? "Salvando..." : "Adiar por 7 dias"}
          </Text>
        </Button>
      )}
    </View>
  );
}
