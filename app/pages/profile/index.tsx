import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { ScrollView, Text } from "react-native";
import {
  ProfileNavegationProp,
  ProfileRouteProp,
} from "@/navigation/ProfileStack";
import { useNavigation, useRoute } from "@react-navigation/native";
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
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import { ENV } from "@/lib/env";
import { THEME } from "@/lib/theme";

export function Index() {
  const route = useRoute<ProfileRouteProp>();
  const payload = route.params?.payload;
  const navigation = useNavigation<ProfileNavegationProp>();
  const colors = THEME.light;
  const { updateAppUser, user } = useContext(UserContext)!;

  console.log("Profile screen received payload:", payload);

  const handleLogout = async () => {
    await updateAppUser(null, null);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
    console.log("User logged out, navigating to Login screen");
  };

  const profileOptions = [
    {
      icon: <UserCircleIcon color={colors.primary400} />,
      title: "Gerencie sua conta",
      description: "Administre seus dados pessoais.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("Responsible"),
      isDisabled: false,
    },
    {
      icon: <UsersThreeIcon color={colors.primary400} />,
      title: "Gerencie Dependentes",
      description: "Administre seus dependentes.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("Dependents"),
      isDisabled: false,
    },
    {
      icon: <ShieldCheckIcon color={colors.primary400} />,
      title: "Políticas de privacidade",
      description: "Leia e entenda nossa política.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("Login"),
      isDisabled: true,
    },
    {
      icon: <StarIcon color={colors.primary400} />,
      title: "Avalie o App",
      description: "Ajude-nos a melhorar continuamente.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("Login"),
      isDisabled: true,
    },
    {
      icon: <ShareNetworkIcon color={colors.primary400} />,
      title: "Compartilhe sua experiência",
      description: "Compartilhe sua experiência.",
      variant: "default" as const,
      handlePress: () => navigation.navigate("Login"),
      isDisabled: true,
    },
    {
      icon: <SignOutIcon color={colors.destructive} />,
      title: "Sair da conta",
      description: "Faça logout da sua conta.",
      variant: "destructive" as const,
      handlePress: handleLogout,
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

  return (
    <Wrapper
      className="flex-1 bg-base-200"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header />
      <ScrollView className="w-full bg-base-200 px-4 py-2">
        {profileOptions.map((data, index) => (
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
        ))}

        <Wrapper
          className="my-4"
          direction="column"
          align="center"
          justify="center"
        >
          <Text className="mb-0 text-sm text-muted">v{ENV.APP_VERSION}</Text>
          <Text className="mb-4 mt-0 text-sm text-muted">
            &copy; 2026 MeuDentinho
          </Text>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
