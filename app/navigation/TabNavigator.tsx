import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home } from "@/pages/home/index";
import { ArticlesStack } from "./ArticlesStack";
import type { ArticlesStackParamList } from "./ArticlesStack";
import { SmileStack } from "./SmileStack";
import { ProfileStack } from "./ProfileStack";
import {
  HouseIcon,
  ToothIcon,
  BookOpenIcon,
  UserIcon,
} from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { NavigatorScreenParams, RouteProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

const colors = THEME.light;

export type TabNavigatorRouteParams = {
  Home: undefined;
  Smile: undefined;
  Articles: NavigatorScreenParams<ArticlesStackParamList> | undefined;
  Profile: undefined;
};

export type TabNavigatorNavigationProp = BottomTabNavigationProp<
  TabNavigatorRouteParams,
  "Home"
>;

export type TabNavigatorRouteProp = RouteProp<TabNavigatorRouteParams, "Home">;

export const TabNavigator = createBottomTabNavigator<TabNavigatorRouteParams>({
  initialRouteName: "Home",
  screens: {
    Home: {
      screen: Home,
      options: {
        tabBarLabel: "Início",
        tabBarActiveTintColor: colors.primary400,
        tabBarInactiveTintColor: colors.base300,
        tabBarIcon: ({ focused }) => (
          <HouseIcon
            color={focused ? colors.primary400 : colors.base300}
            weight={focused ? "fill" : "duotone"}
          />
        ),
      },
    },
    Smile: {
      screen: SmileStack,
      options: {
        tabBarLabel: "Sorriso",
        tabBarActiveTintColor: colors.primary400,
        tabBarInactiveTintColor: colors.base300,
        tabBarIcon: ({ focused }) => (
          <ToothIcon
            color={focused ? colors.primary400 : colors.base300}
            weight={focused ? "fill" : "duotone"}
          />
        ),
      },
    },
    Articles: {
      screen: ArticlesStack,
      options: {
        tabBarLabel: "Artigos",
        tabBarActiveTintColor: colors.primary400,
        tabBarInactiveTintColor: colors.base300,

        tabBarIcon: ({ focused }) => (
          <BookOpenIcon
            color={focused ? colors.primary400 : colors.base300}
            weight={focused ? "fill" : "duotone"}
          />
        ),
      },
    },
    Profile: {
      screen: ProfileStack,
      options: {
        tabBarLabel: "Perfil",
        tabBarActiveTintColor: colors.primary400,
        tabBarInactiveTintColor: colors.base300,
        tabBarIcon: ({ focused }) => (
          <UserIcon
            color={focused ? colors.primary400 : colors.base300}
            weight={focused ? "fill" : "duotone"}
          />
        ),
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
