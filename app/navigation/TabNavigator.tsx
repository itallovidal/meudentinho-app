import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home } from "@/pages/home/index";
import { ArticlesStack } from "./ArticlesStack";
import { SmileStack } from "./SmileStack";
import { ProfileStack } from "./ProfileStack";
import {
  HouseIcon,
  ToothIcon,
  BookOpenIcon,
  UserIcon,
} from "phosphor-react-native";
import { THEME } from "@/lib/theme";

const colors = THEME.light;

export const TabNavigator = createBottomTabNavigator({
  initialRouteName: "Home",
  screens: {
    Home: {
      screen: Home,
      options: {
        tabBarLabel: "Início",
        tabBarActiveTintColor: colors.primary400,
        tabBarInactiveTintColor: colors.base300,
        tabBarIcon: ({ focused }) => (
          <HouseIcon color={focused ? colors.primary400 : colors.base300} weight={focused ? "fill" : "duotone"} />
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
          <ToothIcon color={focused ? colors.primary400 : colors.base300} weight={focused ? "fill" : "duotone"}  />
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
          <BookOpenIcon color={focused ? colors.primary400 : colors.base300} weight={focused ? "fill" : "duotone"}  />
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
          <UserIcon color={focused ? colors.primary400 : colors.base300} weight={focused ? "fill" : "duotone"}  />
        ),
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
