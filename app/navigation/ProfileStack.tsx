import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Login } from "@/pages/profile/login";
import { Signup } from "@/pages/profile/signup";
import { Index } from "@/pages/profile";
import { RouteProp } from "@react-navigation/native";
import { Dependents } from "@/pages/profile/dependents";
import { Responsible } from "@/pages/profile/responsible";
import { EditDependent } from "@/pages/profile/editDependent";
import { ChangePassword } from "@/pages/profile/changePassword";
import { Categories } from "@/pages/profile/categories";
import { EditCategory } from "@/pages/profile/editCategory";
import type { CrossTabOrigin } from "./types";

export type ProfileRouteParams = {
  Login: undefined | (CrossTabOrigin & { returnTo?: string });
  Signup: undefined | (CrossTabOrigin & { returnTo?: string });
  Index: undefined;
  Responsible: undefined;
  ChangePassword: undefined;
  Dependents: undefined | CrossTabOrigin;
  NewDependent: undefined | CrossTabOrigin;
  EditDependent: { kidId: string } & CrossTabOrigin;
  Categories: undefined;
  NewCategory: undefined;
  EditCategory: { categoryId: string };
};

export type ProfileNavegationProp =
  NativeStackNavigationProp<ProfileRouteParams>;

export type ProfileRouteProp = RouteProp<ProfileRouteParams, "Index">;

export const ProfileStack = createNativeStackNavigator<ProfileRouteParams>({
  initialRouteName: "Index",
  screens: {
    Login: { screen: Login, linking: "login" },
    Signup: { screen: Signup, linking: "cadastro" },
    Index: { screen: Index, linking: "perfil" },
    Responsible: { screen: Responsible, linking: "perfil/responsavel" },
    ChangePassword: { screen: ChangePassword, linking: "perfil/senha" },
    Dependents: { screen: Dependents, linking: "perfil/dependentes" },
    NewDependent: {
      screen: EditDependent,
      linking: "perfil/dependentes/novo",
    },
    EditDependent: {
      screen: EditDependent,
      getId: ({ params }) => params.kidId,
      linking: "perfil/dependentes/:kidId/editar",
    },
    Categories: { screen: Categories, linking: "perfil/categorias" },
    NewCategory: { screen: EditCategory, linking: "perfil/categorias/nova" },
    EditCategory: {
      screen: EditCategory,
      linking: "perfil/categorias/:categoryId/editar",
    },
  },
  screenOptions: {
    headerShown: false,
  },
});
