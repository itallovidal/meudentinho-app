import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatedCheckbox } from "./animatedCheckbox";
import { BirthDateInput } from "./birthDateInput";
import { ENV } from "@/lib/env";
import { ExternalLink } from "@/components/externalLink";
import { FeedbackSheet } from "@/components/feedbackSheet";
import { signupSchema, SignupFormValues } from "@/lib/schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormInput } from "../formInput";
import { ApiError } from "@/types/domain";
import { View } from "react-native";
import { useState } from "react";

interface ProfileFormProps {
  onSubmit: (data: SignupFormValues) => void | Promise<void>;
  submitError?: ApiError | null;
  defaultValues?: Partial<SignupFormValues>;
  submitLabel?: string;
  submittingLabel?: string;
}

export function ProfileForm({
  onSubmit,
  defaultValues,
  submitLabel = "Criar Conta",
  submittingLabel = "Criando conta...",
  submitError,
}: ProfileFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      accepted: false,
      guardianBirthDate: "",
      ...defaultValues,
    },
  });

  const [policyError, setPolicyError] = useState<string | null>(null);

  return (
    <Wrapper align="center" direction="column" className="w-full" gap={"gap-6"}>
      <FormInput
        control={control}
        errors={errors}
        name="name"
        label="Nome do Responsável"
        inputProps={{
          placeholder: "Digite seu nome completo",
          autoCapitalize: "words",
          autoCorrect: false,
        }}
      />

      <FormInput
        control={control}
        errors={errors}
        name="email"
        label="Email"
        inputProps={{
          placeholder: "Digite seu email",
          keyboardType: "email-address",
          autoCapitalize: "none",
          autoCorrect: false,
        }}
      />

      <Controller
        control={control}
        name="guardianBirthDate"
        render={({ field: { onChange, value } }) => (
          <BirthDateInput
            value={value}
            onChange={onChange}
            label="Sua Data de Nascimento"
            labelProps={{ className: "mb-1 font-bold" }}
            error={errors.guardianBirthDate?.message}
          />
        )}
      />

      <FormInput
        control={control}
        errors={errors}
        name="password"
        label="Senha"
        inputProps={{
          placeholder: "Digite sua senha",
          secureTextEntry: true,
          autoCapitalize: "none",
          autoCorrect: false,
        }}
      />

      <FormInput
        control={control}
        errors={errors}
        name="passwordConfirmation"
        label="Confirme sua Senha"
        inputProps={{
          placeholder: "Confirme sua senha",
          secureTextEntry: true,
          autoCapitalize: "none",
          autoCorrect: false,
        }}
      />

      <View className="w-full flex-row items-start gap-3">
        <View className="mt-0.5">
          <Controller
            control={control}
            name="accepted"
            render={({ field: { onChange, value } }) => (
              <AnimatedCheckbox
                checked={value}
                onChange={onChange}
                accessibilityLabel="Li e aceito a Política de Privacidade"
              />
            )}
          />
        </View>
        <Text className="flex-1 text-sm">
          Li e aceito a{" "}
          <ExternalLink
            href={ENV.PRIVACY_POLICY_URL}
            onError={() =>
              setPolicyError(
                "Não foi possível abrir a Política de Privacidade.",
              )
            }
            className="font-bold text-primary-500 underline"
          >
            Política de Privacidade
          </ExternalLink>{" "}
          e declaro ser responsável legal pelas crianças que cadastrar.
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

      <Separator className="my-4 max-w-5" />

      <Button
        onPress={() => void handleSubmit(onSubmit)()}
        disabled={isSubmitting || !isDirty}
        className="mb-4 w-full"
      >
        <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
      </Button>
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
