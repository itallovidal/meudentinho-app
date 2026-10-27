import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
  useLinkTo,
} from "@react-navigation/native";
import { LoginForm } from "@/components/forms/loginForm";
import {
  ProfileNavegationProp,
  ProfileRouteParams,
} from "@/navigation/ProfileStack";
import { ApiError } from "@/types/domain";
import { useCallback, useContext, useState } from "react";
import type { LoginRequest } from "@/types/dtos/user";
import { UserContext } from "@/contexts/UserContext";
import { errorMessage } from "@/lib/errorMessage";
import { safeReturnPath } from "@/navigation/linking";
import { login } from "@/api/auth/login";

export function Login() {
  const navigation = useNavigation<ProfileNavegationProp>();
  const route = useRoute<RouteProp<ProfileRouteParams, "Login">>();
  const linkTo = useLinkTo();
  const [error, setError] = useState<ApiError | null>(null);
  const {
    updateAppUser,
    user,
    authToken,
    hydrated,
    sessionExpired,
    clearSessionExpired,
  } = useContext(UserContext)!;

  useFocusEffect(
    useCallback(() => {
      if (hydrated && user && authToken) {
        const returnTo = safeReturnPath(route.params?.returnTo);
        if (returnTo) {
          linkTo(returnTo);
          return;
        }
        navigation.reset({
          index: 0,
          routes: [{ name: "Index" }],
        });
        const origin = route.params?.fromTab;
        if (origin) {
          navigation.getParent()?.navigate(origin);
        }
      }
    }, [
      hydrated,
      user,
      authToken,
      navigation,
      route.params?.fromTab,
      route.params?.returnTo,
      linkTo,
    ]),
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
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err);
        return;
      }
      setError(
        new ApiError(
          errorMessage(
            err,
            "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
          ),
          "NETWORK_ERROR",
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
          <Text className="mb-6 mt-0 text-muted-foreground">
            Por favor, faça login para continuar
          </Text>
        </Wrapper>

        {sessionExpired && !error && (
          <Wrapper
            className="mb-4 w-full rounded-xl bg-base-200 p-3"
            direction="column"
            align="center"
            justify="center"
          >
            <Text className="text-center text-destructive">
              Sessão expirada. Faça login novamente.
            </Text>
          </Wrapper>
        )}

        <LoginForm submitError={error} onSubmit={onLogin} />

        <Text variant={"small"}>Não possui uma conta?</Text>
        <Button
          onPress={() =>
            navigation.navigate("Signup", {
              fromTab: route.params?.fromTab,
              returnTo: route.params?.returnTo,
            })
          }
          variant={"ghost"}
        >
          <Text>Registrar-se</Text>
        </Button>
      </Wrapper>
    </Wrapper>
  );
}
