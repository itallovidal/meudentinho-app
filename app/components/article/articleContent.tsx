import { RemoteImage } from "@/components/remoteImage";
import { View } from "react-native";
import { ClockIcon } from "phosphor-react-native";
import { MarkdownContent } from "@/components/markdownContent";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

type ArticleContentProps = {
  title: string;
  summary?: string;
  categories: string[];
  readingTime: number;
  imageCoverURL: string;
  content: string;
};

export function ArticleContent({
  title,
  summary,
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
      {!!summary?.trim() && (
        <Text className="text-base leading-6 text-base-600">{summary}</Text>
      )}
      <View className="w-full flex-row flex-wrap items-center gap-3">
        {categories.length > 0 && (
          <Badge variant="secondary">
            <Text>{categories.join(", ")}</Text>
          </Badge>
        )}
        <View className="flex-row items-center gap-1">
          <ClockIcon size={16} color={THEME.light.mutedForeground} weight="regular" />
          <Text variant="small" className="text-muted-foreground">
            {readingTime} min de leitura
          </Text>
        </View>
      </View>
      <RemoteImage
        uri={imageCoverURL}
        className="h-56 w-full overflow-hidden rounded-2xl bg-base-200"
        accessibilityLabel={`Imagem de capa: ${title}`}
      />
      <MarkdownContent content={content} />
    </View>
  );
}
