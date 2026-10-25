import { Image, type ImageSourcePropType } from "react-native";

interface IllustrationProps {
  source: ImageSourcePropType;
  width: number;
  height: number;
  accessibilityLabel: string;
}

export function Illustration({
  source,
  width,
  height,
  accessibilityLabel,
}: IllustrationProps) {
  return (
    <Image
      source={source}
      style={{ width, height }}
      className="shrink-0"
      resizeMode="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
