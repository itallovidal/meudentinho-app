import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { ScrollView, Text, Alert } from "react-native";
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
  ListPlusIcon,
} from "phosphor-react-native";
import { useContext, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import { logout } from "@/api/auth/logout";
import { ENV } from "@/lib/env";
import { openPrivacyPolicy } from "@/lib/privacyPolicy";
import { THEME } from "@/lib/theme";

export function Index() {
  const navigation = useNavigation<ProfileNavegationProp>();
  const colors = THEME.light;
  const { updateAppUser, user, hydrated, refreshToken } = useContext(UserContext)!;
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

  const profileOptions = [
    {
      icon: <UserCircleIcon color={colors.primary400} />,
      title: `${user ? "Gerencie" : "Crie"} sua conta`,
      description: "Administre seus dados pessoais.",
      variant: "default" as const,
      handlePress: () => navigation.navigate(user ? "Responsible" : "Signup"),
      isDisabled: false,
    },
    {
      icon: <UsersThreeIcon color={colors.primary400} />,
      title: "Gerencie Dependentes",
      description: "Administre seus dependentes.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("Dependents"),
      isDisabled: user ? false : true,
    },
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

  const adminOptions = [
    {
      icon: <ListPlusIcon color={colors.primary400} />,
      title: "Adicionar Artigo",
      description: "Adicione um novo artigo.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("AdminPage"),
      isDisabled: false,
    },
  ] as const;

  if (user?.isAdmin) {
    profileOptions.unshift(...adminOptions);
  }

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
          <Text className="mb-0 text-sm text-muted">v{ENV.APP_VERSION}</Text>
          <Text className="mb-4 mt-0 text-sm text-muted">
            &copy; {year} MeuDentinho
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
          onPress={() => setLogoutConfirmOpen(false)}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">Cancelar</Text>
        </Button>
        <Button
          variant="destructive"
          onPress={() => void handleConfirmLogout()}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">Sair</Text>
        </Button>
      </BottomSheet>
    </Wrapper>
  );
}
