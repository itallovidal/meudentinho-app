import type { ReactNode } from "react";
import { View } from "react-native";

interface ErrorScreenProps {
  children: ReactNode;
}

export function ErrorScreen({ children }: ErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-base-100 px-6">
      {children}
    </View>
  );
}
