import { FieldShell } from "@/components/forms/fieldShell";
import { Input } from "@/components/ui/input";
import { THEME } from "@/lib/theme";
import { EyeIcon, EyeSlashIcon } from "phosphor-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import {
  Controller,
  useWatch,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface PasswordFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  error?: string;
  revealOnInput?: boolean;
}

export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  error,
  revealOnInput = false,
}: PasswordFieldProps<TFieldValues>) {
  const colors = THEME.light;
  const [isVisible, setIsVisible] = useState(false);
  const currentValue = useWatch({ control, name });
  const showToggle = !revealOnInput || (currentValue ?? "").length > 0;

  return (
    <FieldShell label={label} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={placeholder}
            secureTextEntry={!isVisible}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />
      {showToggle && (
        <Pressable onPress={() => setIsVisible((v) => !v)} hitSlop={8}>
          {isVisible ? (
            <EyeIcon color={colors.primary500} weight="regular" />
          ) : (
            <EyeSlashIcon color={colors.primary500} weight="regular" />
          )}
        </Pressable>
      )}
    </FieldShell>
  );
}
