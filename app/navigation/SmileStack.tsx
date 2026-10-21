import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Smile } from "@/pages/smile/index";
import { SmileHistory } from "@/pages/smile/history";
import { SmilePredictions } from "@/pages/smile/predictions";
import type { CrossTabOrigin } from "./types";

export type SmileStackParamList = {
  SmileHome: { kidId?: string } & CrossTabOrigin;
  SmileHistory: { kidId: string } & CrossTabOrigin;
  SmilePredictions: { kidId: string } & CrossTabOrigin;
};

export type SmileNavigationProp =
  NativeStackNavigationProp<SmileStackParamList>;

export const SmileStack = createNativeStackNavigator<SmileStackParamList>({
  initialRouteName: "SmileHome",
  screens: {
    SmileHome: {
      screen: Smile,
    },
    SmileHistory: {
      screen: SmileHistory,
    },
    SmilePredictions: {
      screen: SmilePredictions,
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
