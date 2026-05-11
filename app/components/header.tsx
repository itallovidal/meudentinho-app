import { View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { ArrowLeft, Bell, BellIcon, CaretLeftIcon } from "phosphor-react-native";

interface HeaderProps {
  hasBackButton?: boolean;
}

export function Header({ hasBackButton }: HeaderProps) {
  return (
    <Wrapper className="px-8 py-4 w-full bg-base-100" justify="between">
      {hasBackButton && <CaretLeftIcon weight="regular" />}

      <Text className=" text-primary-500 font-bold">Meu Dentinho</Text>
      <BellIcon weight="regular" />
    </Wrapper>
  );
}
