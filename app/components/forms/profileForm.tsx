import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signupSchema } from "@/lib/schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput } from "../formInput";
import { SignupDTO } from "@/types/dtos/user";
import { ApiError } from "@/types/domain";

interface ProfileFormProps {
  onSubmit: (data: SignupDTO) => void | Promise<void>;
  submitError?: ApiError | null;
  defaultValues?: Partial<SignupDTO>;
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
    formState: { errors, isSubmitting },
  } = useForm<SignupDTO>({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      ...defaultValues,
    },
  });

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

      {submitError && (
        <Text className="text-red-600">{submitError.message}</Text>
      )}

      <Separator className="my-4 max-w-5" />

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
