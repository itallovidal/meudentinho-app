import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "@/components/card";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef } from "react";
import type { SignupDTO } from "@/types/dtos";
import { ProfileForm } from "@/components/forms/profileForm";

export function Signup() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const formRef = useRef<View>(null);

  async function onSubmit(data: SignupDTO) {
    console.log("Dados válidos de cadastro:", data);
  }

  function goToForm() {
    formRef.current?.measureLayout(
      scrollViewRef.current as any,
      (x: number, y: number) => {
        scrollViewRef.current?.scrollTo({ y, animated: true });
      },
      () => {},
    );
  }

  return (
    <ScrollView ref={scrollViewRef} className="bg-base-100 ">
      <Wrapper
        className="w-full pb-6"
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
              icon={<AntDesign name="sync" size={24} />}
              title="Sincronize seus dados"
            >
              Acesse o histórico dental em qualquer dispositivo, a qualquer
              momento.
            </Card>
            <Card
              icon={<Feather name="mail" size={24} />}
              title="Atualizações por e-mail"
            >
              Receba relatórios do desenvolvimento do seu filho diretamente na
              sua caixa de entrada.
            </Card>
            <Card
              icon={
                <MaterialCommunityIcons
                  name="book-open-page-variant-outline"
                  size={24}
                />
              }
              title="Conteúdo exclusivo"
            >
              Novos artigos e guias especializados em odontopediatria toda
              semana.
            </Card>
          </Wrapper>

          <Button onPress={goToForm} className="w-full my-4">
            <Text>Vamos lá!</Text>
          </Button>
        </Wrapper>

        <Wrapper
          ref={formRef}
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

          <ProfileForm onSubmit={onSubmit} />

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
