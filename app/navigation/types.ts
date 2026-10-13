import type { ArticlesStackParamList } from "./ArticlesStack";
import type { ProfileRouteParams } from "./ProfileStack";

export type TabName = "Home" | "Smile" | "Articles" | "Profile";

export type CrossTabOrigin = {
  fromTab?: TabName;
  fromScreen?: string;
  fromParams?: Record<string, unknown>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends ArticlesStackParamList, ProfileRouteParams {
      SmileHome: undefined;
    }
  }
}
