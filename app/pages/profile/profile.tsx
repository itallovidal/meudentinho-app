import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "react-native";
import { ProfileRouteProp } from "@/navigation/ProfileStack";
import { useRoute } from "@react-navigation/native";

export function Profile() {
  const route = useRoute<ProfileRouteProp>();
  const payload = route.params?.payload;

  console.log("Profile screen received payload:", payload);

  return (
    <Wrapper
      className="bg-base-100 flex-1"
      direction="column"
      align="center"
      justify="start"
    >
      <Header />
      <Wrapper
        className="bg-base-100 flex-1"
        direction="column"
        align="center"
        justify="center"
      >
        <Text>Bem vindo, {payload?.name}</Text>
      </Wrapper>
    </Wrapper>
  );
}
