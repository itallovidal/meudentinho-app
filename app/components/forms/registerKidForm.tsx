import { kidSchema } from "@/lib/schemas/kid";
import { calculateAgeFromBirthDate } from "@/lib/utils";
import { ApiError } from "@/types/domain";
import { KidRequestDTO } from "@/types/dtos/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Wrapper } from "../wrapper";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { FormInput } from "../formInput";
import { Controller, useForm } from "react-hook-form";
import { CustomCalendar } from "../calendar";
import { Checkbox } from "expo-checkbox";

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
  submitLabel = "Registrar Criança",
  submittingLabel = "Registrando criança...",
  submitError,
}: Props) {
  const [isEditingBirthDate, setIsEditingBirthDate] = useState(
    !defaultValues?.birthDate,
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
      isPremature: false,
      parentId: "",
      ...defaultValues,
    },
  });

  const gender = watch("gender");
  const isPremature = watch("isPremature");
  const birthDate = watch("birthDate");

  useEffect(() => {
    if (!defaultValues?.birthDate) {
      setIsEditingBirthDate(true);
      return;
    }

    setIsEditingBirthDate(false);
  }, [defaultValues?.birthDate]);

  useEffect(() => {
    if (!isPremature) {
      setValue("prematureWeeks", undefined);
    }
  }, [isPremature, setValue]);

  const calculatedAge = calculateAgeFromBirthDate(birthDate);
  const ageValue = calculatedAge === null ? "" : String(calculatedAge);

  function changeGender(gender: "male" | "female") {
    setValue("gender", gender, { shouldDirty: true });
  }

  function chooseBirthDate(date: string) {
    setValue("birthDate", date, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setIsEditingBirthDate(false);
  }

  return (
    <Wrapper align="start" direction="row" className="flex-wrap" gap={"gap-6"}>
      <FormInput
        control={control}
        errors={errors}
        name="name"
        label="Nome da Criança"
        inputProps={{
          placeholder: "Digite o nome da criança",
          autoCorrect: false,
          style: {
            width: "100%",
          },
          className: "bg-white flex-grow-1",
        }}
      />

      <Text className="w-full font-bold">Gênero</Text>

      <Wrapper
        direction="row"
        align="start"
        justify="start"
        gap="gap-2"
        className="w-full flex-wrap"
      >
        {["male", "female"].map((g) => (
          <Button
            variant={gender === g ? "default" : "outline"}
            key={g}
            onPress={() => changeGender(g as "male" | "female")}
          >
            <Text>{g === "male" ? "M" : "F"}</Text>
          </Button>
        ))}
      </Wrapper>

      <Wrapper direction="column" className="w-full" gap="gap-2">
        <Text className="font-bold">Idade</Text>
        <Input editable={false} value={ageValue} placeholder="Anos" />
        <Text className="text-base-500" variant="small">
          Data de nascimento:{" "}
          {birthDate
            ? (() => {
                const [y, m, d] = birthDate.split("T")[0].split("-");
                return `${d}/${m}/${y}`;
              })()
            : "não informada"}
        </Text>
        <Button
          onPress={() => setIsEditingBirthDate((currentValue) => !currentValue)}
          variant="outline"
        >
          <Text>
            {isEditingBirthDate
              ? "Fechar calendário"
              : "Alterar data de nascimento"}
          </Text>
        </Button>
      </Wrapper>

      {isEditingBirthDate && (
        <CustomCalendar onDayPress={(day) => chooseBirthDate(day.dateString)} />
      )}

      <Wrapper direction="row" align="center" justify="start" gap="gap-2">
        <Checkbox
          value={isPremature}
          onValueChange={(checked: boolean) =>
            setValue("isPremature", checked, { shouldDirty: true })
          }
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
              <Text className="mb-1 font-bold">
                Semanas de Prematuridade
              </Text>
              <Input
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
                placeholder="Número de semanas"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                className="bg-white w-full"
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
        className="w-full mb-4"
      >
        <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
      </Button>
    </Wrapper>
  );
}
