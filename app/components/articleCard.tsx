import { Image, TouchableNativeFeedback } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { ArticlePreviewDTO } from "@/types/dtos";
import { AntDesign } from "@expo/vector-icons";

export function ArticleCard({
  imageSrc,
  title,
  category,
  readingTime,
  id,
  className = "",
}: ArticlePreviewDTO) {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<ArticlesStackParamList, "Article">
    >();

  return (
    <TouchableNativeFeedback
      onPress={() => navigation.navigate("Article", { id })}
    >
      <Wrapper
        className={`bg-base-100 rounded-lg p-3 border border-base-200 ${className}`}
        direction="row"
        align="center"
        justify="start"
        gap="gap-3"
      >
        <Image className="w-24 h-full rounded-lg bg-base-200" src={imageSrc} />
        <Wrapper className="flex-1" direction="column" justify="between">
          <Text variant="small" className="text-base-500">
            {category}
          </Text>
          <Text variant="h4">{title}</Text>
          <Wrapper direction="row" align="center" justify="start" gap="gap-1">
            <AntDesign name="clock-circle" size={12} color="gray" />
            <Text variant="small" className="text-base-400">
              {readingTime} min de leitura
            </Text>
          </Wrapper>
        </Wrapper>
      </Wrapper>
    </TouchableNativeFeedback>
  );
}
