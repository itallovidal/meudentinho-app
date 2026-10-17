import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Index } from "@/pages/articles/index";
import { Article } from "@/pages/articles/article";
import type { CrossTabOrigin } from "./types";

export type ArticlesStackParamList = {
  ArticlesList: undefined;
  Article: { id: string } & CrossTabOrigin;
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
    },
    screenOptions: {
      headerShown: false,
    },
  },
);
