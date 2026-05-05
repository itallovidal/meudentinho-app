import { View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { AntDesign } from "@expo/vector-icons";

interface HeaderProps {
  hasBackButton?: boolean;
}

export function Header({ hasBackButton }: HeaderProps) {
  return (
    <Wrapper className="px-8 py-4 w-full"
      justify="between"
    >
      {hasBackButton && <AntDesign name="arrow-left" size={24} />}

      <Text className=" text-primary-500 font-bold">Meu Dentinho</Text>
      <AntDesign name="bell" size={24} />
    </Wrapper>
  );
}
