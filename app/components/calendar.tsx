import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, CalendarProps, DateData } from "react-native-calendars";
import { MONTH_SHORT_NAMES_PT_BR } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import {
  QuestionIcon,
  CaretRightIcon,
  CaretLeftIcon,
} from "phosphor-react-native";
import { Wrapper } from "./wrapper";

interface Props extends CalendarProps {}

interface CalendarHeaderProps {
  addMonth?: (count: number) => void;
  month?: {
    toDate: () => Date;
  };
  onLabelPress?: () => void;
}

interface CalendarArrowButtonProps {
  direction: "left" | "right";
  onChangeMonth: (count: number) => void;
}

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function formatMonthLabel(date: Date) {
  const formattedLabel = monthFormatter.format(date);

  return formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1);
}

function CalendarArrowButton({
  direction,
  onChangeMonth,
}: CalendarArrowButtonProps) {
  function handlePress() {
    onChangeMonth(1);
  }

  function handleLongPress() {
    onChangeMonth(6);
  }

  const Icon = direction === "left" ? CaretLeftIcon : CaretRightIcon;

  return (
    <Pressable
      accessibilityLabel={
        direction === "left"
          ? "Ir para o mês anterior"
          : "Ir para o próximo mês"
      }
      className="h-10 w-10 items-center justify-center rounded-full bg-primary-100 active:bg-primary-200"
      delayLongPress={500}
      onLongPress={handleLongPress}
      onPress={handlePress}
    >
      <Icon color="hsl(213 53.4% 20.2%)" size={20} weight="bold" />
    </Pressable>
  );
}

function CustomCalendarHeader({
  addMonth,
  month,
  onLabelPress,
}: CalendarHeaderProps) {
  const monthDate = useMemo(() => {
    if (!month) {
      return new Date();
    }

    return month.toDate();
  }, [month]);

  function handleChangeMonth(direction: "left" | "right", step: number) {
    if (!addMonth) {
      return;
    }

    const multiplier = direction === "left" ? -1 : 1;
    addMonth(multiplier * step);
  }

  return (
    <View className="flex-row items-center justify-between px-2 pb-4 pt-2">
      <CalendarArrowButton
        direction="left"
        onChangeMonth={(step) => handleChangeMonth("left", step)}
      />

      {onLabelPress ? (
        <Pressable
          accessibilityLabel="Selecionar mês e ano"
          onPress={onLabelPress}
          className="rounded px-3 py-1 active:bg-base-200"
        >
          <Text className="text-base font-bold text-primary-500">
            {formatMonthLabel(monthDate)}
          </Text>
        </Pressable>
      ) : (
        <Text className="px-3 py-1 text-base font-bold text-primary-500">
          {formatMonthLabel(monthDate)}
        </Text>
      )}

      <CalendarArrowButton
        direction="right"
        onChangeMonth={(step) => handleChangeMonth("right", step)}
      />
    </View>
  );
}

export function CustomCalendar({
  onDayPress,
  maxDate: maxDateProp,
  minDate: minDateProp,
  onMonthChange: onMonthChangeProp,
  allowJump = true,
  ...props
}: Props & { allowJump?: boolean }) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const effectiveMaxDate =
    typeof maxDateProp === "string" && maxDateProp ? maxDateProp : todayKey;
  const effectiveMinDate =
    typeof minDateProp === "string" && minDateProp ? minDateProp : undefined;
  const parsedYear = Number(effectiveMaxDate.split("-")[0]);
  const maxYear = Number.isNaN(parsedYear)
    ? new Date().getFullYear()
    : parsedYear;
  const parsedMonth = Number(effectiveMaxDate.split("-")[1]) - 1;
  const maxMonthIndex = Number.isNaN(parsedMonth)
    ? 11
    : Math.min(Math.max(parsedMonth, 0), 11);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(maxYear);
  const [jumpKey, setJumpKey] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const yearListRef = useRef<FlatList<number> | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => setPickerOpen(false);
    }, []),
  );

  const monthNames = MONTH_SHORT_NAMES_PT_BR;

  const years = useMemo(
    () => Array.from({ length: 121 }, (_, index) => maxYear - index),
    [maxYear],
  );

  useEffect(() => {
    if (pickerOpen) {
      yearListRef.current?.scrollToIndex({
        index: Math.max(0, years.indexOf(pickerYear)),
        animated: false,
      });
    }
  }, [pickerOpen]);

  function handleMonthChange(date: DateData) {
    setVisibleMonth(new Date(`${date.dateString}T12:00:00`));
    onMonthChangeProp?.(date);
  }

  function openPicker() {
    const year = visibleMonth.getFullYear();
    setPickerYear(Number.isNaN(year) ? maxYear : Math.min(year, maxYear));
    setPickerOpen(true);
  }

  function applyMonth(monthIndex: number) {
    setJumpKey(
      `${pickerYear}-${String(monthIndex + 1).padStart(2, "0")}-15`,
    );
    setVisibleMonth(new Date(pickerYear, monthIndex, 1));
    setPickerOpen(false);
  }

  function isMonthDisabled(monthIndex: number) {
    return pickerYear === maxYear && monthIndex > maxMonthIndex;
  }

  function isMonthSelected(monthIndex: number) {
    return (
      pickerYear === visibleMonth.getFullYear() &&
      monthIndex === visibleMonth.getMonth()
    );
  }

  return (
    <View className="w-full">
      <Calendar
        {...props}
        key={jumpKey ?? undefined}
        current={jumpKey ?? undefined}
        maxDate={effectiveMaxDate}
        minDate={effectiveMinDate}
        onDayPress={onDayPress}
        onMonthChange={handleMonthChange}
        enableSwipeMonths={true}
        customHeader={(headerProps: CalendarHeaderProps) => (
          <CustomCalendarHeader
            {...headerProps}
            onLabelPress={allowJump ? openPicker : undefined}
          />
        )}
      />

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="gap-3 p-4">
          <DialogHeader>
            <DialogTitle>Selecionar mês e ano</DialogTitle>
          </DialogHeader>

          <FlatList
            ref={yearListRef}
            horizontal
            data={years}
            keyExtractor={(year) => String(year)}
            renderItem={({ item: year }) => (
              <Button
                size="sm"
                variant={year === pickerYear ? "default" : "outline"}
                onPress={() => setPickerYear(year)}
                className="w-16"
              >
                <Text>{String(year)}</Text>
              </Button>
            )}
            getItemLayout={(_, index) => ({
              length: 72,
              offset: 72 * index,
              index,
            })}
            initialScrollIndex={Math.max(0, years.indexOf(pickerYear))}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          />

          <View className="flex-row flex-wrap gap-2">
            {monthNames.map((name, index) => (
              <Button
                key={name}
                size="sm"
                variant={isMonthSelected(index) ? "default" : "outline"}
                disabled={isMonthDisabled(index)}
                onPress={() => applyMonth(index)}
                className="grow basis-[23%]"
              >
                <Text>{name}</Text>
              </Button>
            ))}
          </View>
        </DialogContent>
      </Dialog>

      <Wrapper
        className="mt-4"
        direction="row"
        align="center"
        justify="center"
        gap="gap-2"
      >
        <QuestionIcon size={16} color="hsl(213 53.4% 20.2%)" weight="bold" />
        <Text variant={"small"} className="text-base-500">
          Você pode apertar e segurar para pular 6 meses.
        </Text>
      </Wrapper>
    </View>
  );
}
