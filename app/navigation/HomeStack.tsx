import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "@/pages/home/index";

export const HomeStack = createNativeStackNavigator({
  initialRouteName: "HomeRoot",
  screens: {
    HomeRoot: {
      screen: Home,
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
