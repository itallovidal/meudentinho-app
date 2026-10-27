import {
  BottomTabBar,
  createBottomTabNavigator,
  type BottomTabBarButtonProps,
  type BottomTabBarProps,
  type BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import {
  CommonActions,
  NavigatorScreenParams,
  StackActions,
} from "@react-navigation/native";
import { TAB_ROOT_SCREEN, isTabName } from "./types";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Platform, View } from "react-native";
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
    <View className="h-8 w-full items-center justify-center rounded-full bg-primary-100">
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
  const rawTabName = pressed?.name;
  if (!rawTabName || !isTabName(rawTabName)) {
    return;
  }
  const expectedRoot = TAB_ROOT_SCREEN[rawTabName];
  const nestedRoutes =
    "routes" in nested && Array.isArray(nested.routes)
      ? (nested.routes as { name?: string }[])
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

function isFocusedTab(
  navigation: {
    getState: () => { index: number; routes: { key: string }[] };
  },
  routeKey: string,
) {
  const state = navigation.getState();
  return state.routes[state.index]?.key === routeKey;
}

export const TabNavigator = createBottomTabNavigator<TabNavigatorRouteParams>({
  initialRouteName: "Home",
  backBehavior: Platform.OS === "web" ? "fullHistory" : "history",
  tabBar: (props) => <TabBar {...props} />,
  screenListeners: ({ navigation, route }) => ({
    tabPress: () => {
      if (isFocusedTab(navigation, route.key)) {
        popNestedStackToTop(navigation, route.key);
      }
    },
  }),
  screens: {
    Home: {
      screen: HomeStack,
      linking: "",
      options: {
        tabBarLabel: "Início",
        title: "Início",
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
      linking: "sorriso",
      options: {
        tabBarLabel: "Sorriso",
        title: "Sorriso",
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
      linking: "artigos",
      options: {
        tabBarLabel: "Artigos",
        title: "Artigos",

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
      options: {
        tabBarLabel: "Perfil",
        title: "Perfil",
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
    tabBarIconStyle: { width: 64 },
    tabBarButton: (props) => <TabBarButton {...props} />,
  },
});
