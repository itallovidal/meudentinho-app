import { useState } from "react";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { CalendarBlankIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import {
  brDateToIsoKey,
  isoToBrDate,
  maskDateBr,
  validateBirthDateKey,
} from "@/lib/utils";

type BirthDateInputProps = {
  value: string;
  onChange: (isoDate: string) => void;
  error?: string;
  className?: string;
  label?: string;
  labelProps?: ComponentProps<typeof Text>;
};

export function BirthDateInput({
  value,
  onChange,
  error,
  className,
  label = "Data de nascimento",
  labelProps,
}: BirthDateInputProps) {
  const colors = THEME.light;
  const [text, setText] = useState(() => (value ? isoToBrDate(value) : ""));
  const [prevValue, setPrevValue] = useState(value);
  const [emittedValue, setEmittedValue] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== emittedValue) {
      setText(value ? isoToBrDate(value) : "");
      setInputError(null);
    }
    setEmittedValue(null);
  }

  function handleChangeText(raw: string) {
    const masked = maskDateBr(raw);
    const validationError = !masked
      ? null
      : masked.length < 10
        ? "Digite a data completa."
        : validateBirthDateKey(masked.split("/").reverse().join("-"));
    const nextValue = validationError ? "" : (brDateToIsoKey(masked) ?? "");
    setText(masked);
    setInputError(validationError);
    setEmittedValue(nextValue);
    onChange(nextValue);
  }

  const displayedError = inputError ?? error;

  return (
    <Wrapper
      direction="column"
      className={`w-full ${className ?? ""}`}
      gap="gap-2"
    >
      <Text
        className="text-xs font-semibold uppercase tracking-wide text-primary"
        {...labelProps}
      >
        {label}
      </Text>
      <View className="relative w-full">
        <Input
          value={text}
          onChangeText={handleChangeText}
          placeholder="dd/mm/aaaa"
          keyboardType="numeric"
          maxLength={10}
          autoCorrect={false}
          className="w-full pr-12"
        />
        <View
          pointerEvents="none"
          className="absolute bottom-0 right-3 top-0 justify-center"
        >
          <CalendarBlankIcon size={20} color={colors.mutedForeground} weight="bold" />
        </View>
      </View>
      {displayedError ? (
        <Text className="text-destructive" variant="small">
          {displayedError}
        </Text>
      ) : null}
    </Wrapper>
  );
}
