import { kidSchema } from "@/lib/schemas/kid";
import { ApiError } from "@/types/domain";
import { KidRequestDTO } from "@/types/dtos/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
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
  onSubmit: (data: KidRequestDTO) => void | Promise<void>;
  submitError?: ApiError | null;
  defaultValues?: Partial<KidRequestDTO>;
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

      {submitError && (
        <Text className="text-red-600">{submitError.message}</Text>
      )}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="h-14 w-full rounded-full mt-6"
      >
        <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
      </Button>

      {footer}
    </Wrapper>
  );
}
