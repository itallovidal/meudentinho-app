import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";

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

      <Wrapper direction="column" className="w-full" gap={"gap-6"}>
        <Wrapper direction="column" className="w-full ">
          <Text className="uppercase">Email </Text>
          <Input placeholder="Digite seu email" />
        </Wrapper>

        <Wrapper direction="column" className="w-full">
          <Text className="uppercase">Senha </Text>
          <Input placeholder="Digite sua senha" />
        </Wrapper>
      </Wrapper>

      <Separator className="my-4 max-w-5" />

      <Button className="w-full mb-4">
        <Text>Entrar</Text>
      </Button>

      <Text variant={"small"}>Não possui uma conta?</Text>
      <Button onPress={() => navigation.navigate("Signup")} variant={"ghost"}>
        <Text>Registrar-se</Text>
      </Button>
    </Wrapper>
  );
}
