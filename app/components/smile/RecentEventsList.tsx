import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { ToothEvent } from "@/types/teeth";
import {
  BabyIcon,
  CalendarCheckIcon,
  ClockCounterClockwiseIcon,
  ToothIcon,
} from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { toothEventTitle } from "@/lib/teethLabels";
import { formatDateShortPtBR } from "@/lib/utils";

const EVENT_COLOR_MAP: Record<string, string> = {
  exfoliation: THEME.light.primary400,
  eruption: THEME.light.tertiary400,
};

const DENTITION_ICON_MAP: Record<string, any> = {
  primary: BabyIcon,
  permanent: ToothIcon,
};

const DEFAULT_EVENT_ICON = {
  Icon: CalendarCheckIcon,
  color: THEME.light.base500,
};

export default function RecentEventsList({
  items,
  onHistoryPress,
  onItemPress,
}: {
  items: ToothEvent[];
  onHistoryPress?: () => void;
  onItemPress?: (event: ToothEvent) => void;
}) {
  const colors = THEME.light;

  if (items.length === 0) {
    return null;
  }

  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="w-full flex-1 rounded-xl bg-base-100 p-5 shadow-sm shadow-base-300"
    >
      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="mb-3 w-full flex-1"
      >
        <Text variant="h4" className="flex-1 text-primary-500">
          Últimos Registros
        </Text>
        <Pressable
          onPress={onHistoryPress}
          disabled={!onHistoryPress}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico completo"
          hitSlop={8}
        >
          <ClockCounterClockwiseIcon
            size={24}
            color={colors.primary400}
            weight="regular"
          />
        </Pressable>
      </Wrapper>

      <View className="gap-2">
        {items.map((it) => {
          const Icon =
            DENTITION_ICON_MAP[it.dentition] ?? DEFAULT_EVENT_ICON.Icon;
          const color =
            EVENT_COLOR_MAP[it.eventType] ?? DEFAULT_EVENT_ICON.color;
          return (
            <Pressable
              key={it.id}
              onPress={() => onItemPress?.(it)}
              disabled={!onItemPress}
              accessibilityRole="button"
              accessibilityLabel="Editar registro"
              className="w-full flex-row items-center gap-3 rounded-xl bg-base-200 p-3.5 shadow-sm shadow-base-300"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-base-100">
                <Icon size={20} color={color} weight="bold" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary-800">
                  {toothEventTitle(it)}
                </Text>
                <Text className="text-xs text-base-500">
                  {it.note
                    ? `${formatDateShortPtBR(it.occurrenceDate) ?? it.occurrenceDate} • ${it.note}`
                    : (formatDateShortPtBR(it.occurrenceDate) ??
                      it.occurrenceDate)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Wrapper>
  );
}
