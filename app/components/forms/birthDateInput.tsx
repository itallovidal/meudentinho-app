import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { brDateToIsoKey, isoToBrDate, maskDateBr } from "@/lib/utils";

type BirthDateInputProps = {
  value: string;
  onChange: (isoDate: string) => void;
  error?: string;
  className?: string;
};

export function BirthDateInput({
  value,
  onChange,
  error,
  className,
}: BirthDateInputProps) {
  const [text, setText] = useState(() => (value ? isoToBrDate(value) : ""));

  useEffect(() => {
    if (!value) {
      return;
    }
    const formatted = isoToBrDate(value);
    if (formatted && formatted !== text) {
      setText(formatted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChangeText(raw: string) {
    const masked = maskDateBr(raw);
    setText(masked);
    if (masked.length === 10) {
      const iso = brDateToIsoKey(masked);
      onChange(iso ?? "");
    } else if (value) {
      onChange("");
    }
  }

  return (
    <Wrapper
      direction="column"
      className={`w-full ${className ?? ""}`}
      gap="gap-2"
    >
      <Text className="text-xs font-semibold uppercase tracking-wide text-primary-400">
        Data de nascimento
      </Text>
      <Input
        value={text}
        onChangeText={handleChangeText}
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        maxLength={10}
        autoCorrect={false}
        className="w-full"
      />
      {error ? (
        <Text className="text-destructive" variant="small">
          {error}
        </Text>
      ) : null}
    </Wrapper>
  );
}
