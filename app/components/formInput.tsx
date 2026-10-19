import { useEffect, useRef } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Textarea } from "./ui/textarea";

type InputProps = ComponentProps<typeof Input>;

interface FormInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  inputProps?: Omit<InputProps, "onBlur" | "onChangeText" | "value">;
  labelProps?: ComponentProps<typeof Text>;
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  errors,
  name,
  label,
  inputProps,
  labelProps,
}: FormInputProps<TFieldValues>) {
  const fieldError = errors[name];
  const errorMessage =
    fieldError && typeof fieldError.message === "string"
      ? fieldError.message
      : undefined;
  const accessibleName = inputProps?.accessibilityLabel ?? label;
  const announcedErrorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (Platform.OS !== "ios" || !errorMessage) {
      announcedErrorRef.current = errorMessage;
      return;
    }
    if (announcedErrorRef.current === errorMessage) {
      return;
    }
    announcedErrorRef.current = errorMessage;
    AccessibilityInfo.announceForAccessibility(errorMessage);
  }, [errorMessage]);

  return (
    <Wrapper direction="column" className="w-full ">
      {label && (
        <Text className="mb-1 font-bold" {...labelProps}>
          {label}
        </Text>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => {
          if (inputProps?.multiline) {
            return (
              <Textarea
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                accessibilityLabel={accessibleName}
                aria-invalid={!!errorMessage}
                {...inputProps}
              />
            );
          }

          return (
            <Input
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              accessibilityLabel={accessibleName}
              aria-invalid={!!errorMessage}
              {...inputProps}
            />
          );
        }}
      />
      {errorMessage ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-1 text-destructive"
          variant="small"
        >
          {errorMessage}
        </Text>
      ) : null}
    </Wrapper>
  );
}
