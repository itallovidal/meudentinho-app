import { useMarkdownContext } from "react-native-remark";
import { RemoteImage } from "@/components/remoteImage";

export type MarkdownImageProps = {
  uri: string;
  alt?: string;
};

export function MarkdownImage({ uri, alt }: MarkdownImageProps) {
  const { contentSize } = useMarkdownContext();
  return (
    <RemoteImage
      uri={uri}
      accessibilityLabel={alt || "Imagem do artigo"}
      resizeMode="contain"
      style={{ width: contentSize.width, height: contentSize.width * 0.75 }}
    />
  );
}
