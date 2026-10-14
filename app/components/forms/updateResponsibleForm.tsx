import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { FieldShell } from "./fieldShell";
import { THEME } from "@/lib/theme";
import {
  updateProfileSchema,
  UpdateProfileDTO,
} from "@/lib/schemas/responsible";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CaretRightIcon,
  EnvelopeSimpleIcon,
  LockIcon,
  UserIcon,
} from "phosphor-react-native";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";

interface UpdateResponsibleFormProps {
  onSubmit: (profile: UpdateProfileDTO) => void | Promise<void>;
  onChangePassword: () => void;
  defaultName?: string;
  defaultEmail?: string;
}

export function UpdateResponsibleForm({
  onSubmit,
  onChangePassword,
  defaultName,
  defaultEmail,
}: UpdateResponsibleFormProps) {
  const colors = THEME.light;
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileDTO>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: defaultName || "",
      email: defaultEmail || "",
    },
  });

  return (
    <View className="w-full">
      <FieldShell label="Nome Completo" error={errors.name?.message}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Seu nome completo"
              autoCapitalize="words"
              autoCorrect={false}
            />
          )}
        />
        <UserIcon color={colors.primary500} weight="regular" />
      </FieldShell>

      <FieldShell label="E-mail" error={errors.email?.message}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Digite seu email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          )}
        />
        <EnvelopeSimpleIcon color={colors.primary500} weight="regular" />
      </FieldShell>

      <Pressable
        onPress={onChangePassword}
        className="mt-2 flex-row items-center rounded-xl bg-base-100 p-3 shadow-sm"
      >
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-base-200">
          <LockIcon color={colors.primary500} weight="bold"/>
        </View>
        <Text className="ml-3 flex-1 text-base font-medium">Alterar Senha</Text>
        <CaretRightIcon color={colors.primary500} weight="regular" />
      </Pressable>

      <Button
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isSubmitting}
        className="mt-10 w-full"
      >
        <Text>{isSubmitting ? "Salvando..." : "Salvar Alterações"}</Text>
      </Button>
    </View>
  );
}
