import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { Badge } from "@/components/ui/badge";
import { AntDesign } from "@expo/vector-icons";
import { Image, ScrollView } from "react-native";
import { Markdown } from "react-native-remark";

type ArticleRouteProp = RouteProp<ArticlesStackParamList, "Article">;

const markdown = `
# Hello World! 👋

This is a **Markdown** example with [a link](https://reactnative.dev).

- List item 1
- List item 2
`;

export function Article() {
  const route = useRoute<ArticleRouteProp>();
  const id = route.params?.id ?? "";

  return (
    <Wrapper
      className="bg-base-100 flex-1"
      direction="column"
      align="start"
      justify="start"
    >
      <Header hasBackButton />

      {/* Article Content */}
      <Wrapper
        className="bg-base-100 flex-1 mx-8"
        direction="column"
        align="start"
        justify="start"
      >
        {/* Badge and readingTime */}
        <Wrapper direction="row" align="center" gap="gap-4">
          <Badge variant="secondary" className="">
            <Text>Higiene Oral</Text>
          </Badge>
          <Wrapper direction="row" align="center" gap="gap-1">
            <AntDesign name="clock-circle" size={16} color="gray" />
            <Text variant="small" className="text-base-500">
              5 min de leitura
            </Text>
          </Wrapper>
        </Wrapper>

        <ScrollView className="mt-4">
          <Markdown
            markdown={markdown}
            customRenderers={{
              // Override default renderers for mdast nodes.
              // Checkout https://github.com/imwithye/react-native-remark/blob/main/src/renderers/index.tsx
              // for the default renderers.
              InlineCodeRenderer: ({ node }) => (
                <Text style={{ color: "blue" }}>{node.value}</Text>
              ),
              // ThematicBreakRenderer: () => (
              //   <View style={{ height: 5, backgroundColor: "red" }} />
              // ),
            }}
            customStyles={{
              // Override default styles
              // Checkout https://github.com/imwithye/react-native-remark/blob/main/src/themes/default.tsx
              // for the default styles.
              inlineCode: {
                color: "red",
              },
              text: {
                color: "red",
              },
            }}
            // onCodeCopy={(code) => Clipboard.setStringAsync(code)}
            // onLinkPress={(url) => Linking.openURL(url)}
          />
        </ScrollView>
      </Wrapper>
    </Wrapper>
  );
}
