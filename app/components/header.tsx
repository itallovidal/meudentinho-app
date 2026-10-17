import { Pressable, View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { CaretLeftIcon } from "phosphor-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { THEME } from "@/lib/theme";
import {
  goBackToOriginTab,
  type LooseNavigation,
} from "@/navigation/crossTabBack";
import type { CrossTabOrigin } from "@/navigation/types";

interface HeaderProps {
  hasBackButton?: boolean;
}

export function Header({ hasBackButton }: HeaderProps) {
  const navigation = useNavigation() as unknown as LooseNavigation;
  const route = useRoute();
  const colors = THEME.light;

  function handleBack() {
    const params = (route.params ?? {}) as CrossTabOrigin;
    if (goBackToOriginTab(navigation, route.name, params)) {
      return;
    }

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
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
        >
          <CaretLeftIcon weight="regular" color={colors.primary500} />
        </Pressable>
      )}

      <Text className="font-bold text-primary-500">Meu Dentinho</Text>

      <View style={{ width: 24 }} />
    </Wrapper>
  );
}
