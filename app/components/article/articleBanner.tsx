import { Image, TouchableNativeFeedback, View } from "react-native";
import { ClockIcon } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { Wrapper } from "../wrapper";
import { Badge } from "../ui/badge";
import { Text } from "../ui/text";

const BANNER_GRADIENT_COLORS = [
  "rgba(0, 0, 0, 0.96)",
  "rgba(0, 0, 0, 0.72)",
  "rgba(0, 0, 0, 0)",
] as const;

interface ArticleBannerProps {
  imageSrc: string;
  title: string;
  readingTime: string;
  id: string;
}

export function ArticleBanner({
  imageSrc,
  title,
  readingTime,
  id,
}: ArticleBannerProps) {
  const navigation = useNavigation<TabNavigatorNavigationProp>();

  return (
    <TouchableNativeFeedback
      onPress={() =>
        navigation.navigate("Articles", {
          screen: "Article",
          params: { id: id },
          initial: false,
        })
      }
    >
      <Wrapper className="w-full overflow-hidden rounded-lg">
        <Image src={imageSrc} className="h-60 w-full rounded-lg" />
        <LinearGradient
          colors={BANNER_GRADIENT_COLORS}
          start={{ x: 0.2, y: 1 }}
          end={{ x: 0.3, y: 0.5 }}
          className="rounded-lg"
          style={{ position: "absolute", width: "100%", height: "100%" }}
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
              <ClockIcon size={16} color="white" weight="regular" />
              <Text className="text-xs text-base-100">{readingTime} min</Text>
            </Badge>
          </Wrapper>
          <Text variant="h4" className="w-2/3 text-base-100">
            {title}
          </Text>
        </Wrapper>
      </Wrapper>
    </TouchableNativeFeedback>
  );
}
