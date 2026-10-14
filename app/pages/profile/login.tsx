import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LoginForm } from "@/components/forms/loginForm";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { ApiError } from "@/types/domain";
import { useCallback, useContext, useState } from "react";
import { LoginRequest } from "@/types/dtos/user";
import { UserContext } from "@/contexts/UserContext";
import { login } from "@/api/auth/login";

export function Login() {
  const navigation = useNavigation<ProfileNavegationProp>();
  const [error, setError] = useState<ApiError | null>(null);
  const { updateAppUser, user, authToken, hydrated, sessionExpired, clearSessionExpired } = useContext(UserContext)!;

  useFocusEffect(
    useCallback(() => {
      if (hydrated && user && authToken) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Index", params: { payload: user } }],
        });
      }
    }, [hydrated, user, authToken, navigation]),
  );

  async function onLogin(LoginRequest: LoginRequest) {
    setError(null);
    clearSessionExpired();
    try {
      const { data } = await login(LoginRequest);

      const responseEmail =
        (data as unknown as { email?: string }).email ?? LoginRequest.email;
      const basicUser = {
        name: data.name,
        email: responseEmail,
        isAdmin: data.isAdmin,
      };

      await updateAppUser(
        basicUser,
        data.token,
        data.refreshToken ?? null,
        data.userId ?? null,
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "Index", params: { payload: basicUser } }],
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err);
        return;
      }
      setError(
        new ApiError(
          "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
          "INTERNAL_SERVER_ERROR",
        ),
      );
    }
  }

  return (
    <Wrapper
      className="w-full flex-1 bg-base-100"
      direction="column"
      align="center"
      justify="start"
    >
      <Header hasBackButton />

      <Wrapper
        className="w-full flex-1 px-6"
        direction="column"
        align="center"
        justify="center"
      >
      <Wrapper className="w-full" direction="column" gap={"gap-0"}>
        <Text className="mb-0" variant={"h2"}>
          Bem vindo de volta!
        </Text>
        <Text className="mb-6 mt-0 text-muted">
          Por favor, faça login para continuar
        </Text>
      </Wrapper>

      <LoginForm submitError={error} onSubmit={onLogin} />

      {sessionExpired && !error && (
        <Text className="mb-2 text-center text-red-600">
          Sessão expirada. Faça login novamente.
        </Text>
      )}

      <Text variant={"small"}>Não possui uma conta?</Text>
      <Button onPress={() => navigation.navigate("Signup")} variant={"ghost"}>
        <Text>Registrar-se</Text>
      </Button>
      </Wrapper>
    </Wrapper>
  );
}
