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
  "hsla(213, 53.4%, 20.2%, 0.96)",
  "hsla(213, 53.4%, 20.2%, 0.72)",
  "hsla(213, 53.4%, 20.2%, 0)",
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
  const navigation =
    useNavigation<
      NativeStackNavigationProp<ArticlesStackParamList, "Article">
    >();

  return (
    <TouchableNativeFeedback
      onPress={() => navigation.navigate("Article", { id })}
    >
      <View className="mt-6 w-full overflow-hidden rounded-3xl bg-base-500">
        <Image src={imageSrc} className="w-full h-60 rounded-3xl" />
        <LinearGradient
          colors={BANNER_GRADIENT_COLORS}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          className="absolute inset-0 rounded-3xl"
        />
        <Wrapper
          direction="column"
          align="start"
          justify="start"
          gap="gap-2"
          className="absolute bottom-0 left-0 right-0 px-4 py-4"
        >
          <Badge>
            <Text variant="default" className="uppercase ">
              Destaque
            </Text>
          </Badge>
          <Text variant="h2" className="text-base-100">
            {title}
          </Text>
          <View className="mt-3 flex-row items-center gap-2">
            <ClockIcon size={16} color="white" weight="regular" />
            <Text className="text-xs text-base-100/80">
              {readingTime} min de leitura
            </Text>
          </View>
        </Wrapper>
      </View>
    </TouchableNativeFeedback>
  );
}
