import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Login } from "@/pages/profile/login";
import { Signup } from "@/pages/profile/signup";
import { Profile } from "@/pages/profile/profile";

export const ProfileStack = createNativeStackNavigator({
  initialRouteName: "Login",
  screens: {
    Login,
    Signup,
    ProfileHome: Profile,
  },
  screenOptions: {
    headerShown: false,
  },
});
