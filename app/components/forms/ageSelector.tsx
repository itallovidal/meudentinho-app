import { CalendarDotsIcon, CalendarXIcon } from "phosphor-react-native";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { THEME } from "@/lib/theme";
import { CustomCalendar } from "../calendar";
import { DateData } from "react-native-calendars";

type AgeSelectorProps = {
  ageValue: string;
  birthDate: string;
  isEditingBirthDate: boolean;
  setIsEditingBirthDate: (
    value: boolean | ((currentValue: boolean) => boolean),
  ) => void;
  onDayPress: (date: DateData) => void;
  className?: string;
};

export function AgeSelector({
  ageValue,
  birthDate,
  isEditingBirthDate,
  setIsEditingBirthDate,
  onDayPress,
  className,
}: AgeSelectorProps) {
  const colors = THEME.light;

  const formattedBirthDate = birthDate
    ? (() => {
        const [y, m, d] = birthDate.split("T")[0].split("-");
        return `${d}/${m}/${y}`;
      })()
    : "não informada";

  return (
    <Wrapper direction="column" className={`w-full ${className} `} gap="gap-2">
      {isEditingBirthDate && <CustomCalendar onDayPress={onDayPress} />}

      <Wrapper direction="column" className="w-full" gap="gap-2">
        <Text className="font-bold">Idade</Text>

        <Wrapper direction="column" align="start" justify="start" gap="gap-2">
          <Wrapper
            direction="row"
            align="center"
            justify="start"
            gap="gap-2"
            className="w-full rounded-md bg-base-200 p-2 shadow-sm shadow-base-300"
          >
            <Input
              editable={false}
              value={ageValue}
              placeholder="Anos"
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

          <Text className="text-base-500" variant="small">
            Data de nascimento: {formattedBirthDate}
          </Text>
        </Wrapper>
      </Wrapper>
    </Wrapper>
  );
}
