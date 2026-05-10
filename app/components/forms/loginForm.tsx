import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { loginSchema } from "@/lib/schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput } from "../formInput";
import { ApiError } from "@/types/domain";
import { LoginDTO } from "@/types/dtos/user";

interface Args {
  onSubmit: (data: LoginDTO) => void | Promise<void>;
  submitError?: ApiError | null;
}

export function LoginForm({ onSubmit, submitError }: Args) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO>({
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

      {submitError && (
        <Text className="text-red-600">{submitError.message}</Text>
      )}

      <Separator className="my-4 max-w-5" />

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="w-full mb-4"
      >
        <Text>{isSubmitting ? "Entrando..." : "Entrar"}</Text>
      </Button>
    </Wrapper>
  );
}
