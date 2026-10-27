import { kidSchema, kidEditSchema, KidFormValues } from "@/lib/schemas/kid";
import { getPrivacyPolicyUrl } from "@/lib/privacyPolicy";
import { ExternalLink } from "@/components/externalLink";
import { FeedbackSheet } from "@/components/feedbackSheet";
import { ApiError } from "@/types/domain";
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
import { InfoPopover } from "../infoPopover";
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
  popoverHost?: string;
  isEditing?: boolean;
}

const SECTION_MAX_HEIGHT = 300;

export function RegisterKidForm({
  onSubmit,
  defaultValues,
  submitLabel = "Confirmar",
  submittingLabel = "Salvando...",
  submitError,
  footer,
  popoverHost,
  isEditing = false,
}: Props) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<KidFormValues>({
    resolver: zodResolver(isEditing ? kidEditSchema : kidSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      birthDate: "",
      isPremature: Boolean(
        defaultValues?.prematureWeeks && defaultValues.prematureWeeks !== "0",
      ),
      accepted: false,
      ...defaultValues,
    },
  });

  const gender = watch("gender");
  const birthDate = watch("birthDate");
  const isPremature = watch("isPremature");
  const sectionProgress = useSharedValue(isPremature ? 1 : 0);

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
    setValue("gender", gender, { shouldDirty: true, shouldValidate: true });
  }

  function togglePremature() {
    setValue("isPremature", !isPremature, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("prematureWeeks", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function chooseBirthDate(isoDate: string) {
    setValue("birthDate", isoDate, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  const [policyError, setPolicyError] = useState<string | null>(null);

  return (
    <Wrapper align="start" direction="column" gap="gap-4">
      <FormInput
        control={control}
        errors={errors}
        name="name"
        label="Nome do dependente"
        labelProps={{
          className:
            "mb-1 text-xs font-semibold uppercase tracking-wide text-primary",
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
        <View className="min-w-0 flex-1">
          <BirthDateInput
            value={birthDate}
            onChange={chooseBirthDate}
            error={errors.birthDate?.message as string | undefined}
          />
        </View>
        <View className="min-w-0 flex-1">
          <GenderSelector gender={gender} onChange={changeGender} />
          {errors.gender ? (
            <Text className="text-destructive" variant="small">
              {errors.gender.message}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="w-full flex-row items-start gap-3">
        <View className="mt-0.5">
          <AnimatedCheckbox
            checked={!!isPremature}
            onChange={togglePremature}
            accessibilityLabel="A criança nasceu antes do tempo previsto?"
          />
        </View>
        <Pressable onPress={togglePremature} hitSlop={4} className="flex-1">
          <Text className="font-bold">
            A criança nasceu antes do tempo previsto?
          </Text>
        </Pressable>
        <InfoPopover
          accessibilityLabel="O que é prematuridade?"
          accessibilityHint="Mostra a explicação sobre prematuridade"
          message="A prematuridade acontece quando o nascimento ocorre antes de 37 semanas de gestação."
          portalHost={popoverHost}
        />
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

      {!isEditing ? (
        <>
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
              <ExternalLink
                href={getPrivacyPolicyUrl()}
                onError={() =>
                  setPolicyError(
                    "Não foi possível abrir a Política de Privacidade.",
                  )
                }
                className="font-bold text-primary-500 underline"
              >
                Política de Privacidade
              </ExternalLink>{" "}
              em nome desta criança.
            </Text>
          </View>

          {errors.accepted ? (
            <Text className="text-destructive" variant="small">
              {errors.accepted.message}
            </Text>
          ) : null}
        </>
      ) : null}

      {submitError && (
        <Text className="text-destructive">{submitError.message}</Text>
      )}

      <Button
        onPress={() => void handleSubmit(onSubmit)()}
        disabled={isSubmitting || !isDirty}
        className="mt-6 h-14 w-full rounded-full"
      >
        <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
      </Button>

      {footer}
      {policyError ? (
        <FeedbackSheet
          title="Não foi possível abrir o link"
          message={policyError}
          onClose={() => setPolicyError(null)}
        />
      ) : null}
    </Wrapper>
  );
}
