import { Text } from "@/components/ui/text";
import type { ReactNode } from "react";
import { View } from "react-native";

interface FieldShellProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ label, error, children }: FieldShellProps) {
  return (
    <View className="mb-5 w-full">
      <Text className="mb-1 text-sm font-medium">{label}</Text>
      <View className="flex-row items-center border-b border-base-300 pb-1">
        {children}
      </View>
      {error ? (
        <Text className="mt-1 text-destructive" variant="small">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
