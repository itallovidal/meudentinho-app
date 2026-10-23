import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  trailing?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  trailing,
  className,
}: SectionHeaderProps) {
  return (
    <View
      className={cn(
        "w-full flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2",
        className,
      )}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Text
          accessibilityRole="header"
          className="shrink text-sm font-semibold leading-5 text-primary-800"
        >
          {title}
        </Text>
      </View>
      {trailing}
    </View>
  );
}
