import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Index } from "@/pages/articles/index";
import { Article } from "@/pages/articles/article";
import { ArticleEditor } from "@/pages/articles/articleEditor";
import type { CrossTabOrigin } from "./types";

export type ArticlesStackParamList = {
  ArticlesList: undefined;
  Article: { id: string } & CrossTabOrigin;
  NewArticle: undefined;
  ArticleEditor: { articleId: string };
};

export type ArticlesNavigationProp =
  NativeStackNavigationProp<ArticlesStackParamList>;

export const ArticlesStack = createNativeStackNavigator<ArticlesStackParamList>(
  {
    initialRouteName: "ArticlesList",
    screens: {
      ArticlesList: {
        screen: Index,
        options: { title: "Artigos" },
        linking: "",
      },
      Article: {
        screen: Article,
        options: { title: "Artigo" },
        linking: ":id",
      },
      NewArticle: {
        screen: ArticleEditor,
        options: { title: "Novo artigo" },
        linking: "novo",
      },
      ArticleEditor: {
        screen: ArticleEditor,
        options: { title: "Editar artigo" },
        linking: ":articleId/editar",
      },
    },
    screenOptions: {
      headerShown: false,
    },
  },
);
