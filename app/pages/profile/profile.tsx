import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { ScrollView, Text } from "react-native";
import {
  ProfileNavegationProp,
  ProfileRouteProp,
} from "@/navigation/ProfileStack";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Card } from "@/components/card";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ENV } from "@/lib/env";

export function Profile() {
  const route = useRoute<ProfileRouteProp>();
  const payload = route.params?.payload;
  const navigation = useNavigation<ProfileNavegationProp>();

  console.log("Profile screen received payload:", payload);

  const profileOptions = [
    {
      icon: <AntDesign name="sync" size={24} />,
      title: "Gerencie sua conta",
      description: "Administre seus dados pessoais.",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <AntDesign name="sync" size={24} />,
      title: "Gerencie Dependentes",
      description: "Administre seus dependentes.",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <AntDesign name="sync" size={24} />,
      title: "Políticas de privacidade",
      description: "Leia e entenda nossa política.",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <AntDesign name="sync" size={24} />,
      title: "Avalie o App",
      description: "Ajude-nos a melhorar continuamente.",
      handlePress: () => navigation.navigate("Login"),
    },
    {
      icon: <AntDesign name="sync" size={24} />,
      title: "Compartilhe sua experiência",
      description: "Compartilhe sua experiência.",
      handlePress: () => navigation.navigate("Signup"),
    },
  ];

  return (
    <Wrapper
      className="bg-base-200 flex-1"
      direction="column"
      align="center"
      justify="start"
    >
      <Header />
      <ScrollView className="px-4 w-full mt-2">
        {profileOptions.map((data, index) => (
          <Card
            className="mb-4"
            key={index}
            icon={data.icon}
            title={data.title}
            handlePress={data.handlePress}
          >
            {data.description}
          </Card>
        ))}
      </ScrollView>

      <Text className="text-sm text-muted mb-0">v{ENV.APP_VERSION}</Text>
      <Text className="text-sm text-muted mb-4 mt-0">© 2026 MeuDentinho</Text>
    </Wrapper>
  );
}
