import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "@/pages/home/index";

export type HomeStackParamList = {
  HomeRoot: undefined;
};

export const HomeStack = createNativeStackNavigator<HomeStackParamList>({
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
