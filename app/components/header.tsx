import { TouchableNativeFeedback, View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { BellIcon, CaretLeftIcon } from "phosphor-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { THEME } from "@/lib/theme";
import type { CrossTabOrigin } from "@/navigation/types";

interface HeaderProps {
  hasBackButton?: boolean;
}

type LooseNavigation = {
  canGoBack: () => boolean;
  goBack: () => void;
  getParent: () => LooseNavigation | undefined;
  navigate: (screen: string, params?: unknown) => void;
};

export function Header({ hasBackButton }: HeaderProps) {
  const navigation = useNavigation() as unknown as LooseNavigation;
  const route = useRoute();
  const colors = THEME.light;

  function handleBack() {
    const params = (route.params ?? {}) as CrossTabOrigin;

    if (params.fromTab) {
      // A tela foi aberta a partir de outra aba: volta para a origem
      // e remove a tela atual da pilha para não poluir a seção.
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      const target = navigation.getParent() ?? navigation;
      if (params.fromScreen) {
        target.navigate(params.fromTab, {
          screen: params.fromScreen,
          params: params.fromParams,
        });
      } else {
        target.navigate(params.fromTab);
      }
      return;
    }

    // Navegação dentro da própria seção: volta para a tela anterior,
    // respeitando a tela inicial (na raiz, não faz nada).
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  return (
    <Wrapper
      className="w-full bg-base-100 px-8 py-4"
      align="center"
      justify="between"
    >
      {hasBackButton && (
        <TouchableNativeFeedback onPress={handleBack}>
          <CaretLeftIcon weight="regular" color={colors.primary500} />
        </TouchableNativeFeedback>
      )}

      <Text className="font-bold text-primary-500">Meu Dentinho</Text>

      {/* <BellIcon weight="regular" /> */}

      {/* Temporario enquanto BellIcon estiver comentado */}
      <View style={{ width: 24 }} />
    </Wrapper>
  );
}
