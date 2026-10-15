import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";
import { View } from "react-native";
import { SkeletonText } from "./skeletonText";
import ToothSVG from "@/components/smile/teeth/ToothSVG";
import {
  LEGEND,
  LEGEND_TOOTH,
  TOOTH_STYLE,
} from "@/components/smile/teeth/toothStyle";
import { Text } from "@/components/ui/text";

function SkeletonSmileHeader() {
  return (
    <View className="w-full flex-row justify-between gap-4">
      <SkeletonText variant="small" />
      <SkeletonText variant="small" />
    </View>
  );
}

function SkeletonTeethInfo() {
  return (
    <View className="w-full flex-row justify-between gap-4">
      <View className="align-start flex flex-row justify-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <View className="flex flex-col gap-2">
          <SkeletonText variant="small" />
          <SkeletonText variant="default" />
        </View>
      </View>
      <Skeleton className="h-8 w-8 rounded-full" />
    </View>
  );
}

export function SkeletonDentalMap() {
  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      gap="gap-4"
      className="mx-5 my-2 w-full rounded-lg bg-base-100 p-4"
    >
      <Text variant="h4" className="text-primary-500">
        Mapa do Sorriso
      </Text>

      <SkeletonSmileHeader />

      <View className="w-full flex-row justify-between gap-4">
        <Skeleton className="h-96 w-full rounded-md" />
      </View>

      <SkeletonSmileHeader />

      {LEGEND.map((entry) => (
        <Wrapper
          key={entry.key}
          direction="row"
          align="center"
          justify="between"
          className="w-full px-1"
        >
          <Wrapper direction="row" align="center" gap="gap-3">
            <ToothSVG
              viewBox={LEGEND_TOOTH.viewBox}
              contour={LEGEND_TOOTH.contour}
              details={LEGEND_TOOTH.details}
              fill={TOOTH_STYLE[entry.key].fill}
              stroke={TOOTH_STYLE[entry.key].stroke}
              width={22}
              height={22}
            />
            <View>
              <Text className="text-sm font-semibold text-base-600">
                {entry.label}
              </Text>
              <Text className="text-xs text-base-500">{entry.description}</Text>
            </View>
          </Wrapper>
          <Skeleton className="h-8 w-8 rounded-full" />
        </Wrapper>
      ))}
    </Wrapper>
  );
}
