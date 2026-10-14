import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  BottomTabBar,
  type BottomTabBarButtonProps,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { StackActions, CommonActions } from "@react-navigation/native";
import { TAB_ROOT_SCREEN, isTabName } from "./types";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { View } from "react-native";
import { HomeStack } from "./HomeStack";
import { ArticlesStack } from "./ArticlesStack";
import type { ArticlesStackParamList } from "./ArticlesStack";
import { SmileStack } from "./SmileStack";
import type { SmileStackParamList } from "./SmileStack";
import { ProfileStack } from "./ProfileStack";
import type { ProfileRouteParams } from "./ProfileStack";
import {
  HouseIcon,
  ToothIcon,
  BookOpenIcon,
  UserIcon,
} from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { NavigatorScreenParams } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

const colors = THEME.light;
const focusedColor = colors.primary400;
const unfocusedColor = colors.base500;

export type TabNavigatorRouteParams = {
  Home: undefined;
  Smile: NavigatorScreenParams<SmileStackParamList> | undefined;
  Articles: NavigatorScreenParams<ArticlesStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileRouteParams> | undefined;
};

export type TabNavigatorNavigationProp = BottomTabNavigationProp<
  TabNavigatorRouteParams,
  "Home"
>;

export function TabBarIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: ReactNode;
}) {
  if (!focused) {
    return <>{children}</>;
  }
  return (
    <View className="items-center justify-center rounded-full bg-primary-100 px-5 py-1">
      {children}
    </View>
  );
}

export function TabBarButton({ style, ...props }: BottomTabBarButtonProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <PlatformPressable
      {...props}
      android_ripple={{ color: "transparent" }}
      onPressIn={(event) => {
        setPressed(true);
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        props.onPressOut?.(event);
      }}
      style={[style, { opacity: pressed ? 0.6 : 1 }]}
    />
  );
}

export function TabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const patchedDescriptors = useMemo(() => {
    const next: typeof descriptors = { ...descriptors };
    for (const key of Object.keys(descriptors)) {
      const descriptor = descriptors[key];
      next[key] = {
        ...descriptor,
        options: {
          ...descriptor.options,
          tabBarStyle: [
            descriptor.options.tabBarStyle,
            {
              backgroundColor: colors.base100,
              paddingBottom: insets.bottom,
            },
          ],
        },
      };
    }
    return next;
  }, [descriptors, insets]);

  return (
    <BottomTabBar
      state={state}
      descriptors={patchedDescriptors}
      navigation={navigation}
      insets={insets}
    />
  );
}

export function popNestedStackToTop<
  RouteName extends keyof TabNavigatorRouteParams,
>(
  navigation: BottomTabNavigationProp<TabNavigatorRouteParams, RouteName>,
  routeKey: string,
) {
  const tabState =
    typeof navigation.getState === "function"
      ? navigation.getState()
      : undefined;
  if (!tabState) {
    return;
  }
  const pressed = tabState.routes.find((route) => route.key === routeKey);
  const nested = pressed?.state;
  if (
    !nested ||
    !("type" in nested) ||
    nested.type !== "stack" ||
    !("key" in nested) ||
    typeof nested.key !== "string" ||
    !("index" in nested) ||
    typeof nested.index !== "number"
  ) {
    return;
  }
  if (nested.index > 0) {
    navigation.dispatch({ ...StackActions.popToTop(), target: nested.key });
    return;
  }
  // A aba pode ter sido poluída por navegação cross-tab fria: ex. abrir
  // Smile -> Profile/Dependents monta Profile como [Dependents] sem o
  // [Index] embaixo. Nesse caso index é 0 e o popToTop seria no-op,
  // deixando o detalhe como "raiz" da aba. Detecta e reseta para a raiz
  // esperada da aba.
  const rawTabName = pressed?.name;
  if (!rawTabName || !isTabName(rawTabName)) {
    return;
  }
  const expectedRoot = TAB_ROOT_SCREEN[rawTabName];
  const nestedRoutes =
    "routes" in nested && Array.isArray(nested.routes)
      ? (nested.routes as Array<{ name?: string }>)
      : [];
  const firstRouteName = nestedRoutes[0]?.name;
  if (
    nestedRoutes.length > 0 &&
    firstRouteName &&
    firstRouteName !== expectedRoot
  ) {
    navigation.dispatch({
      ...CommonActions.reset({
        index: 0,
        routes: [{ name: expectedRoot }],
      }),
      target: nested.key,
    });
  }
}

export const TabNavigator = createBottomTabNavigator<TabNavigatorRouteParams>({
  initialRouteName: "Home",
  backBehavior: "none",
  tabBar: (props) => <TabBar {...props} />,
  screens: {
    Home: {
      screen: HomeStack,
      listeners: ({ navigation, route }) => ({
        tabPress: () => popNestedStackToTop(navigation, route.key),
      }),
      options: {
        tabBarLabel: "Início",
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused}>
            <HouseIcon
              color={focused ? focusedColor : unfocusedColor}
              weight={focused ? "fill" : "duotone"}
            />
          </TabBarIcon>
        ),
      },
    },
    Smile: {
      screen: SmileStack,
      listeners: ({ navigation, route }) => ({
        tabPress: () => popNestedStackToTop(navigation, route.key),
      }),
      options: {
        tabBarLabel: "Sorriso",
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused}>
            <ToothIcon
              color={focused ? focusedColor : unfocusedColor}
              weight={focused ? "fill" : "duotone"}
            />
          </TabBarIcon>
        ),
      },
    },
    Articles: {
      screen: ArticlesStack,
      listeners: ({ navigation, route }) => ({
        tabPress: () => popNestedStackToTop(navigation, route.key),
      }),
      options: {
        tabBarLabel: "Artigos",

        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused}>
            <BookOpenIcon
              color={focused ? focusedColor : unfocusedColor}
              weight={focused ? "fill" : "duotone"}
            />
          </TabBarIcon>
        ),
      },
    },
    Profile: {
      screen: ProfileStack,
      listeners: ({ navigation, route }) => ({
        tabPress: () => popNestedStackToTop(navigation, route.key),
      }),
      options: {
        tabBarLabel: "Perfil",
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused}>
            <UserIcon
              color={focused ? focusedColor : unfocusedColor}
              weight={focused ? "fill" : "duotone"}
            />
          </TabBarIcon>
        ),
      },
    },
  },
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: colors.primary400,
    tabBarInactiveTintColor: colors.base500,
    tabBarButton: (props) => <TabBarButton {...props} />,
  },
});
