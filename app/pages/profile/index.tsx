import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { ScrollView, Alert } from "react-native";
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
} from "phosphor-react-native";
import { useContext, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import { logout } from "@/api/auth/logout";
import { openPrivacyPolicy } from "@/lib/privacyPolicy";
import { THEME } from "@/lib/theme";
import { Text } from "@/components/ui/text";

export function Index() {
  const navigation = useNavigation<ProfileNavegationProp>();
  const colors = THEME.light;
  const { updateAppUser, user, hydrated, refreshToken, sessionExpired } =
    useContext(UserContext)!;
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const year = new Date().getFullYear();

  async function handleConfirmLogout() {
    setLogoutConfirmOpen(false);
    const staleRefreshToken = refreshToken;
    await updateAppUser(null, null);
    navigation.reset({
      index: 0,
      routes: [{ name: "Index" }],
    });
    if (staleRefreshToken) {
      void logout(staleRefreshToken);
    }
  }

  const handleOpenPolicy = async () => {
    const opened = await openPrivacyPolicy();
    if (!opened) {
      Alert.alert("Erro", "Não foi possível abrir a Política de Privacidade.");
    }
  };

  const accountOption = user
    ? {
        icon: <UserCircleIcon color={colors.primary400} />,
        title: "Gerencie sua conta",
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
    title: "Criar conta",
    description: "Ainda não tem conta? Cadastre-se.",
    variant: "default" as const,
    handlePress: () => navigation.navigate("Signup"),
    isDisabled: false,
  };

  const dependentsOption = {
    icon: <UsersThreeIcon color={colors.primary400} />,
    title: "Gerencie Dependentes",
    description: "Administre seus dependentes.",
    variant: "default" as const,
    handlePress: () => navigation.navigate("Dependents"),
    isDisabled: false,
  };

  const profileOptions = [
    accountOption,
    ...(user ? [] : [signupOption]),
    ...(user ? [dependentsOption] : []),
    {
      icon: <ShieldCheckIcon color={colors.primary400} />,
      title: "Políticas de privacidade",
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
        <Text className="mt-8 text-sm text-muted">Carregando...</Text>
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
      <ScrollView className="w-full bg-base-200 px-6 py-2">
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
          className="my-4 pt-16"
          direction="column"
          align="center"
          justify="center"
        >
          <Text className="mb-0 text-sm text-muted">
            v{Constants.expoConfig?.version ?? "0.0.0"}
          </Text>
          <Text className="mb-4 mt-0 text-sm text-muted">
            &copy; {year} Janelinha
          </Text>
        </Wrapper>
      </ScrollView>

      <BottomSheet
        visible={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        header={
          <Text className="text-xl font-bold text-base-900">
            Sair da conta
          </Text>
        }
      >
        <Text className="text-base text-base-500">
          Deseja sair da sua conta neste aparelho?
        </Text>
        <Button
          variant="destructive"
          onPress={() => void handleConfirmLogout()}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">Sair</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => setLogoutConfirmOpen(false)}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">Cancelar</Text>
        </Button>
      </BottomSheet>
    </Wrapper>
  );
}
