import { Image, TouchableNativeFeedback, View } from "react-native";
import { Text } from "./ui/text";
import { AntDesign } from "@expo/vector-icons";
import { Wrapper } from "./wrapper";
import { Badge } from "./ui/badge";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArticlesStackParamList } from "@/navigation/ArticlesStack";

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
      <View className="mt-6 w-full rounded-3xl bg-base-500">
        <Image src={imageSrc} className="w-full h-60 rounded-3xl" />
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
            <AntDesign name="clock-circle" size={16} color="white" />
            <Text className="text-xs text-base-100/80">
              {readingTime} min de leitura
            </Text>
          </View>
        </Wrapper>
      </View>
    </TouchableNativeFeedback>
  );
}
