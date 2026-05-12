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
} from "phosphor-react-native";
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import { ENV } from "@/lib/env";
import { THEME } from "@/lib/theme";

export function Profile() {
  const route = useRoute<ProfileRouteProp>();
  const payload = route.params?.payload;
  const navigation = useNavigation<ProfileNavegationProp>();
  const colors = THEME.light;
  const { updateAppUser } = useContext(UserContext)!;

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
      variant: "default",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <UsersThreeIcon color={colors.primary400} />,
      title: "Gerencie Dependentes",
      description: "Administre seus dependentes.",
      variant: "default",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <ShieldCheckIcon color={colors.primary400} />,
      title: "Políticas de privacidade",
      description: "Leia e entenda nossa política.",
      variant: "default",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <StarIcon color={colors.primary400} />,
      title: "Avalie o App",
      description: "Ajude-nos a melhorar continuamente.",
      variant: "default",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <ShareNetworkIcon color={colors.primary400} />,
      title: "Compartilhe sua experiência",
      description: "Compartilhe sua experiência.",
      variant: "default",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <SignOutIcon color={colors.destructive} />,
      title: "Sair da conta",
      description: "Faça logout da sua conta.",
      variant: "destructive",
      handlePress: handleLogout,
    },
  ] as const;

  return (
    <Wrapper
      className="bg-base-200 flex-1"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header />
      <ScrollView className="px-4 py-2 w-full">
        {profileOptions.map((data, index) => (
          <Card
            className="mb-4"
            key={index}
            icon={data.icon}
            title={data.title}
            variant={data.variant}
            handlePress={data.handlePress}
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
          <Text className="text-sm text-muted mb-0">v{ENV.APP_VERSION}</Text>
          <Text className="text-sm text-muted mb-4 mt-0">
            &copy; 2026 MeuDentinho
          </Text>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
