import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "@/components/card";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export function Signup() {
  const navigation = useNavigation();

  return (
    <ScrollView>
      <Wrapper
        className="w-full"
        direction="column"
        align="center"
        justify="center"
      >
        <Wrapper
          className="px-4 py-4 w-full bg-base-100"
          direction="column"
          gap={"gap-2"}
        >
          <Text className="mb-0" variant={"h2"}>
            Crie sua conta
          </Text>
          <Text className="mb-6 mt-0 text-muted">
            Acompanhe a saúde bucal do seu filho com a tecnologia e o carinho
            que ele merece.
          </Text>
          <Wrapper direction="column" className="w-full" gap={"gap-4"}>
            <Card
              icon={<AntDesign name="sync" size={24} color="gray" />}
              title="Sincronize seus dados"
            >
              Acesse o histórico dental em qualquer dispositivo, a qualquer
              momento.
            </Card>
            <Card
              icon={<Feather name="mail" size={24} color="gray" />}
              title="Atualizações por e-mail"
            >
              Receba relatórios do desenvolvimento do seu filho diretamente na
              sua caixa de entrada.
            </Card>
            <Card
              icon={<MaterialCommunityIcons name="book-open-page-variant-outline" size={24} color="gray" />}
              title="Conteúdo exclusivo"
            >
              Novos artigos e guias especializados em odontopediatria toda
              semana.
            </Card>
          </Wrapper>
        </Wrapper>

        <Wrapper
          className="px-4 w-full bg-base-100"
          direction="column"
          align="center"
          justify="center"
        >
          <Wrapper className="w-full" direction="column" gap={"gap-0"}>
            <Text className="mb-0" variant={"h2"}>
              Bem vindo à família
            </Text>
            <Text className="mb-6 mt-0 text-muted">
              Acompanhe a saúde bucal do seu filho com a tecnologia e o carinho
              que ele merece.
            </Text>
          </Wrapper>

          <Wrapper direction="column" className="w-full" gap={"gap-6"}>
            <Wrapper direction="column" className="w-full ">
              <Text className="uppercase">Nome do Responsável </Text>
              <Input placeholder="Digite seu nome completo" />
            </Wrapper>

            <Wrapper direction="column" className="w-full ">
              <Text className="uppercase">Email </Text>
              <Input placeholder="Digite seu email" />
            </Wrapper>

            <Wrapper direction="column" className="w-full">
              <Text className="uppercase">Senha </Text>
              <Input placeholder="Digite sua senha" />
            </Wrapper>

            <Wrapper direction="column" className="w-full">
              <Text className="uppercase">Confirme sua Senha </Text>
              <Input placeholder="Confirme sua senha" />
            </Wrapper>
          </Wrapper>

          <Separator className="my-4 max-w-5" />

          <Button className="w-full mb-4">
            <Text>Criar Conta</Text>
          </Button>

          <Text variant={"small"}>Já tem uma conta?</Text>
          <Button
            onPress={() => navigation.navigate("Login")}
            variant={"ghost"}
          >
            <Text>Entrar</Text>
          </Button>
        </Wrapper>
      </Wrapper>
    </ScrollView>
  );
}
