import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Login } from "@/pages/profile/login";
import { Signup } from "@/pages/profile/signup";
import { Profile } from "@/pages/profile/profile";
import { RouteProp } from "@react-navigation/native";

// TODO: Change this payload!
export type ProfileRouteParams = {
  Login: undefined;
  Signup: undefined;
  Profile: { payload: any };
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
  },
  screenOptions: {
    headerShown: false,
  },
});
