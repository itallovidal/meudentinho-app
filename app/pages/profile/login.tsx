import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@react-navigation/native";
import { LoginForm } from "@/components/forms/loginForm";

export function Login() {
  const navigation = useNavigation();

  return (
    <Wrapper
      className="flex-1 px-4 w-full bg-base-100"
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

      <LoginForm />

      <Text variant={"small"}>Não possui uma conta?</Text>
      <Button onPress={() => navigation.navigate("Signup")} variant={"ghost"}>
        <Text>Registrar-se</Text>
      </Button>
    </Wrapper>
  );
}
