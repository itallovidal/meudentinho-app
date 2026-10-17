import { useEffect, useRef } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { Text } from "@/components/ui/text";
import type { ReactNode } from "react";

interface FieldShellProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ label, error, children }: FieldShellProps) {
  const announcedErrorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (Platform.OS !== "ios" || !error) {
      announcedErrorRef.current = error;
      return;
    }
    if (announcedErrorRef.current === error) {
      return;
    }
    announcedErrorRef.current = error;
    AccessibilityInfo.announceForAccessibility(error);
  }, [error]);

  return (
    <View className="mb-5 w-full">
      <Text className="mb-1 text-sm font-medium">{label}</Text>
      <View className="flex-row items-center border-b border-base-300 pb-1">
        {children}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-1 text-destructive"
          variant="small"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
