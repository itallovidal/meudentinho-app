import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { ToothEvent } from "@/types/teeth";
import {
  ClockCounterClockwiseIcon,
  NoteBlankIcon,
  ToothIcon,
  StarIcon,
  CalendarCheckIcon,
} from "phosphor-react-native";
import { THEME } from "@/lib/theme";

// Map event types to icons for visual distinction
const EVENT_ICON_MAP: Record<string, { Icon: any; color: string }> = {
  exfoliation: { Icon: ToothIcon, color: THEME.light.primary400 },
  eruption: { Icon: StarIcon, color: THEME.light.tertiary400 },
};

const DEFAULT_EVENT_ICON = {
  Icon: CalendarCheckIcon,
  color: THEME.light.base500,
};

export default function RecentEventsList({ items }: { items: ToothEvent[] }) {
  const colors = THEME.light;

  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="flex-1 w-full rounded-xl bg-base-200 p-5"
    >
      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="flex-1 w-full mb-3"
      >
        <Text variant="h4" className="text-primary-500">
          Últimos Registros
        </Text>
        <ClockCounterClockwiseIcon
          size={24}
          color={colors.primary400}
          weight="regular"
        />
      </Wrapper>

      {items.length === 0 ? (
        <Wrapper
        direction="column"
        align="center"
        justify="center"
        gap="gap-2"
        className="py-6">
          <NoteBlankIcon size={32} color={colors.base400} weight="light" />
          <Text className="text-sm text-base-400 text-center">
            Nenhum registro informado.
          </Text>
        </Wrapper>
      ) : (
        <View className="gap-2">
          {items.map((it) => {
            const { Icon, color } =
              EVENT_ICON_MAP[it.eventType] || DEFAULT_EVENT_ICON;
            return (
              <View
                key={it.id}
                className="bg-base-200 rounded-xl p-3.5 flex-row items-center gap-3"
              >
                <View className="w-10 h-10 rounded-full bg-base-100 items-center justify-center">
                  <Icon size={20} color={color} weight="bold" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-primary-800">
                    {it.toothType} • {it.eventType}
                  </Text>
                  <Text className="text-xs text-base-500">
                    {new Date(it.occurrenceDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Wrapper>
  );
}
