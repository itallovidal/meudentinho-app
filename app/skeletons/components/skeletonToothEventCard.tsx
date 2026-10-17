import { Skeleton } from "@/components/ui/skeleton";
import { View } from "react-native";

export function SkeletonToothEventCard() {
  return (
    <View className="w-full flex-row items-center gap-4 rounded-2xl bg-base-100 p-4">
      <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </View>
      </View>
    </View>
  );
}
