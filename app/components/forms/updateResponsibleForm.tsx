import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import {
  updatePasswordSchema,
  updateProfileSchema,
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from "@/lib/schemas/responsible";
import { FormInput } from "../formInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";

interface UpdateResponsibleFormProps {
  onSubmit: (
    profile: UpdateProfileDTO,
    password: UpdatePasswordDTO | null,
  ) => void | Promise<void>;
  defaultName?: string;
  defaultEmail?: string;
}

export function UpdateResponsibleForm({
  onSubmit,
  defaultName,
  defaultEmail,
}: UpdateResponsibleFormProps) {
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch: profileWatch,
  } = useForm<UpdateProfileDTO>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: defaultName || "",
      email: defaultEmail || "",
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting },
    watch: passwordWatch,
  } = useForm<UpdatePasswordDTO>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      passwordConfirmation: "",
    },
  });

  function handleConfirm() {
    handleProfileSubmit((profileData) => {
      const newPassword = passwordWatch("newPassword");
      const passwordConfirmation = passwordWatch("passwordConfirmation");
      const currentPassword = passwordWatch("currentPassword");

      const hasPasswordChange =
        newPassword && newPassword.length > 0 && newPassword === passwordConfirmation;

      const passwordData: UpdatePasswordDTO | null = hasPasswordChange
        ? {
            currentPassword,
            newPassword,
            passwordConfirmation,
          }
        : null;

      onSubmit(profileData, passwordData);
    })();
  }

  return (
    <Wrapper
      align="center"
      direction="column"
      className="w-full"
      gap="gap-4"
    >
      <FormInput
        control={profileControl}
        errors={profileErrors}
        name="name"
        label="Seu Nome"
        inputProps={{
          placeholder: "Seu nome completo",
          autoCapitalize: "words",
          autoCorrect: false,
        }}
      />

      <FormInput
        control={profileControl}
        errors={profileErrors}
        name="email"
        label="Email"
        inputProps={{
          placeholder: "Digite seu email",
          autoCapitalize: "words",
          autoCorrect: false,
        }}
      />

      <View className="w-full h-px bg-base-300 my-2" />

      <FormInput
        control={passwordControl}
        errors={passwordErrors}
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
        control={passwordControl}
        errors={passwordErrors}
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
        control={passwordControl}
        errors={passwordErrors}
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
        onPress={handleConfirm}
        disabled={isSubmitting}
        className="mb-2 w-full"
      >
        <Text>{isSubmitting ? "Salvando..." : "Confirmar"}</Text>
      </Button>
    </Wrapper>
  );
}
