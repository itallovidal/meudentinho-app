import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";
import { View } from "react-native";

export function SkeletonDentalTipCard() {
  return (
    <Wrapper
      direction="row"
      align="start"
      justify="start"
      gap="gap-3"
      className="w-full rounded-xl bg-base-100 p-4 shadow-sm shadow-base-300"
    >
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-5 w-2/5 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </View>
    </Wrapper>
  );
}
