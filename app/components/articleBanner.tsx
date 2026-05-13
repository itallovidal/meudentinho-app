import { Image, TouchableNativeFeedback, View } from "react-native";
import { Text } from "./ui/text";
import { ClockIcon } from "phosphor-react-native";
import { Wrapper } from "./wrapper";
import { Badge } from "./ui/badge";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArticlesStackParamList } from "@/navigation/ArticlesStack";
import { LinearGradient } from "expo-linear-gradient";

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
  onPress?: (articleId: string) => void;
}

export function ArticleBanner({
  imageSrc,
  title,
  readingTime,
  id,
  onPress,
}: ArticleBannerProps) {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<ArticlesStackParamList, "Article">
    >();

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
      <View className="mt-6 w-full overflow-hidden rounded-lg bg-base-500">
        <Image src={imageSrc} className="w-full h-60 rounded-lg" />
        <LinearGradient
          colors={BANNER_GRADIENT_COLORS}
          start={{ x: 0.2, y: 1 }}
          end={{ x: 0.3, y: 0.5 }}
          className="rounded-lg"
          style={{ position: 'absolute', width: '100%', height: '100%' }}
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

            <Badge
              variant="secondary"
              className="bg-base-500"
            >
              <ClockIcon size={16} color="white" weight="regular" />
              <Text className="text-xs text-base-100">
                {readingTime} min
              </Text>
            </Badge>
          </Wrapper>
          <Text variant="h4" className="text-base-100 w-2/3">
            {title}
          </Text>
        </Wrapper>
      </View>
    </TouchableNativeFeedback>
  );
}
