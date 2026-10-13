import { kidSchema } from "@/lib/schemas/kid";
import { ApiError } from "@/types/domain";
import { KidRequestDTO } from "@/types/dtos/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Wrapper } from "../wrapper";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { FormInput } from "../formInput";
import { Controller, useForm } from "react-hook-form";
import { Checkbox } from "expo-checkbox";
import { GenderSelector } from "./genderSelector";
import { BirthDateInput } from "./birthDateInput";

interface Props {
  onSubmit: (data: KidRequestDTO) => void | Promise<void>;
  submitError?: ApiError | null;
  defaultValues?: Partial<KidRequestDTO>;
  submitLabel?: string;
  submittingLabel?: string;
}

export function RegisterKidForm({
  onSubmit,
  defaultValues,
  submitLabel = "Confirmar",
  submittingLabel = "Salvando...",
  submitError,
}: Props) {
  const [isPremature, setIsPremature] = useState(
    Boolean(
      defaultValues?.prematureWeeks && defaultValues.prematureWeeks !== "0",
    ),
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<KidRequestDTO>({
    resolver: zodResolver(kidSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      birthDate: "",
      gender: "male",
      ...defaultValues,
    },
  });

  const gender = watch("gender");
  const birthDate = watch("birthDate");

  useEffect(() => {
    setIsPremature(
      Boolean(
        defaultValues?.prematureWeeks && defaultValues.prematureWeeks !== "0",
      ),
    );
  }, [defaultValues?.prematureWeeks]);

  useEffect(() => {
    if (!isPremature) {
      setValue("prematureWeeks", undefined);
    }
  }, [isPremature, setValue]);

  function changeGender(gender: "male" | "female") {
    setValue("gender", gender, { shouldDirty: true });
  }

  function chooseBirthDate(isoDate: string) {
    setValue("birthDate", isoDate, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  return (
    <Wrapper align="start" direction="column" gap="gap-4">
      <FormInput
        control={control}
        errors={errors}
        name="name"
        label="Nome da criança"
        labelProps={{
          className:
            "mb-1 text-xs font-semibold uppercase tracking-wide text-primary-400",
        }}
        inputProps={{
          placeholder: "Ex: Lucas Silva",
          autoCorrect: false,
          style: {
            width: "100%",
          },
          className: "flex-grow-1 bg-white",
        }}
      />

      <View className="w-full flex-row gap-3">
        <View className="flex-1">
          <BirthDateInput
            value={birthDate}
            onChange={chooseBirthDate}
            error={errors.birthDate?.message as string | undefined}
          />
        </View>
        <View className="flex-1">
          <GenderSelector gender={gender} onChange={changeGender} />
        </View>
      </View>

      <Wrapper direction="row" align="center" justify="start" gap="gap-2">
        <Checkbox
          value={isPremature}
          onValueChange={(checked: boolean) => setIsPremature(checked)}
          color={isPremature ? "#4630EB" : undefined}
        />
        <Text className="font-bold">A criança nasceu prematura?</Text>
      </Wrapper>

      {isPremature && (
        <Controller
          control={control}
          name="prematureWeeks"
          render={({ field: { onChange, onBlur, value } }) => (
            <Wrapper direction="column" className="w-full">
              <Text className="mb-1 font-bold">Semanas de Prematuridade</Text>
              <Input
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
                placeholder="Número de semanas"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                className="w-full bg-white"
              />
              {errors.prematureWeeks?.message && (
                <Text className="mt-1 text-destructive" variant="small">
                  {String(errors.prematureWeeks.message)}
                </Text>
              )}
            </Wrapper>
          )}
        />
      )}

      {submitError && (
        <Text className="text-red-600">{submitError.message}</Text>
      )}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="h-14 w-full rounded-xl"
      >
        <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
      </Button>
    </Wrapper>
  );
}
