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

type InputProps = ComponentProps<typeof Input>;

interface FormInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  inputProps?: Omit<InputProps, "onBlur" | "onChangeText" | "value">;
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  errors,
  name,
  label,
  inputProps,
}: FormInputProps<TFieldValues>) {
  const fieldError = errors[name];
  const errorMessage =
    fieldError && typeof fieldError.message === "string"
      ? fieldError.message
      : undefined;

  return (
    <Wrapper direction="column" className="w-full ">
      <Text className="uppercase">{label} </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            {...inputProps}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errorMessage ? (
        <Text className="mt-1 text-destructive" variant="small">
          {errorMessage}
        </Text>
      ) : null}
    </Wrapper>
  );
}
