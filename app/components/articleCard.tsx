import { Image, TouchableNativeFeedback } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { ClockIcon } from "phosphor-react-native";
import { ArticlePreviewDTO } from "@/types/dtos/article";
import { THEME } from "@/lib/theme";

const MAX_TITLE_LENGTH = 45;

export function ArticleCard({
  imageCoverURL,
  title,
  readingTime,
  id,
  className = "",
}: ArticlePreviewDTO) {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<ArticlesStackParamList, "Article">
    >();

  const formatedTitle =
    title.length > MAX_TITLE_LENGTH
      ? title.slice(0, MAX_TITLE_LENGTH - 3) + "..."
      : title;

    const colors = THEME.light;

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
        <Image
          className="w-24 h-24 rounded-lg bg-base-200"
          source={{ uri: imageCoverURL }}
        />
        <Wrapper className="flex-1" direction="column" justify="between">
          <Text className="font-bold">{formatedTitle}</Text>
          <Wrapper direction="row" align="center" justify="start" gap="gap-1">
            <ClockIcon size={12} weight="regular" color={colors.base500} />
            <Text variant="small" className="text-base-400">
              {readingTime} min de leitura
            </Text>
          </Wrapper>
        </Wrapper>
      </Wrapper>
    </TouchableNativeFeedback>
  );
}
