import { useState } from "react";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { CalendarBlankIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { brDateToIsoKey, isoToBrDate, maskDateBr } from "@/lib/utils";

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

  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const formatted = isoToBrDate(value);
      if (formatted && formatted !== text) {
        setText(formatted);
      }
    }
  }

  function handleChangeText(raw: string) {
    const masked = maskDateBr(raw);
    setText(masked);
    if (masked.length === 10) {
      const iso = brDateToIsoKey(masked);
      onChange(iso ?? "");
    } else if (masked.length === 0 && value) {
      onChange("");
    }
  }

  return (
    <Wrapper
      direction="column"
      className={`w-full ${className ?? ""}`}
      gap="gap-2"
    >
      <Text
        className="text-xs font-semibold uppercase tracking-wide text-primary-400"
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
          <CalendarBlankIcon size={20} color={colors.base500} weight="bold" />
        </View>
      </View>
      {error ? (
        <Text className="text-destructive" variant="small">
          {error}
        </Text>
      ) : null}
    </Wrapper>
  );
}
