import { useEffect, useState } from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { toLocalDateKey } from "@/lib/utils";
import type { PredictionCalendarMark } from "@/lib/toothPredictions";

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const BAND_RADIUS = 16;

type PredictionCalendarProps = {
  marks: Record<string, PredictionCalendarMark>;
  initialDate: Date;
  focusRequest?: { date: Date } | null;
};

function windowBandStyle(mark: PredictionCalendarMark): ViewStyle {
  if (mark.windowStart && mark.windowEnd) {
    return {
      left: "10%",
      right: "10%",
      borderRadius: BAND_RADIUS,
    };
  }
  return {
    left: mark.windowStart ? "50%" : 0,
    right: mark.windowEnd ? "50%" : 0,
    borderTopLeftRadius: mark.windowStart ? BAND_RADIUS : 0,
    borderBottomLeftRadius: mark.windowStart ? BAND_RADIUS : 0,
    borderTopRightRadius: mark.windowEnd ? BAND_RADIUS : 0,
    borderBottomRightRadius: mark.windowEnd ? BAND_RADIUS : 0,
  };
}

export function PredictionCalendar({
  marks,
  initialDate,
  focusRequest,
}: PredictionCalendarProps) {
  const colors = THEME.light;
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (!focusRequest) {
      return;
    }
    setYear(focusRequest.date.getFullYear());
    setMonth(focusRequest.date.getMonth());
  }, [focusRequest]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return (
    <View className="w-full gap-3">
      <View className="flex-row items-center justify-between px-2">
        <Pressable
          onPress={() => setYear((current) => current - 1)}
          hitSlop={12}
          accessibilityLabel="Ano anterior"
        >
          <CaretLeftIcon size={20} color={colors.primary500} weight="bold" />
        </Pressable>
        <Text className="text-base font-bold text-primary-800">{year}</Text>
        <Pressable
          onPress={() => setYear((current) => current + 1)}
          hitSlop={12}
          accessibilityLabel="Próximo ano"
        >
          <CaretRightIcon size={20} color={colors.primary500} weight="bold" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {MONTH_LABELS.map((label, index) => {
          const selected = index === month;
          return (
            <Pressable
              key={label}
              onPress={() => setMonth(index)}
              className={`rounded-full px-3 py-1.5 ${selected ? "bg-primary-500" : "bg-base-200"}`}
            >
              <Text
                className={`text-sm font-semibold ${selected ? "text-base-100" : "text-base-600"}`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="w-full">
        <View className="flex-row">
          {WEEKDAY_LABELS.map((label, index) => (
            <View key={index} className="flex-1 items-center py-1">
              <Text className="text-xs font-semibold text-base-500">
                {label}
              </Text>
            </View>
          ))}
        </View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row">
            {week.map((day, dayIndex) => {
              if (day === null) {
                return <View key={dayIndex} className="h-10 flex-1" />;
              }
              const mark = marks[toLocalDateKey(new Date(year, month, day))];
              const registered = mark?.registered ?? false;
              return (
                <View
                  key={dayIndex}
                  className="h-10 flex-1 items-center justify-center"
                >
                  {mark?.inWindow && (
                    <View
                      className="absolute bottom-1 top-1 bg-primary-100"
                      style={windowBandStyle(mark)}
                    />
                  )}
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-full ${registered ? "bg-primary-500" : ""}`}
                  >
                    <Text
                      className={`text-sm ${registered ? "font-bold text-base-100" : mark?.inWindow ? "font-semibold text-primary-800" : "text-base-700"}`}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap items-center gap-4 px-2">
        <View className="flex-row items-center gap-2">
          <View className="h-3 w-6 rounded-full bg-primary-100" />
          <Text className="text-xs text-base-500">Janela de previsão</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-3 w-3 rounded-full bg-primary-500" />
          <Text className="text-xs text-base-500">Marco registrado</Text>
        </View>
      </View>
    </View>
  );
}
