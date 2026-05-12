import { View } from "react-native";
import { Skeleton } from "../ui/skeleton";
import { Wrapper } from "../wrapper";

export function SkeletonArticleCard() {
  return (
    <Wrapper
      className="bg-base-100 rounded-lg p-3 border border-base-200"
      direction="row"
      align="center"
      justify="start"
      gap="gap-3"
    >
      <Skeleton className="w-24 h-24 rounded-lg" />
      <Wrapper direction="column" className="flex-1">
        <Skeleton className="h-4 w-3/4" />
        <View className="mt-3 flex-row items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </View>
      </Wrapper>
    </Wrapper>
  );
}
