import { View } from "react-native";
import { Skeleton } from "../ui/skeleton";
import { Wrapper } from "../wrapper";

export function SkeletonArticleBanner() {
  return (
    <View className="mt-6 w-full overflow-hidden rounded-3xl bg-base-300">
      <Skeleton className="w-full h-60 rounded-3xl" />
      <Wrapper
        direction="column"
        align="start"
        justify="start"
        gap="gap-2"
        className="absolute bottom-0 left-0 right-0 px-4 py-4"
      >
        <Skeleton className="h-6 w-20 rounded-full" />

        <View className="w-full gap-1 mt-1">
          <Skeleton className="h-7 w-3/4 rounded-md" />
          <Skeleton className="h-7 w-1/2 rounded-md" />
        </View>

        <View className="mt-3 flex-row items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </View>
      </Wrapper>
    </View>
  );
}
