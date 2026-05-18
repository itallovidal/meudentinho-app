import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LoginForm } from "@/components/forms/loginForm";
import { loginUser } from "@/api/user/loginUser";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { ApiError } from "@/types/domain";
import { useCallback, useContext, useEffect, useState } from "react";
import { LoginRequest } from "@/types/dtos/user";
import { UserContext } from "@/contexts/UserContext";

export function Login() {
  const navigation = useNavigation<ProfileNavegationProp>();
  const [error, setError] = useState<ApiError | null>(null);
  const { updateAppUser, user } = useContext(UserContext)!;

  useFocusEffect(
    useCallback(() => {
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Index", params: { payload: user } }],
        });
      }
    }, [user]),
  );

  async function onLogin(LoginRequest: LoginRequest) {
    try {
      const { data } = await loginUser(LoginRequest);

      console.log("Login successful, user data:", data);

      const basicUser = {
        name: data.name,
        email: LoginRequest.email,
        isAdmin: data.isAdmin,
      };

      updateAppUser(basicUser, data.token);

      navigation.reset({
        index: 0,
        routes: [{ name: "Index", params: { payload: basicUser } }],
      });
    } catch (err: unknown) {
      console.log("Login error:", err);
      if (err instanceof ApiError) {
        setError(err);
        return;
      }
    }
  }

  return (
    <Wrapper
      className="w-full flex-1 bg-base-100 px-4"
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

      <Text variant={"small"}>Não possui uma conta?</Text>
      <Button onPress={() => navigation.navigate("Signup")} variant={"ghost"}>
        <Text>Registrar-se</Text>
      </Button>
    </Wrapper>
  );
}
