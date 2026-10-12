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

const sampleEvents: ToothEvent[] = [
  {
    id: "1",
    toothType: "canine",
    dentition: "primary",
    arch: "upper",
    side: "right",
    eventType: "exfoliation",
    occurrenceDate: "2024-05-10T00:00:00Z",
  },
  {
    id: "2",
    toothType: "central_incisor",
    dentition: "primary",
    arch: "upper",
    side: "right",
    eventType: "eruption",
    occurrenceDate: "2024-06-15T00:00:00Z",
  },
];

export default function RecentEventsList({ items }: { items: ToothEvent[] }) {
  const colors = THEME.light;

  items = sampleEvents;

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
          className="py-6"
        >
          <NoteBlankIcon size={32} color={colors.base400} weight="light" />
          <Text className="text-center text-sm text-base-400">
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
                className="w-full flex-row items-center gap-3 rounded-xl bg-base-200 p-3.5 shadow-sm shadow-base-300"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-base-100">
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
