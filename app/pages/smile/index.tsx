import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "react-native";

export function Smile() {
  return (
    <Wrapper
      className="flex-1 bg-base-100"
      direction="column"
      align="center"
      justify="start"
    >
      <Header />
      <Wrapper
        className="flex-1 bg-base-100"
        direction="column"
        align="center"
        justify="center"
      >
        <Text>Em breve..</Text>
      </Wrapper>
    </Wrapper>
  );
}
