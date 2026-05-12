import { View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { BellIcon, CaretLeftIcon } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { Button } from "./ui/button";

interface HeaderProps {
  hasBackButton?: boolean;
}

export function Header({ hasBackButton }: HeaderProps) {
  const navigation = useNavigation();

  return (
    <Wrapper className="px-8 py-4 w-full bg-base-100" justify="between">
      {hasBackButton && (
        <Button variant="ghost" onPress={() => navigation.goBack()}>
          <CaretLeftIcon weight="regular" />
        </Button>
      )}

      <Text className=" text-primary-500 font-bold">Meu Dentinho</Text>
      {/* <BellIcon weight="regular" /> */}
    </Wrapper>
  );
}
