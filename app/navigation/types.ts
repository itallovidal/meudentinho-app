import type { ArticlesStackParamList } from "./ArticlesStack";
import type { HomeStackParamList } from "./HomeStack";
import type { ProfileRouteParams } from "./ProfileStack";
import type { SmileStackParamList } from "./SmileStack";

export type TabName = "Home" | "Smile" | "Articles" | "Profile";

export type CrossTabOrigin = {
  fromTab?: TabName;
};

export const TAB_ROOT_SCREEN = {
  Home: "HomeRoot",
  Smile: "SmileHome",
  Articles: "ArticlesList",
  Profile: "Index",
} as const;

export function isTabName(value: unknown): value is TabName {
  return (
    value === "Home" ||
    value === "Smile" ||
    value === "Articles" ||
    value === "Profile"
  );
}

export function rootScreenForRoute(routeName: string): string | null {
  if (
    routeName === "Article" ||
    routeName === "ArticlesList" ||
    routeName === "ArticleEditor" ||
    routeName === "NewArticle"
  ) {
    return "ArticlesList";
  }
  if (
    routeName === "Index" ||
    routeName === "Login" ||
    routeName === "Signup" ||
    routeName === "Responsible" ||
    routeName === "ChangePassword" ||
    routeName === "Dependents" ||
    routeName === "EditDependent" ||
    routeName === "NewDependent" ||
    routeName === "Categories" ||
    routeName === "EditCategory" ||
    routeName === "NewCategory"
  ) {
    return "Index";
  }
  if (routeName === "HomeRoot") {
    return "HomeRoot";
  }
  if (
    routeName === "SmileHome" ||
    routeName === "SmileHistory" ||
    routeName === "SmilePredictions"
  ) {
    return "SmileHome";
  }
  return null;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends
        ArticlesStackParamList,
        HomeStackParamList,
        ProfileRouteParams,
        SmileStackParamList {}
  }
}
