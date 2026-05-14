import { Image, TouchableNativeFeedback } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { ClockIcon } from "phosphor-react-native";
import { ArticlePreviewDTO } from "@/types/dtos/article";
import { THEME } from "@/lib/theme";

interface ArticleCardProps extends ArticlePreviewDTO {
  className?: string;
  onPress?: (articleId: string) => void;
}

export function ArticleCard({
  imageCoverURL,
  title,
  readingTime,
  id,
  className = "",
  onPress,
}: ArticleCardProps) {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<ArticlesStackParamList, "Article">
    >();

  const colors = THEME.light;

  return (
    <TouchableNativeFeedback
      onPress={() => {
        if (onPress) {
          onPress(id);
          return;
        }

        navigation.navigate("Article", { id });
      }}
    >
      <Wrapper
        className={`rounded-lg border border-base-200 bg-base-100 p-3 ${className}`}
        direction="row"
        align="center"
        justify="start"
        gap="gap-3"
      >
        <Image
          className="h-24 w-24 rounded-lg bg-base-200"
          source={{ uri: imageCoverURL }}
        />
        <Wrapper className="flex-1" direction="column" justify="between">
          <Text className="mb-3 font-bold" numberOfLines={2}>
            {title}
          </Text>
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
