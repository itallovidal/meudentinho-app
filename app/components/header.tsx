import { useCallback } from "react";
import { BackHandler, Platform, Pressable, View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { ScreenContent } from "./screenContent";
import { CaretLeftIcon } from "phosphor-react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { THEME } from "@/lib/theme";
import {
  goBackToOriginTab,
  resetToRouteRoot,
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

  const handleBack = useCallback(() => {
    const params = (route.params ?? {}) as CrossTabOrigin;
    if (goBackToOriginTab(navigation, route.name, params)) {
      return true;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }

    return resetToRouteRoot(navigation, route.name);
  }, [navigation, route.name, route.params]);

  useFocusEffect(
    useCallback(() => {
      if (!hasBackButton || Platform.OS !== "android") {
        return;
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack,
      );

      return () => subscription.remove();
    }, [hasBackButton, handleBack]),
  );

  return (
    <Wrapper className="w-full bg-base-100 py-4" direction="column">
      <ScreenContent
        className="px-8"
        direction="row"
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

        <Text className="font-bold text-primary-500">Janelinha</Text>

        <View style={{ width: 24 }} />
      </ScreenContent>
    </Wrapper>
  );
}
