import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home } from "@/pages/home/index";
import { ArticlesStack } from "./ArticlesStack";
import { SmileStack } from "./SmileStack";
import { ProfileStack } from "./ProfileStack";
import { Ionicons } from "@expo/vector-icons";

export const TabNavigator = createBottomTabNavigator({
  initialRouteName: "Home",
  screens: {
    Home: {
      screen: Home,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" color={color} size={size} />
        ),
      },
    },
    Articles: {
      screen: ArticlesStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="document-text" color={color} size={size} />
        ),
      },
    },
    Smile: {
      screen: SmileStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="happy" color={color} size={size} />
        ),
      },
    },
    Profile: {
      screen: ProfileStack,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" color={color} size={size} />
        ),
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
