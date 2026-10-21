import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Index } from "@/pages/articles/index";
import { Article } from "@/pages/articles/article";
import { ArticleEditor } from "@/pages/articles/articleEditor";
import type { Article as ArticleEntity } from "@/types/domain";
import type { CrossTabOrigin } from "./types";

export type ArticlesStackParamList = {
  ArticlesList: undefined;
  Article: { id: string } & CrossTabOrigin;
  ArticleEditor: { article?: ArticleEntity } | undefined;
};

export type ArticlesNavigationProp =
  NativeStackNavigationProp<ArticlesStackParamList>;

export const ArticlesStack = createNativeStackNavigator<ArticlesStackParamList>(
  {
    initialRouteName: "ArticlesList",
    screens: {
      ArticlesList: {
        screen: Index,
      },
      Article: {
        screen: Article,
      },
      ArticleEditor: {
        screen: ArticleEditor,
      },
    },
    screenOptions: {
      headerShown: false,
    },
  },
);
