import { Skeleton } from "@/components/ui/skeleton";
import { View } from "react-native";

export function SkeletonCategoryCard() {
  return (
    <View className="w-full flex-row items-center gap-4 rounded-2xl bg-base-100 px-5 py-4">
      <Skeleton className="h-14 w-14 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </View>
      <Skeleton className="h-5 w-5 rounded-md" />
    </View>
  );
}
