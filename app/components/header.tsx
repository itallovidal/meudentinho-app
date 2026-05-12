import { TouchableNativeFeedback, View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { BellIcon, CaretLeftIcon } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { THEME } from "@/lib/theme";

interface HeaderProps {
  hasBackButton?: boolean;
}

export function Header({ hasBackButton }: HeaderProps) {
  const navigation = useNavigation();

  const colors = THEME.light;

  return (
    <Wrapper
      className="px-8 py-4 w-full bg-base-100"
      align="center"
      justify="between"
    >
      {hasBackButton && (
        <TouchableNativeFeedback onPress={() => navigation.goBack()}>
          <CaretLeftIcon weight="regular" color={colors.primary500} />
        </TouchableNativeFeedback>
      )}

      <Text className="text-primary-500 font-bold">Meu Dentinho</Text>

      {/* <BellIcon weight="regular" /> */}

      {/* Temporario enquanto BellIcon estiver comentado */}
      <View style={{ width: 24 }} />
    </Wrapper>
  );
}
