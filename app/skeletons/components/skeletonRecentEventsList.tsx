import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";
import { View } from "react-native";

function SkeletonRecentEventRow() {
  return (
    <View className="w-full flex-row items-center gap-3 rounded-xl bg-base-200 p-3.5">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </View>
    </View>
  );
}

export function SkeletonRecentEventsList({ rows = 3 }: { rows?: number }) {
  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="w-full flex-1 rounded-xl bg-base-100 p-5 shadow-sm shadow-base-300"
    >
      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="mb-3 w-full"
      >
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </Wrapper>
      <View className="w-full gap-2">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonRecentEventRow key={index} />
        ))}
      </View>
    </Wrapper>
  );
}
