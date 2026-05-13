import { kidSchema } from "@/lib/schemas/kid";
import { ApiError } from "@/types/domain";
import { RequestKidDTO } from "@/types/dtos/kid";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wrapper } from "../wrapper";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { FormInput } from "../formInput";
import { useForm } from "react-hook-form";
import { CustomCalendar } from "../calendar";
import { Checkbox } from "expo-checkbox";

interface Props {
  onSubmit: (data: RequestKidDTO) => void | Promise<void>;
  submitError?: ApiError | null;
  defaultValues?: Partial<RequestKidDTO>;
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
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestKidDTO>({
    resolver: zodResolver(kidSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      birthDate: "",
      gender: "male",
      isPremature: false,
      ...defaultValues,
    },
  });

  const gender = watch("gender");
  const isPremature = watch("isPremature");

  function changeGender(gender: "male" | "female") {
    setValue("gender", gender, { shouldDirty: true });
  }

  function chooseBirthDate(date: string) {
    setValue("birthDate", date, { shouldDirty: true });
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

      <Text className="w-full font-bold">Data de Nascimento</Text>

      <CustomCalendar onDayPress={(day) => chooseBirthDate(day.dateString)} />

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
        <FormInput
          control={control}
          errors={errors}
          name="prematureWeeks"
          label="Semanas de Prematuridade"
          inputProps={{
            placeholder: "Número de semanas",
            autoCapitalize: "none",
            autoCorrect: false,
            className: "bg-white w-full",
          }}
        />
      )}

      {submitError && (
        <Text className="text-red-600">{submitError.message}</Text>
      )}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="mb-4 w-full"
      >
        <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
      </Button>
    </Wrapper>
  );
}
