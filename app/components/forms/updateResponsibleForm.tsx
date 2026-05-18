import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import {
  updateResponsibleSchema,
  UpdateResponsibleDTO,
} from "@/lib/schemas/responsible";
import { FormInput } from "../formInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface UpdateResponsibleFormProps {
  onSubmit: (data: UpdateResponsibleDTO) => void | Promise<void>;
  defaultName?: string;
  defaultEmail?: string;
}

export function UpdateResponsibleForm({
  onSubmit,
  defaultName,
  defaultEmail
}: UpdateResponsibleFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateResponsibleDTO>({
    resolver: zodResolver(updateResponsibleSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: defaultName || "",
      email: defaultEmail || "",
      currentPassword: "",
      newPassword: "",
      passwordConfirmation: "",
    },
  });

  return (
    <Wrapper align="center" direction="column" className="w-full" gap="gap-4">
      <FormInput
        control={control}
        errors={errors}
        name="name"
        label="Nome do Responsável"
        inputProps={{
          placeholder: "Seu nome completo",
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
          autoCapitalize: "words",
          autoCorrect: false,
        }}
      />

      <FormInput
        control={control}
        errors={errors}
        name="currentPassword"
        label="Senha Atual"
        inputProps={{
          placeholder: "Digite sua senha atual",
          secureTextEntry: true,
          autoCapitalize: "none",
          autoCorrect: false,
        }}
      />

      <FormInput
        control={control}
        errors={errors}
        name="newPassword"
        label="Nova Senha"
        inputProps={{
          placeholder: "Digite sua nova senha",
          secureTextEntry: true,
          autoCapitalize: "none",
          autoCorrect: false,
        }}
      />

      <FormInput
        control={control}
        errors={errors}
        name="passwordConfirmation"
        label="Confirmar Senha"
        inputProps={{
          placeholder: "Confirme sua nova senha",
          secureTextEntry: true,
          autoCapitalize: "none",
          autoCorrect: false,
        }}
      />

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="mb-2 w-full"
      >
        <Text>{isSubmitting ? "Salvando..." : "Confirmar"}</Text>
      </Button>
    </Wrapper>
  );
}
