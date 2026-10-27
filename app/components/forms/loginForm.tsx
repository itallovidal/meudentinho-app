import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { loginSchema } from "@/lib/schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput } from "../formInput";
import { ApiError } from "@/types/domain";
import type { LoginRequest } from "@/types/dtos/user";

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => void | Promise<void>;
  submitError?: ApiError | null;
}

export function LoginForm({ onSubmit, submitError }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Wrapper align="center" direction="column" className="w-full" gap={"gap-6"}>
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
          autoComplete: "email",
          returnKeyType: "next",
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
          autoComplete: "current-password",
          returnKeyType: "go",
          onSubmitEditing: () => void handleSubmit(onSubmit)(),
        }}
      />

      {submitError && (
        <Text className="text-destructive">{submitError.message}</Text>
      )}

      <Separator className="my-4 max-w-5" />

      <Button
        onPress={() => void handleSubmit(onSubmit)()}
        disabled={isSubmitting || !isDirty}
        className="mb-4 w-full"
      >
        <Text>{isSubmitting ? "Entrando..." : "Entrar"}</Text>
      </Button>
    </Wrapper>
  );
}
