import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Index } from "@/pages/articles/index";
import { Article } from "@/pages/articles/article";

export type ArticlesStackParamList = {
  ArticlesList: undefined;
  Article: { id: string };
};

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
