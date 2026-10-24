import { Image, View } from "react-native";
import { ClockIcon } from "phosphor-react-native";
import { MarkdownContent } from "@/components/markdownContent";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

type ArticleContentProps = {
  title: string;
  categories: string[];
  readingTime: number;
  imageCoverURL: string;
  content: string;
};

export function ArticleContent({
  title,
  categories,
  readingTime,
  imageCoverURL,
  content,
}: ArticleContentProps) {
  return (
    <View className="w-full gap-4 bg-base-100">
      <Text
        accessibilityRole="header"
        className="text-2xl font-bold leading-8 text-primary-800"
      >
        {title}
      </Text>
      <View className="w-full flex-row flex-wrap items-center gap-3">
        {categories.length > 0 && (
          <Badge variant="secondary">
            <Text>{categories.join(", ")}</Text>
          </Badge>
        )}
        <View className="flex-row items-center gap-1">
          <ClockIcon size={16} color={THEME.light.base500} weight="regular" />
          <Text variant="small" className="text-base-500">
            {readingTime} min de leitura
          </Text>
        </View>
      </View>
      {imageCoverURL ? (
        <Image
          source={{ uri: imageCoverURL }}
          className="h-56 w-full rounded-2xl bg-base-200"
          accessibilityLabel={`Imagem de capa: ${title}`}
        />
      ) : (
        <View className="h-56 w-full items-center justify-center rounded-2xl bg-base-200 px-5">
          <Text className="text-center text-sm leading-5 text-base-500">
            A imagem de capa aparecerá aqui após carregar no formulário.
          </Text>
        </View>
      )}
      <MarkdownContent content={content} />
    </View>
  );
}
