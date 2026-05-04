import type { StaticParamList } from "@react-navigation/native";
import type { ArticlesStack } from "./ArticlesStack";
import type { SmileStack } from "./SmileStack";
import type { ProfileStack } from "./ProfileStack";

type ArticlesStackParamList = StaticParamList<typeof ArticlesStack>;
type SmileStackParamList = StaticParamList<typeof SmileStack>;
type ProfileStackParamList = StaticParamList<typeof ProfileStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends
        ArticlesStackParamList,
        SmileStackParamList,
        ProfileStackParamList {}
  }
}
