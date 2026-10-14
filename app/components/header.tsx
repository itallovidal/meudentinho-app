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
  getState?: () => { routes: Array<{ name: string }> };
  reset?: (state: { index: number; routes: Array<{ name: string }> }) => void;
};

function rootForCrossTabRoute(routeName: string): string | null {
  if (routeName === "Article" || routeName === "ArticlesList") {
    return "ArticlesList";
  }
  return "Index";
}

export function Header({ hasBackButton }: HeaderProps) {
  const navigation = useNavigation() as unknown as LooseNavigation;
  const route = useRoute();
  const colors = THEME.light;

  function handleBack() {
    const params = (route.params ?? {}) as CrossTabOrigin;

    if (params.fromTab) {
      // A tela foi aberta a partir de outra aba: volta para a origem
      // e limpa a pilha da aba atual para não poluir a seção.
      // Se a pilha tem mais de uma rota, o goBack remove o detalhe e
      // revela a raiz. Se tem rota única poluída (ex: [Dependents] sem
      // [Index] embaixo), o goBack seria no-op e a aba ficaria presa
      // no detalhe — por isso fazemos reset para a raiz antes de trocar
      // de aba.
      const state = navigation.getState?.();
      const routes = state?.routes;
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else if (routes?.length === 1 && routes[0].name) {
        const currentName = routes[0].name || route.name;
        const root = rootForCrossTabRoute(currentName);
        if (root && currentName !== root) {
          navigation.reset?.({ index: 0, routes: [{ name: root }] });
        }
      } else if (!routes && route.name) {
        const root = rootForCrossTabRoute(route.name);
        if (root && route.name !== root) {
          navigation.reset?.({ index: 0, routes: [{ name: root }] });
        }
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
