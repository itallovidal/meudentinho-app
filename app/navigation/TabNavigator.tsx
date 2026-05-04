import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home } from "@/pages/home/index";
import { ArticlesStack } from "./ArticlesStack";
import { SmileStack } from "./SmileStack";
import { ProfileStack } from "./ProfileStack";

export const TabNavigator = createBottomTabNavigator({
  initialRouteName: "Home",
  screens: {
    Home: {
      screen: Home,
    },
    Articles: {
      screen: ArticlesStack,
    },
    Smile: {
      screen: SmileStack,
    },
    Profile: {
      screen: ProfileStack,
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
