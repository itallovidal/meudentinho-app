import type { ArticlesStackParamList } from "./ArticlesStack";
import type { ProfileRouteParams } from "./ProfileStack";

export type TabName = "Home" | "Smile" | "Articles" | "Profile";

export type CrossTabOrigin = {
  fromTab?: TabName;
  fromScreen?: string;
  fromParams?: Record<string, unknown>;
};

export const TAB_ROOT_SCREEN: Record<TabName, string> = {
  Home: "HomeRoot",
  Smile: "SmileHome",
  Articles: "ArticlesList",
  Profile: "Index",
};

export function rootScreenForRoute(routeName: string): string | null {
  if (routeName === "Article" || routeName === "ArticlesList") {
    return "ArticlesList";
  }
  if (
    routeName === "Index" ||
    routeName === "Login" ||
    routeName === "Signup" ||
    routeName === "AdminPage" ||
    routeName === "Responsible" ||
    routeName === "ChangePassword" ||
    routeName === "Dependents" ||
    routeName === "EditDependent"
  ) {
    return "Index";
  }
  if (routeName === "HomeRoot") {
    return "HomeRoot";
  }
  if (routeName === "SmileHome") {
    return "SmileHome";
  }
  return null;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends ArticlesStackParamList, ProfileRouteParams {
      SmileHome: undefined;
    }
  }
}
