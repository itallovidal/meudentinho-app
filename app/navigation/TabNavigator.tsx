import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home } from "@/pages/home/index";
import { ArticlesStack } from "./ArticlesStack";
import { SmileStack } from "./SmileStack";
import { ProfileStack } from "./ProfileStack";
import { MaterialCommunityIcons, Foundation, MaterialIcons } from "@expo/vector-icons";

export const TabNavigator = createBottomTabNavigator({
  initialRouteName: "Home",
  screens: {
    Home: {
      screen: Home,
      options: {
        tabBarLabel: "Início",
        tabBarIcon: ({ color, size }) => (
          <Foundation name="home" color={color} size={size} />
        ),
      },
    },
    Smile: {
      screen: SmileStack,
      options: {
        tabBarLabel: "Sorriso",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="tooth-outline" color={color} size={size} />
        ),
      },
    },
    Articles: {
      screen: ArticlesStack,
      options: {
        tabBarLabel: "Artigos",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="book-open-variant-outline" color={color} size={size} />
        ),
      },
    },
    Profile: {
      screen: ProfileStack,
      options: {
        tabBarLabel: "Perfil",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person-outline" color={color} size={size} />
        ),
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
