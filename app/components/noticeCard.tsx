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
        "w-full flex-row gap-3 rounded-2xl border p-4 items-start border-base-200 bg-base-100",
        dashed && "border-dashed",
        className,
      )}
    >
      <View
        importantForAccessibility="no-hide-descendants"
        className={cn(
          "h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-200",
          !title && "h-7 w-7",
        )}
      >
        {icon}
      </View>
      <View className="min-w-0 flex-1 gap-1">
        {title && (
          <Text className="text-[13px] font-semibold leading-5 text-primary-800">
            {title}
          </Text>
        )}
        <Text
          className={cn(
            "text-[13px] leading-5 text-primary-700"
          )}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}
