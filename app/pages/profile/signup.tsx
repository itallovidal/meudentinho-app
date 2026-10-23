import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ScrollView, View } from "react-native";
import {
  RouteProp,
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import { Card } from "@/components/card";
import {
  ArrowsClockwiseIcon,
  BookOpenIcon,
  FileIcon,
  ToothIcon,
} from "phosphor-react-native";
import { useContext, useCallback, useRef, useState } from "react";
import { ProfileForm } from "@/components/forms/profileForm";
import type { SignupRequest } from "@/types/dtos/user";
import { SignupFormValues } from "@/lib/schemas/profile";
import { UserContext } from "@/contexts/UserContext";
import { errorMessage } from "@/lib/errorMessage";
import { ApiError } from "@/types/domain";
import {
  ProfileNavegationProp,
  ProfileRouteParams,
} from "@/navigation/ProfileStack";
import { THEME } from "@/lib/theme";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacyPolicy";
import { signup } from "@/api/auth/signup";

export function Signup() {
  const navigation = useNavigation<ProfileNavegationProp>();
  const route = useRoute<RouteProp<ProfileRouteParams, "Signup">>();
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const formRef = useRef<React.ComponentRef<typeof View>>(null);

  const [error, setError] = useState<ApiError | null>(null);
  const { updateAppUser, user, authToken, hydrated } = useContext(UserContext)!;

  const colors = THEME.light;

  useFocusEffect(
    useCallback(() => {
      if (hydrated && user && authToken) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Index", params: { payload: user } }],
        });
        const origin = route.params?.fromTab;
        if (origin) {
          navigation.getParent()?.navigate(origin);
        }
      }
    }, [hydrated, user, authToken, navigation, route.params?.fromTab]),
  );

  async function onSubmit({ accepted, ...profile }: SignupFormValues) {
    setError(null);
    try {
      const request: SignupRequest = {
        ...profile,
        accepted: true,
        acceptedPolicyVersion: PRIVACY_POLICY_VERSION,
        acceptedAt: new Date().toISOString(),
        isLegalGuardian: true,
      };
      const { data } = await signup(request);

      const responseEmail =
        (data as unknown as { email?: string }).email ?? profile.email;
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

      const origin = route.params?.fromTab;
      if (origin) {
        navigation.getParent()?.navigate(origin);
      }
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
    <View className="flex-1 bg-base-100">
      <Header hasBackButton />
      <ScrollView ref={scrollViewRef} className="bg-base-100 ">
      <Wrapper
        className="w-full pb-6"
        direction="column"
        align="center"
        justify="center"
      >
        <Wrapper
          className="w-full bg-base-100 px-6 py-4 min-h-[85vh]"
          direction="column"
          justify="center"
          gap={"gap-4"}
        >
          <Text className="mb-0" variant={"h2"}>
            Crie sua conta
          </Text>
          <Text className="mb-6 mt-0 text-muted">
            Acompanhe a saúde bucal do seu filho com a tecnologia e o carinho
            que ele merece.
          </Text>
          <Wrapper direction="column" className="w-full" gap={"gap-6"}>
            <Card
              icon={<ArrowsClockwiseIcon color={colors.primary400} />}
              title="Sincronize seus dados"
            >
              Acesse o histórico dental em qualquer dispositivo.
            </Card>
            <Card
              icon={<ToothIcon color={colors.primary400} />}
              title="Previsões dentárias"
            >
              Acompanhe quando cada dentinho deve nascer.
            </Card>
            <Card
              icon={<FileIcon color={colors.primary400} />}
              title="Tudo pronto para a consulta"
            >
              Exporte o histórico dental e compartilhe com o odontopediatra.
            </Card>
          </Wrapper>

          <Button onPress={goToForm} className="my-4 w-full">
            <Text>Vamos lá!</Text>
          </Button>
        </Wrapper>

        <Wrapper
          ref={formRef}
          className="w-full bg-base-100 px-6"
          direction="column"
          align="center"
          justify="center"
        >
          <Wrapper className="w-full" direction="column" gap={"gap-0"}>
            <Text className="mb-0" variant={"h2"}>
              Bem vindo à família
            </Text>
            <Text className="mb-6 mt-0 text-muted">
              Preencha os dados abaixo para começar o acompanhamento.
            </Text>
          </Wrapper>

          <ProfileForm submitError={error} onSubmit={onSubmit} />

          <Text variant={"small"}>Já tem uma conta?</Text>
          <Button
            onPress={() =>
              navigation.navigate("Login", {
                fromTab: route.params?.fromTab,
              })
            }
            variant={"ghost"}
          >
            <Text>Entrar</Text>
          </Button>
        </Wrapper>
      </Wrapper>
      </ScrollView>
    </View>
  );
}
