import type { ArticlesStackParamList } from "./ArticlesStack";
import type { ProfileRouteParams } from "./ProfileStack";

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends ArticlesStackParamList, ProfileRouteParams {
      SmileHome: undefined;
    }
  }
}
