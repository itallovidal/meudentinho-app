import { changePassword } from "@/api/user/changePassword";
import { FieldShell } from "@/components/forms/fieldShell";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import {
  updatePasswordSchema,
  UpdatePasswordDTO,
} from "@/lib/schemas/responsible";
import { THEME } from "@/lib/theme";
import { getUserIdFromToken } from "@/lib/utils";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { EyeIcon, EyeSlashIcon } from "phosphor-react-native";
import { useContext, useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, View } from "react-native";
import { Control, Controller, useForm, useWatch } from "react-hook-form";

interface PasswordFieldProps {
  control: Control<UpdatePasswordDTO>;
  name: keyof UpdatePasswordDTO;
  label: string;
  placeholder: string;
  error?: string;
  revealOnInput?: boolean;
}

function PasswordField({
  control,
  name,
  label,
  placeholder,
  error,
  revealOnInput = false,
}: PasswordFieldProps) {
  const colors = THEME.light;
  const [isVisible, setIsVisible] = useState(false);
  const currentValue = useWatch({ control, name });
  const showToggle = !revealOnInput || currentValue.length > 0;

  return (
    <FieldShell label={label} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={placeholder}
            secureTextEntry={!isVisible}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />
      {showToggle && (
        <Pressable onPress={() => setIsVisible((v) => !v)} hitSlop={8}>
          {isVisible ? (
            <EyeIcon color={colors.primary500} weight="regular"/>
          ) : (
            <EyeSlashIcon color={colors.primary500} weight="regular" />
          )}
        </Pressable>
      )}
    </FieldShell>
  );
}

export function ChangePassword() {
  const {
    authToken,
    hydrated,
    userId: contextUserId,
  } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  useEffect(() => {
    if (hydrated && !authToken) {
      navigation.navigate("Login");
    }
  }, [hydrated, authToken, navigation]);

  async function onSubmit(data: UpdatePasswordDTO) {
    if (!authToken) {
      Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
      return;
    }

    try {
      const userId =
        contextUserId ?? (authToken ? getUserIdFromToken(authToken) : null);
      if (!userId) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      await changePassword(userId, authToken, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      Alert.alert("Senha atualizada", "Sua senha foi alterada com sucesso.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar a senha.");
    }
  }

  if (!hydrated) {
    return (
      <Wrapper
        className="flex-1 bg-base-100"
        direction="column"
        align="center"
        justify="start"
        gap="gap-0"
      >
        <Header hasBackButton />
        <Text>Carregando...</Text>
      </Wrapper>
    );
  }

  if (!authToken) {
    return null;
  }

  return (
    <Wrapper
      className="flex-1 bg-base-100"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 28 }}
        className="w-full"
      >
        <View className="items-center">
          <Image
            source={require("../../../assets/lock.png")}
            className="h-36 w-36"
            resizeMode="contain"
          />
          <Text className="mt-4 text-center text-2xl font-bold">
            Alterar Senha
          </Text>
          <Text className="mb-8 mt-1 text-center text-muted">
            Crie uma nova senha de acesso forte e segura.
          </Text>
        </View>

        <PasswordField
          control={control}
          name="currentPassword"
          label="Senha Atual"
          placeholder="Digite sua senha atual"
          error={errors.currentPassword?.message}
          revealOnInput
        />
        <PasswordField
          control={control}
          name="newPassword"
          label="Nova Senha"
          placeholder="Digite sua nova senha"
          error={errors.newPassword?.message}
          revealOnInput
        />
        <PasswordField
          control={control}
          name="passwordConfirmation"
          label="Confirmar Senha"
          placeholder="Confirme sua nova senha"
          error={errors.passwordConfirmation?.message}
          revealOnInput
        />

        <Text className="mb-8 text-sm text-muted">
          • Mínimo de 6 caracteres
        </Text>

        <Button
          onPress={() => handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          className="w-full"
        >
          <Text>{isSubmitting ? "Atualizando..." : "Atualizar Senha"}</Text>
        </Button>
      </ScrollView>
    </Wrapper>
  );
}
