import { loginReturnPath } from "@/navigation/linking";
import { changePassword } from "@/api/user/changePassword";
import { Header } from "@/components/header";
import { FeedbackSheet } from "@/components/feedbackSheet";
import { PasswordField } from "@/components/forms/passwordField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { errorMessage } from "@/lib/errorMessage";
import { isApiError } from "@/types/predicates";
import { ApiError } from "@/types/domain";
import {
  updatePasswordSchema,
  UpdatePasswordDTO,
} from "@/lib/schemas/responsible";
import { getUserIdFromToken } from "@/lib/utils";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { Image, Keyboard, ScrollView, View } from "react-native";
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
  const [feedback, setFeedback] = useState<{
    title: string;
    message: string;
    next: "login" | "back" | null;
  } | null>(null);

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
    if (hydrated && !authToken && !feedback) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login", params: { returnTo: loginReturnPath() } }],
      });
    }
  }, [hydrated, authToken, feedback, navigation]);

  async function onSubmit(data: UpdatePasswordDTO) {
    Keyboard.dismiss();
    if (!authToken) {
      setFeedback({
        title: "Sessão expirada",
        message: "Faça login novamente.",
        next: "login",
      });
      return;
    }

    try {
      const userId =
        contextUserId ?? (authToken ? getUserIdFromToken(authToken) : null);
      if (!userId) {
        setFeedback({
          title: "Sessão expirada",
          message: "Faça login novamente.",
          next: "login",
        });
        return;
      }

      const { data: session } = await changePassword(userId, authToken, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (!session?.token) {
        throw new ApiError(
          "A senha foi atualizada, mas não foi possível iniciar uma nova sessão. Entre novamente com a nova senha.",
          "RESPONSE_PARSE_ERROR",
        );
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

      setFeedback({
        title: "Senha atualizada",
        message: "Sua senha foi alterada com sucesso.",
        next: "back",
      });
    } catch (error) {
      const sessionFailed =
        isApiError(error) &&
        ((error.status !== undefined && error.status >= 500) ||
          error.code === "RESPONSE_PARSE_ERROR" ||
          error.code === "SESSION_STORAGE_ERROR");
      setFeedback({
        title: "Não foi possível concluir a operação",
        message: sessionFailed
          ? "A alteração da senha pode ter sido concluída, mas não foi possível confirmar sua nova sessão. Entre novamente; se a senha antiga não funcionar, use a nova senha."
          : errorMessage(error, "Não foi possível alterar a senha."),
        next: sessionFailed ? "login" : null,
      });
    }
  }

  async function closeFeedback() {
    if (feedback?.next === "login") {
      try {
        await updateAppUser(null, null);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } catch (error) {
        setFeedback({
          title: "Não foi possível encerrar a sessão",
          message: errorMessage(error, "Tente novamente."),
          next: "login",
        });
        return;
      }
    } else if (feedback?.next === "back") {
      navigation.goBack();
    }
    setFeedback(null);
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

  if (!authToken && !feedback) {
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
          <Text className="mb-8 mt-1 text-center text-muted-foreground">
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

        <Text className="mb-8 text-sm text-muted-foreground">
          • Mínimo de 8 caracteres
        </Text>

        <Button
          onPress={() => handleSubmit(onSubmit)()}
          disabled={isSubmitting || !isDirty || !authToken}
          className="w-full"
        >
          <Text>{isSubmitting ? "Atualizando..." : "Atualizar Senha"}</Text>
        </Button>
      </ScrollView>
      <FeedbackSheet
        title={feedback?.title ?? ""}
        message={feedback?.message ?? null}
        onClose={() => void closeFeedback()}
      />
    </Wrapper>
  );
}
