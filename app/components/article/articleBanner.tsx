import { Image, Platform, Pressable } from "react-native";
import { ClockIcon } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { Wrapper } from "../wrapper";
import { Badge } from "../ui/badge";
import { Text } from "../ui/text";
import type { TabName } from "@/navigation/types";
import { THEME } from "@/lib/theme";

const BANNER_GRADIENT_COLORS = [
  "rgba(0, 0, 0, 0.96)",
  "rgba(0, 0, 0, 0.72)",
  "rgba(0, 0, 0, 0)",
] as const;

interface ArticleBannerProps {
  imageSrc: string;
  title: string;
  readingTime: number;
  id: string;
  fromTab?: TabName;
}

export function ArticleBanner({
  imageSrc,
  title,
  readingTime,
  id,
  fromTab,
}: ArticleBannerProps) {
  const navigation = useNavigation<TabNavigatorNavigationProp>();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ler artigo em destaque: ${title}`}
      className="w-full overflow-hidden rounded-lg"
      android_ripple={{ color: THEME.light.base200 }}
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
        direction="column"
        className="relative h-60 w-full overflow-hidden rounded-lg bg-base-200"
      >
        <Image
          source={{ uri: imageSrc }}
          className="h-60 w-full rounded-lg"
          accessibilityLabel={`Capa do artigo: ${title}`}
        />
        <LinearGradient
          colors={BANNER_GRADIENT_COLORS}
          start={{ x: 0.2, y: 1 }}
          end={{ x: 0.3, y: 0.5 }}
          className="rounded-lg"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: Platform.OS === "web" ? 0.8 : 1,
          }}
        />
        <Wrapper
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
          className="absolute bottom-0 left-0 right-0 px-4 py-4"
        >
          <Wrapper direction="row" align="center" justify="start" gap="gap-2">
            <Badge>
              <Text variant="default" className="uppercase ">
                Destaque
              </Text>
            </Badge>

            <Badge variant="secondary" className="bg-base-500">
              <ClockIcon
                size={16}
                color={THEME.light.base100}
                weight="regular"
              />
              <Text className="text-xs text-base-100">{readingTime} min</Text>
            </Badge>
          </Wrapper>
          <Text variant="h4" className="w-2/3 text-base-100" numberOfLines={3}>
            {title}
          </Text>
        </Wrapper>
      </Wrapper>
    </Pressable>
  );
}
