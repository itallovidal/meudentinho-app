import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Smile } from "@/pages/smile/index";

export const SmileStack = createNativeStackNavigator({
  initialRouteName: "SmileHome",
  screens: {
    SmileHome: {
      screen: Smile,
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
