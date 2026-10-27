import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";
import { View } from "react-native";

export function SkeletonArticleBanner() {
  return (
    <View className="w-full overflow-hidden rounded-lg bg-base-300">
      <Skeleton className="h-60 w-full rounded-lg" />
      <Wrapper
        direction="column"
        align="start"
        justify="start"
        gap="gap-2"
        className="absolute bottom-0 left-0 right-0 px-4 py-4"
      >
        <View className="mt-3 flex-row items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </View>

        <View className="mt-1 w-full gap-1">
          <Skeleton className="h-7 w-3/4 rounded-md" />
          <Skeleton className="h-7 w-1/2 rounded-md" />
        </View>
      </Wrapper>
    </View>
  );
}
