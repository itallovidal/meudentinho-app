import { useState } from "react";
import { Image, View, type ImageProps } from "react-native";
import { Text } from "@/components/ui/text";
import { isArticleImageUrl } from "@/lib/articleUrls";

type RemoteImageProps = {
  uri: string;
  accessibilityLabel: string;
  className?: string;
  style?: ImageProps["style"];
  resizeMode?: ImageProps["resizeMode"];
};

export function RemoteImage({
  uri,
  accessibilityLabel,
  className,
  style,
  resizeMode = "cover",
}: RemoteImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const available = isArticleImageUrl(uri) && failedUri !== uri;

  return (
    <View className={className} style={style}>
      {available ? (
        <Image
          source={{ uri: uri.trim() }}
          accessibilityLabel={accessibilityLabel}
          resizeMode={resizeMode}
          className="h-full w-full"
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <View
          accessibilityLabel={accessibilityLabel}
          className="h-full w-full items-center justify-center bg-base-200 p-2"
        >
          <Text className="text-center text-xs text-base-600">
            Imagem indisponível
          </Text>
        </View>
      )}
    </View>
  );
}
