import { RemoteImage } from "@/components/remoteImage";
import { Pressable } from "react-native";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { useNavigation } from "@react-navigation/native";
import { ClockIcon } from "phosphor-react-native";
import type { ArticlePreviewDTO } from "@/types/dtos/article";
import { THEME } from "@/lib/theme";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import type { TabName } from "@/navigation/types";

interface ArticleCardProps extends ArticlePreviewDTO {
  className?: string;
  fromTab?: TabName;
}

export function ArticleCard({
  imageCoverURL,
  title,
  readingTime,
  id,
  className = "",
  fromTab,
}: ArticleCardProps) {
  const navigation = useNavigation<TabNavigatorNavigationProp>();

  const colors = THEME.light;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ler artigo: ${title}`}
      className="w-full overflow-hidden rounded-lg"
      android_ripple={{ color: colors.base200 }}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      onPress={() =>
        navigation.navigate("Articles", {
          screen: "Article",
          initial: false,
          params: { id: id, ...(fromTab ? { fromTab } : {}) },
        })
      }
    >
      <Wrapper
        className={`w-full rounded-lg border border-base-200 bg-base-100 p-3 shadow-sm shadow-base-300 ${className}`}
        direction="row"
        align="center"
        justify="start"
        gap="gap-3"
      >
        <RemoteImage
          className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-base-200"
          uri={imageCoverURL}
          accessibilityLabel={`Capa do artigo: ${title}`}
        />
        <Wrapper
          className="min-w-0 flex-1"
          direction="column"
          justify="between"
        >
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
    </Pressable>
  );
}
