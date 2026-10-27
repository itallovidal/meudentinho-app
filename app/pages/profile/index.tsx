import { ScreenContent } from "@/components/screenContent";
import { PwaSettings } from "@/components/pwaSettings";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { ScrollView } from "react-native";
import { FeedbackSheet } from "@/components/feedbackSheet";
import Constants from "expo-constants";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { useNavigation } from "@react-navigation/native";
import { Card } from "@/components/card";
import {
  ShieldCheckIcon,
  ShareNetworkIcon,
  StarIcon,
  UserCircleIcon,
  UsersThreeIcon,
  SignOutIcon,
  TagSimpleIcon,
} from "phosphor-react-native";
import { useContext, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import { errorMessage } from "@/lib/errorMessage";
import { openPrivacyPolicy } from "@/lib/privacyPolicy";
import { THEME } from "@/lib/theme";
import { Text } from "@/components/ui/text";

export function Index() {
  const navigation = useNavigation<ProfileNavegationProp>();
  const colors = THEME.light;
  const { signOut, user, hydrated, sessionExpired } = useContext(UserContext)!;
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const year = new Date().getFullYear();

  async function handleConfirmLogout() {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await signOut();
      setLogoutConfirmOpen(false);
      navigation.reset({ index: 0, routes: [{ name: "Index" }] });
    } catch (error) {
      setLogoutError(
        errorMessage(error, "Não foi possível sair da conta. Tente novamente."),
      );
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleOpenPolicy() {
    const opened = await openPrivacyPolicy();
    if (!opened) {
      setPolicyError("Não foi possível abrir a Política de Privacidade.");
    }
  }

  const accountOption = user
    ? {
        icon: <UserCircleIcon color={colors.primary400} />,
        title: "Gerenciar conta",
        description: "Administre seus dados pessoais.",
        variant: "default" as const,
        handlePress: () => navigation.navigate("Responsible"),
        isDisabled: false,
      }
    : {
        icon: <UserCircleIcon color={colors.primary400} />,
        title: "Entrar",
        description: sessionExpired
          ? "Sua sessão expirou. Entre novamente para continuar."
          : "Acesse sua conta e seus dependentes.",
        variant: "default" as const,
        handlePress: () => navigation.navigate("Login"),
        isDisabled: false,
      };

  const signupOption = {
    icon: <UserCircleIcon color={colors.primary400} />,
    title: "Criar Conta",
    description: "Ainda não tem conta? Cadastre-se.",
    variant: "default" as const,
    handlePress: () => navigation.navigate("Signup"),
    isDisabled: false,
  };

  const dependentsOption = {
    icon: <UsersThreeIcon color={colors.primary400} />,
    title: "Gerenciar Dependentes",
    description: "Administre seus dependentes.",
    variant: "default" as const,
    handlePress: () => navigation.navigate("Dependents"),
    isDisabled: false,
  };

  const categoriesOption = {
    icon: <TagSimpleIcon color={colors.primary400} />,
    title: "Gerenciar Categorias",
    description: "Administre as categorias dos artigos.",
    variant: "default" as const,
    handlePress: () => navigation.navigate("Categories"),
    isDisabled: false,
  };

  const profileOptions = [
    accountOption,
    ...(user ? [] : [signupOption]),
    ...(user ? [dependentsOption] : []),
    ...(user?.isAdmin ? [categoriesOption] : []),
    {
      icon: <ShieldCheckIcon color={colors.primary400} />,
      title: "Política de Privacidade",
      description: "Leia e entenda nossa política.",
      variant: "default" as const,
      handlePress: () => void handleOpenPolicy(),
      isDisabled: false,
    },
    {
      icon: <StarIcon color={colors.primary400} />,
      title: "Avalie o App",
      description: "Em breve.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("Login"),
      isDisabled: true,
    },
    {
      icon: <ShareNetworkIcon color={colors.primary400} />,
      title: "Compartilhe sua experiência",
      description: "Em breve.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("Login"),
      isDisabled: true,
    },
    {
      icon: <SignOutIcon color={colors.destructive} />,
      title: "Sair da conta",
      description: "Faça logout da sua conta.",
      variant: "destructive" as const,
      handlePress: () => setLogoutConfirmOpen(true),
      isDisabled: false,
    },
  ];

  if (!hydrated) {
    return (
      <Wrapper
        className="flex-1 bg-base-200"
        direction="column"
        align="center"
        justify="start"
        gap="gap-0"
      >
        <Header />
        <Text className="mt-8 text-sm text-muted-foreground">Carregando...</Text>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      className="flex-1 bg-base-200"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header />
      <ScrollView className="w-full bg-base-200 py-2">
        <ScreenContent>
          <PwaSettings />
          {profileOptions.map((data, index) => {
            if (data.title.includes("Sair da conta") && !user) {
              return null;
            }

            return (
              <Card
                className="mb-4"
                key={index}
                icon={data.icon}
                title={data.title}
                variant={data.variant}
                handlePress={data.handlePress}
                isDisabled={data.isDisabled}
              >
                {data.description}
              </Card>
            );
          })}

          <Wrapper
            className="my-4 w-full pt-16"
            direction="column"
            align="center"
            justify="center"
          >
            <Text className="mb-0 text-sm text-muted-foreground">
              v{Constants.expoConfig?.version ?? "0.0.0"}
            </Text>
            <Text className="mb-4 mt-0 text-sm text-muted-foreground">
              &copy; {year} Janelinha
            </Text>
          </Wrapper>
        </ScreenContent>
      </ScrollView>

      <BottomSheet
        visible={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        header={
          <Text className="text-xl font-bold text-base-900">Sair da conta</Text>
        }
      >
        <Text className="text-base text-muted-foreground">
          Deseja sair da sua conta neste aparelho?
        </Text>
        {logoutError && (
          <Text
            accessibilityRole="alert"
            className="text-base text-destructive"
          >
            {logoutError}
          </Text>
        )}
        <Button
          variant="destructive"
          onPress={() => void handleConfirmLogout()}
          disabled={loggingOut}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">
            {loggingOut ? "Saindo..." : "Sair"}
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => setLogoutConfirmOpen(false)}
          disabled={loggingOut}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">Cancelar</Text>
        </Button>
      </BottomSheet>
      <FeedbackSheet
        title="Não foi possível abrir o link"
        message={policyError}
        onClose={() => setPolicyError(null)}
      />
    </Wrapper>
  );
}
