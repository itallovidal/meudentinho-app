import { kidSchema, KidFormValues } from "@/lib/schemas/kid";
import { openPrivacyPolicy } from "@/lib/privacyPolicy";
import { ApiError } from "@/types/domain";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Wrapper } from "../wrapper";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { FormInput } from "../formInput";
import { Controller, useForm } from "react-hook-form";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { QuestionIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { AnimatedCheckbox } from "./animatedCheckbox";
import { GenderSelector } from "./genderSelector";
import { BirthDateInput } from "./birthDateInput";
import { PrematureWeeksSelector } from "./prematureWeeksSelector";

interface Props {
  onSubmit: (data: KidFormValues) => void | Promise<void>;
  submitError?: ApiError | null;
  defaultValues?: Partial<KidFormValues>;
  submitLabel?: string;
  submittingLabel?: string;
  footer?: ReactNode;
}

const SECTION_MAX_HEIGHT = 300;

export function RegisterKidForm({
  onSubmit,
  defaultValues,
  submitLabel = "Confirmar",
  submittingLabel = "Salvando...",
  submitError,
  footer,
}: Props) {
  const colors = THEME.light;
  const [isPremature, setIsPremature] = useState(
    Boolean(
      defaultValues?.prematureWeeks && defaultValues.prematureWeeks !== "0",
    ),
  );
  const sectionProgress = useSharedValue(isPremature ? 1 : 0);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<KidFormValues>({
    resolver: zodResolver(kidSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      birthDate: "",
      gender: "male",
      accepted: false,
      ...defaultValues,
    },
  });

  const gender = watch("gender");
  const birthDate = watch("birthDate");
  const prematureWeeksValue = watch("prematureWeeks");

  useEffect(() => {
    setIsPremature(
      Boolean(
        defaultValues?.prematureWeeks && defaultValues.prematureWeeks !== "0",
      ),
    );
  }, [defaultValues?.prematureWeeks]);

  useEffect(() => {
    if (prematureWeeksValue && prematureWeeksValue !== "0") {
      setIsPremature(true);
    }
  }, [prematureWeeksValue]);

  useEffect(() => {
    if (!isPremature) {
      setValue("prematureWeeks", undefined, { shouldDirty: true });
    }
  }, [isPremature, setValue]);

  useEffect(() => {
    sectionProgress.value = withTiming(isPremature ? 1 : 0, {
      duration: 180,
    });
  }, [isPremature, sectionProgress]);

  const sectionStyle = useAnimatedStyle(() => ({
    maxHeight: sectionProgress.value * SECTION_MAX_HEIGHT,
    opacity: sectionProgress.value,
  }));

  function changeGender(gender: "male" | "female") {
    setValue("gender", gender, { shouldDirty: true });
  }

  function togglePremature() {
    setIsPremature((previous) => !previous);
  }

  function chooseBirthDate(isoDate: string) {
    setValue("birthDate", isoDate, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function handleOpenPolicy() {
    const opened = await openPrivacyPolicy();
    if (!opened) {
      Alert.alert("Erro", "Não foi possível abrir a Política de Privacidade.");
    }
  }

  return (
    <Wrapper align="start" direction="column" gap="gap-4">
      <FormInput
        control={control}
        errors={errors}
        name="name"
        label="Nome do dependente"
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
          className: "flex-grow-1",
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

      <View className="w-full flex-row items-start gap-3">
        <View className="mt-0.5">
          <AnimatedCheckbox
            checked={isPremature}
            onChange={togglePremature}
            accessibilityLabel="A criança nasceu antes do tempo previsto?"
          />
        </View>
        <Pressable onPress={togglePremature} hitSlop={4} className="flex-1">
          <Text className="font-bold">
            A criança nasceu antes do tempo previsto?
          </Text>
        </Pressable>
        <Popover>
          <PopoverTrigger asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="O que é prematuridade?"
              accessibilityHint="Mostra a explicação sobre prematuridade"
              hitSlop={8}
            >
              <QuestionIcon size={22} color={colors.base400} weight="fill" />
            </Pressable>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-64 border-0 bg-transparent p-0 shadow-none"
          >
            <View className="rounded-2xl bg-base-400 px-4 py-3 shadow-lg">
              <Text className="text-sm leading-5 text-base-100">
                A prematuridade acontece quando o nascimento ocorre antes de 37
                semanas de gestação.
              </Text>
            </View>
          </PopoverContent>
        </Popover>
      </View>

      <Animated.View
        style={sectionStyle}
        className="w-full overflow-hidden"
        pointerEvents={isPremature ? "auto" : "none"}
        aria-hidden={!isPremature}
      >
        <View className="w-full flex-col gap-4">
          <View className="h-px w-full bg-base-300" />
          <Controller
            control={control}
            name="prematureWeeks"
            render={({ field: { onChange, value } }) => (
              <PrematureWeeksSelector
                value={value}
                onChange={onChange}
                error={errors.prematureWeeks?.message}
              />
            )}
          />
        </View>
      </Animated.View>

      <View className="w-full flex-row items-start gap-3">
        <View className="mt-0.5">
          <Controller
            control={control}
            name="accepted"
            render={({ field: { onChange, value } }) => (
              <AnimatedCheckbox
                checked={value}
                onChange={onChange}
                accessibilityLabel="Li e aceito a Política de Privacidade em nome desta criança"
              />
            )}
          />
        </View>
        <Text className="flex-1 text-sm">
          Li e aceito a{" "}
          <Text
            onPress={() => void handleOpenPolicy()}
            className="font-bold text-primary-500 underline"
          >
            Política de Privacidade
          </Text>{" "}
          em nome desta criança.
        </Text>
      </View>

      {errors.accepted ? (
        <Text className="text-destructive" variant="small">
          {errors.accepted.message}
        </Text>
      ) : null}

      {submitError && (
        <Text className="text-red-600">{submitError.message}</Text>
      )}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isDirty}
        className="mt-6 h-14 w-full rounded-full"
      >
        <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
      </Button>

      {footer}
    </Wrapper>
  );
}
