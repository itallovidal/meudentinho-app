import { Skeleton } from "@/components/ui/skeleton";
import { View } from "react-native";

function SkeletonKidPill() {
  return (
    <View className="h-12 w-40 shrink-0 flex-row items-center gap-2 rounded-xl bg-base-100 px-3 py-1">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <View className="min-w-0 flex-1 shrink gap-1.5">
        <Skeleton className="h-3.5 w-16 rounded-md" />
        <Skeleton className="h-3 w-12 rounded-md" />
      </View>
    </View>
  );
}

export function SkeletonKidSelector() {
  return (
    <View className="w-full flex-row items-center gap-2">
      <SkeletonKidPill />
      <SkeletonKidPill />
      <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
    </View>
  );
}
