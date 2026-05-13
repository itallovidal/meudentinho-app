import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Login } from "@/pages/profile/login";
import { Signup } from "@/pages/profile/signup";
import { Index } from "@/pages/profile";
import { RouteProp } from "@react-navigation/native";
import { BasicUser } from "@/types/domain";
import { AdminPage } from "@/pages/profile/adminPage";

export type ProfileRouteParams = {
  Login: undefined;
  Signup: undefined;
  Index: { payload: BasicUser };
  AdminPage: undefined;
};

export type ProfileNavegationProp =
  NativeStackNavigationProp<ProfileRouteParams>;

export type ProfileRouteProp = RouteProp<ProfileRouteParams, "Index">;

export const ProfileStack = createNativeStackNavigator<ProfileRouteParams>({
  initialRouteName: "Login",
  screens: {
    Login,
    Signup,
    Index,
    AdminPage,
  },
  screenOptions: {
    headerShown: false,
  },
});
