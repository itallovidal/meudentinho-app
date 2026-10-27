import type { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NotFound } from "@/pages/notFound";
import { TabNavigator } from "./TabNavigator";
import type { TabNavigatorRouteParams } from "./TabNavigator";

export type RootNavigatorParamList = {
  Main: NavigatorScreenParams<TabNavigatorRouteParams> | undefined;
  NotFound: undefined;
};

export const RootNavigator = createNativeStackNavigator<RootNavigatorParamList>(
  {
    initialRouteName: "Main",
    screens: {
      Main: { screen: TabNavigator, linking: "app" },
      NotFound: {
        screen: NotFound,
        linking: "app/*",
        options: { title: "Página não encontrada" },
      },
    },
    screenOptions: { headerShown: false },
  },
);
