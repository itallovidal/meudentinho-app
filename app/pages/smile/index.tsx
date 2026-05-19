import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import DentalMap from "@/components/smile/DentalMap";
import { ScrollView } from "react-native";

export function Smile() {
  return (
    <Wrapper
      className="flex-1 bg-base-200"
      direction="column"
      align="center"
      justify="start"
    >
      <Header />
      <ScrollView className="w-full">
        <DentalMap />
      </ScrollView>
    </Wrapper>
  );
}
