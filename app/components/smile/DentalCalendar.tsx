import { useEffect, useState } from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { cn, parseLocalDate, toLocalDateKey } from "@/lib/utils";
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
const MONTH_FULL_LABELS = new Intl.DateTimeFormat("pt-BR", { month: "long" });
const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const BAND_RADIUS = 16;
const PRESSED_OPACITY = 0.6;

function pressedStyle(pressed: boolean) {
  return pressed ? { opacity: PRESSED_OPACITY } : undefined;
}

type DentalCalendarProps = {
  marks?: Record<string, PredictionCalendarMark>;
  selectedDate?: string | null;
  initialDate?: Date;
  focusRequest?: { date: Date } | null;
  minDate?: string;
  maxDate?: string;
  onDayPress?: (dateKey: string) => void;
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

function resolveInitialDate(
  selectedDate: string | null | undefined,
  initialDate: Date | undefined,
): Date {
  if (selectedDate) {
    const parsed = parseLocalDate(selectedDate);
    if (parsed) {
      return parsed;
    }
  }
  return initialDate ?? new Date();
}

export function DentalCalendar({
  marks,
  selectedDate,
  initialDate,
  focusRequest,
  minDate,
  maxDate,
  onDayPress,
}: DentalCalendarProps) {
  const colors = THEME.light;
  const [year, setYear] = useState(() =>
    resolveInitialDate(selectedDate, initialDate).getFullYear(),
  );
  const [month, setMonth] = useState(() =>
    resolveInitialDate(selectedDate, initialDate).getMonth(),
  );

  useEffect(() => {
    if (!selectedDate) {
      return;
    }
    const parsed = parseLocalDate(selectedDate);
    if (!parsed) {
      return;
    }
    setYear(parsed.getFullYear());
    setMonth(parsed.getMonth());
  }, [selectedDate]);

  useEffect(() => {
    if (!focusRequest) {
      return;
    }
    setYear(focusRequest.date.getFullYear());
    setMonth(focusRequest.date.getMonth());
  }, [focusRequest]);

  const minYear = minDate ? parseLocalDate(minDate)?.getFullYear() : undefined;
  const maxYear = maxDate ? parseLocalDate(maxDate)?.getFullYear() : undefined;

  const previousYearDisabled = minYear !== undefined && year <= minYear;
  const nextYearDisabled = maxYear !== undefined && year >= maxYear;

  function isDayDisabled(dateKey: string) {
    if (!onDayPress) {
      return true;
    }
    if (minDate && dateKey < minDate) {
      return true;
    }
    if (maxDate && dateKey > maxDate) {
      return true;
    }
    return false;
  }

  function isMonthDisabled(monthIndex: number) {
    const monthStartKey = toLocalDateKey(new Date(year, monthIndex, 1));
    const monthEndKey = toLocalDateKey(new Date(year, monthIndex + 1, 0));
    if (minDate && monthEndKey < minDate) {
      return true;
    }
    if (maxDate && monthStartKey > maxDate) {
      return true;
    }
    return false;
  }

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

  const markList = marks ? Object.values(marks) : [];
  const hasWindowMark = markList.some((mark) => mark.inWindow);
  const hasRegisteredMark = markList.some((mark) => mark.registered);

  return (
    <View className="w-full gap-3">
      <View className="flex-row items-center justify-between px-2">
        <Pressable
          onPress={() => setYear((current) => current - 1)}
          disabled={previousYearDisabled}
          hitSlop={12}
          android_ripple={null}
          style={({ pressed }) => pressedStyle(pressed)}
          accessibilityRole="button"
          accessibilityState={{ disabled: previousYearDisabled }}
          accessibilityLabel="Ano anterior"
          className={cn("p-1", previousYearDisabled && "opacity-40")}
        >
          <CaretLeftIcon size={20} color={colors.primary500} weight="bold" />
        </Pressable>
        <Text className="text-base font-bold text-primary-800">{year}</Text>
        <Pressable
          onPress={() => setYear((current) => current + 1)}
          disabled={nextYearDisabled}
          hitSlop={12}
          android_ripple={null}
          style={({ pressed }) => pressedStyle(pressed)}
          accessibilityRole="button"
          accessibilityState={{ disabled: nextYearDisabled }}
          accessibilityLabel="Próximo ano"
          className={cn("p-1", nextYearDisabled && "opacity-40")}
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
          const disabled = isMonthDisabled(index);
          return (
            <Pressable
              key={label}
              onPress={() => setMonth(index)}
              disabled={disabled}
              android_ripple={null}
              style={({ pressed }) => pressedStyle(pressed)}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`${label} de ${year}`}
              className={cn(
                "rounded-full px-3 py-1.5",
                selected ? "bg-primary-500" : "bg-base-200",
                disabled && "opacity-40",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  selected ? "text-base-100" : "text-base-600",
                )}
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
              const dayKey = toLocalDateKey(new Date(year, month, day));
              const mark = marks?.[dayKey];
              const isSelected = selectedDate === dayKey;
              const isDisabled = isDayDisabled(dayKey);
              const isHighlighted = isSelected || mark?.registered === true;
              const monthLabel = MONTH_FULL_LABELS.format(
                new Date(year, month, day),
              );
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
                  <Pressable
                    onPress={() => onDayPress?.(dayKey)}
                    disabled={isDisabled}
                    android_ripple={null}
                    style={({ pressed }) => pressedStyle(pressed)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                    accessibilityLabel={`${day} de ${monthLabel} de ${year}`}
                    className={cn(
                      "h-10 w-10 items-center justify-center rounded-full",
                      isHighlighted && "bg-primary-500",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm",
                        isHighlighted
                          ? "font-bold text-base-100"
                          : mark?.inWindow
                            ? "font-semibold text-primary-800"
                            : "text-base-700",
                      )}
                    >
                      {day}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {(hasWindowMark || hasRegisteredMark) && (
        <View className="flex-row flex-wrap items-center gap-4 px-2">
          {hasWindowMark && (
            <View className="flex-row items-center gap-2">
              <View className="h-3 w-6 rounded-full bg-primary-100" />
              <Text className="text-xs text-base-500">Janela de previsão</Text>
            </View>
          )}
          {hasRegisteredMark && (
            <View className="flex-row items-center gap-2">
              <View className="h-3 w-3 rounded-full bg-primary-500" />
              <Text className="text-xs text-base-500">Marco registrado</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
