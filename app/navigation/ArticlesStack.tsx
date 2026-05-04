import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Index } from "@/pages/articles/index";
import { Article } from "@/pages/articles/article";

export const ArticlesStack = createNativeStackNavigator({
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
});
