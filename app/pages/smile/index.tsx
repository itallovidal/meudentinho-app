import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "react-native";

export function Smile() {
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
        <Text>Em breve..</Text>
      </Wrapper>
    </Wrapper>
  );
}
