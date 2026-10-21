import { View, useWindowDimensions } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";
import {
  EVENTS_BLOCK_HEIGHT,
  SMILE_SUMMARY_BLOCK_HEIGHT,
  kidsSmileCardWidth,
} from "@/components/home/kidsSmileCarousel";

const BADGE_PLACEHOLDERS = 4;
const EVENT_PLACEHOLDERS = 2;

export function SkeletonKidsSmileCarousel({
  itemCount = 2,
}: {
  itemCount?: number;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = kidsSmileCardWidth(screenWidth, itemCount);

  return (
    <View className="w-full">
      <View
        style={{ width: cardWidth }}
        className="rounded-2xl bg-base-100 p-5 shadow-md shadow-base-300"
      >
        <Wrapper direction="row" align="center" gap="gap-3" className="w-full">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </View>
        </Wrapper>

        <Wrapper
          direction="row"
          align="center"
          justify="between"
          className="mb-3 mt-4 w-full"
        >
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </Wrapper>

        <Wrapper
          direction="row"
          align="center"
          justify="start"
          gap="gap-2"
          className="w-full flex-wrap"
          style={{ minHeight: SMILE_SUMMARY_BLOCK_HEIGHT }}
        >
          {Array.from({ length: BADGE_PLACEHOLDERS }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-28 rounded-full" />
          ))}
        </Wrapper>

        <Wrapper
          direction="row"
          align="center"
          justify="between"
          className="mb-3 mt-5 w-full"
        >
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </Wrapper>

        <View
          className="w-full gap-2"
          style={{ minHeight: EVENTS_BLOCK_HEIGHT }}
        >
          {Array.from({ length: EVENT_PLACEHOLDERS }).map((_, index) => (
            <Skeleton key={index} className="h-22 w-full rounded-xl" />
          ))}
        </View>
      </View>

      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="mt-3 w-full"
      >
        {itemCount > 1 ? (
          <Wrapper direction="row" align="center" gap="gap-1.5">
            {Array.from({ length: Math.min(itemCount, 4) }).map((_, index) => (
              <Skeleton key={index} className="h-2 w-2 rounded-full" />
            ))}
          </Wrapper>
        ) : (
          <View className="h-2 w-2" />
        )}
        <Skeleton className="h-4 w-28 rounded-md" />
      </Wrapper>
    </View>
  );
}
