import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type NoticeCardProps = {
  title?: string;
  description: string;
  icon: ReactNode;
  dashed?: boolean;
  className?: string;
};

export function NoticeCard({
  title,
  description,
  icon,
  dashed = false,
  className,
}: NoticeCardProps) {
  return (
    <View
      className={cn(
        "w-full gap-2 rounded-2xl border border-base-200 bg-base-100 p-4",
        dashed && "border-dashed",
        className,
      )}
    >
      <View className="w-full flex-row items-center gap-2">
        <View
          importantForAccessibility="no-hide-descendants"
          className="h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base-200"
        >
          {icon}
        </View>
        {title && (
          <Text className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-primary-800">
            {title}
          </Text>
        )}
      </View>
      <Text className="w-full text-[13px] leading-5 text-primary-700">
        {description}
      </Text>
    </View>
  );
}
