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
import { Dependents } from "@/pages/profile/dependents";
import { Responsible } from "@/pages/profile/responsible";
import { ChangePassword } from "@/pages/profile/changePassword";
import type { CrossTabOrigin } from "./types";

export type ProfileRouteParams = {
  Login: undefined | CrossTabOrigin;
  Signup: undefined;
  Index: { payload: BasicUser };
  AdminPage: undefined;
  Responsible: undefined;
  ChangePassword: undefined;
  Dependents: undefined | CrossTabOrigin;
};

export type ProfileNavegationProp =
  NativeStackNavigationProp<ProfileRouteParams>;

export type ProfileRouteProp = RouteProp<ProfileRouteParams, "Index">;

export const ProfileStack = createNativeStackNavigator<ProfileRouteParams>({
  initialRouteName: "Index",
  screens: {
    Login,
    Signup,
    Index,
    AdminPage,
    Responsible,
    ChangePassword,
    Dependents,
  },
  screenOptions: {
    headerShown: false,
  },
});
