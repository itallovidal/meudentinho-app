import { CalendarDotsIcon, CalendarXIcon } from "phosphor-react-native";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { THEME } from "@/lib/theme";
import { formatAgeFromBirthDate, formatDatePtBR } from "@/lib/utils";
import { CustomCalendar } from "../calendar";
import { DateData } from "react-native-calendars";

type AgeSelectorProps = {
  birthDate: string;
  onSelectDate: (dateString: string) => void;
  error?: string;
  isEditingBirthDate: boolean;
  setIsEditingBirthDate: (
    value: boolean | ((currentValue: boolean) => boolean),
  ) => void;
  className?: string;
};

export function AgeSelector({
  birthDate,
  onSelectDate,
  error,
  isEditingBirthDate,
  setIsEditingBirthDate,
  className,
}: AgeSelectorProps) {
  const colors = THEME.light;

  const normalizedBirthDate = birthDate ? birthDate.split("T")[0] : "";
  const formattedBirthDate = formatDatePtBR(birthDate) ?? "não informada";
  const ageText = formatAgeFromBirthDate(birthDate);

  function chooseBirthDate(date: DateData) {
    onSelectDate(date.dateString);
    setIsEditingBirthDate(false);
  }

  return (
    <Wrapper direction="column" className={`w-full ${className} `} gap="gap-2">
      <Text className="font-bold">Data de nascimento</Text>

      {isEditingBirthDate && (
        <CustomCalendar
          onDayPress={chooseBirthDate}
          markedDates={
            normalizedBirthDate
              ? {
                  [normalizedBirthDate]: {
                    selected: true,
                    selectedColor: colors.primary500,
                    selectedTextColor: colors.base100,
                  },
                }
              : undefined
          }
        />
      )}

      <Wrapper direction="column" className="w-full" gap="gap-2">
        <Text className="font-bold">Idade</Text>

        <Wrapper
          direction="row"
          align="center"
          justify="start"
          gap="gap-2"
          className="w-full rounded-md bg-base-200 p-2 shadow-sm shadow-base-300"
        >
          <Input
            editable={false}
            value={ageText}
            placeholder="Automática"
            className="w-[78%]"
          />

          <Button
            onPress={() =>
              setIsEditingBirthDate((currentValue) => !currentValue)
            }
            variant="outline"
            className="h-full"
          >
            {isEditingBirthDate ? (
              <CalendarXIcon
                size={24}
                weight="bold"
                color={colors.destructive}
              />
            ) : (
              <CalendarDotsIcon
                size={24}
                weight="bold"
                color={colors.primary500}
              />
            )}
          </Button>
        </Wrapper>

        {error ? (
          <Text className="text-destructive" variant="small">
            {error}
          </Text>
        ) : (
          <Text className="text-base-500" variant="small">
            Data de nascimento: {formattedBirthDate}
          </Text>
        )}
      </Wrapper>
    </Wrapper>
  );
}
