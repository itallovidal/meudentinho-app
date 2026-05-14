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
import { NavigatorScreenParams } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

const colors = THEME.light;
const focusedColor = colors.primary400;
const unfocusedColor = colors.base500;

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

export const TabNavigator = createBottomTabNavigator<TabNavigatorRouteParams>({
  initialRouteName: "Home",
  screens: {
    Home: {
      screen: Home,
      options: {
        tabBarLabel: "Início",
        tabBarIcon: ({ focused }) => (
          <HouseIcon
            color={focused ? focusedColor : unfocusedColor}
            weight={focused ? "fill" : "duotone"}
          />
        ),
      },
    },
    Smile: {
      screen: SmileStack,
      options: {
        tabBarLabel: "Sorriso",
        tabBarIcon: ({ focused }) => (
          <ToothIcon
            color={focused ? focusedColor : unfocusedColor}
            weight={focused ? "fill" : "duotone"}
          />
        ),
      },
    },
    Articles: {
      screen: ArticlesStack,
      options: {
        tabBarLabel: "Artigos",

        tabBarIcon: ({ focused }) => (
          <BookOpenIcon
            color={focused ? focusedColor : unfocusedColor}
            weight={focused ? "fill" : "duotone"}
          />
        ),
      },
    },
    Profile: {
      screen: ProfileStack,
      options: {
        tabBarLabel: "Perfil",
        tabBarIcon: ({ focused }) => (
          <UserIcon
            color={focused ? focusedColor : unfocusedColor}
            weight={focused ? "fill" : "duotone"}
          />
        ),
      },
    },
  },
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: colors.primary400,
    tabBarInactiveTintColor: colors.base500,
  },
});
