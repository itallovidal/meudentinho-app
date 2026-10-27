import type { ReactNode } from "react";
import { TouchableOpacity } from "react-native";

type FloatingActionButtonProps = {
  accessibilityLabel: string;
  icon: ReactNode;
  onPress: () => void;
};

export function FloatingActionButton({
  accessibilityLabel,
  icon,
  onPress,
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/20"
    >
      {icon}
    </TouchableOpacity>
  );
}
