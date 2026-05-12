import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Login } from "@/pages/profile/login";
import { Signup } from "@/pages/profile/signup";
import { Profile } from "@/pages/profile/profile";
import { RouteProp } from "@react-navigation/native";
import { BasicUser } from "@/types/domain";
import { AdminPage } from "@/pages/profile/adminPage";
import { Dependents } from "@/pages/profile/dependents";
import { Responsible } from "@/pages/profile/responsible";

export type ProfileRouteParams = {
  Login: undefined;
  Signup: undefined;
  AdminPage: undefined;
  Profile: { payload: BasicUser };
  Responsible: undefined;
  Dependents: undefined;
};

export type ProfileNavegationProp =
  NativeStackNavigationProp<ProfileRouteParams>;

export type ProfileRouteProp = RouteProp<ProfileRouteParams, "Profile">;

export const ProfileStack = createNativeStackNavigator<ProfileRouteParams>({
  initialRouteName: "Login",
  screens: {
    Login,
    Signup,
    Profile,
    AdminPage,
    Responsible,
    Dependents,
  },
  screenOptions: {
    headerShown: false,
  },
});
