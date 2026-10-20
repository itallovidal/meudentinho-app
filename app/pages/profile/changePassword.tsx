import { changePassword } from "@/api/user/changePassword";
import { Header } from "@/components/header";
import { PasswordField } from "@/components/forms/passwordField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { errorMessage } from "@/lib/errorMessage";
import {
  updatePasswordSchema,
  UpdatePasswordDTO,
} from "@/lib/schemas/responsible";
import { getUserIdFromToken } from "@/lib/utils";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect } from "react";
import { Alert, Image, ScrollView, View } from "react-native";
import { useForm } from "react-hook-form";

export function ChangePassword() {
  const {
    user,
    authToken,
    hydrated,
    updateAppUser,
    userId: contextUserId,
  } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
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
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
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

      const { data: session } = await changePassword(userId, authToken, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (!session?.token) {
        await updateAppUser(null, null);
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }

      await updateAppUser(
        {
          name: session.name ?? user?.name ?? "",
          email: user?.email ?? "",
          isAdmin: session.isAdmin ?? user?.isAdmin ?? false,
        },
        session.token,
        session.refreshToken ?? null,
        session.userId ?? null,
      );

      Alert.alert("Senha atualizada", "Sua senha foi alterada com sucesso.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        "Erro",
        errorMessage(error, "Não foi possível alterar a senha."),
      );
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
          • Mínimo de 8 caracteres
        </Text>

        <Button
          onPress={() => handleSubmit(onSubmit)()}
          disabled={isSubmitting || !isDirty}
          className="w-full"
        >
          <Text>{isSubmitting ? "Atualizando..." : "Atualizar Senha"}</Text>
        </Button>
      </ScrollView>
    </Wrapper>
  );
}
