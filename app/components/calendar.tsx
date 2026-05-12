import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { Calendar, CalendarProps } from "react-native-calendars";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function CustomCalendarHeader({ addMonth, month }: CalendarHeaderProps) {
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

      <Text className="text-base font-bold text-primary-500">
        {formatMonthLabel(monthDate)}
      </Text>

      <CalendarArrowButton
        direction="right"
        onChangeMonth={(step) => handleChangeMonth("right", step)}
      />
    </View>
  );
}

export function CustomCalendar({ onDayPress, ...props }: Props) {
  const maxDate = new Date();

  return (
    <View className="w-full">
      <Calendar
        maxDate={maxDate.toISOString()}
        onDayPress={onDayPress}
        enableSwipeMonths={true}
        customHeader={CustomCalendarHeader}
        {...props}
      />

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
