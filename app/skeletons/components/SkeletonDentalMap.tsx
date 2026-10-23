import { CollapsibleSection } from "@/components/collapsibleSection";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";
import { View } from "react-native";
import { Fragment, type ReactNode } from "react";
import { SkeletonText } from "./skeletonText";
import { ToothSVG } from "@/components/smile/teeth/ToothSVG";
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

export function SkeletonDentalMap({ error }: { error?: ReactNode }) {
  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      gap="gap-4"
      className="mx-5 my-2 w-full rounded-lg bg-base-100 p-4"
    >
      <View className="w-full flex-row items-center justify-between gap-4">
        <Text variant="h4" className="text-primary-500">
          Mapa do Sorriso
        </Text>
        <Skeleton className="h-6 w-6 rounded-full" />
      </View>

      <SkeletonSmileHeader />

      <View className="w-full flex-row justify-between gap-4">
        {error ?? <Skeleton className="h-96 w-full rounded-md" />}
      </View>

      <SkeletonSmileHeader />

      <CollapsibleSection title="Legendas">
        <View className="w-full gap-2">
          {LEGEND.map((entry) => (
            <Fragment key={entry.key}>
              {entry.key === "review" && (
                <Separator className="my-1 bg-base-200" />
              )}
              <Wrapper
                direction="row"
                align="center"
                justify="between"
                className="w-full px-1"
              >
                <Wrapper
                  direction="row"
                  align="center"
                  gap="gap-3"
                  className="min-w-0 flex-1"
                >
                  {entry.key === "review" ? (
                    <View
                      importantForAccessibility="no-hide-descendants"
                      className="h-[22px] w-[22px] items-center justify-center"
                    >
                      <View className="h-4 w-4 items-center justify-center rounded-full bg-primary-500">
                        <Text className="text-xs font-bold text-base-100">
                          !
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <ToothSVG
                      viewBox={LEGEND_TOOTH.viewBox}
                      contour={LEGEND_TOOTH.contour}
                      details={LEGEND_TOOTH.details}
                      fill={TOOTH_STYLE[entry.key].fill}
                      stroke={TOOTH_STYLE[entry.key].stroke}
                      width={22}
                      height={22}
                    />
                  )}
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-semibold text-base-600">
                      {entry.label}
                    </Text>
                    <Text className="text-xs text-base-500">
                      {entry.description}
                    </Text>
                  </View>
                </Wrapper>
                <Skeleton className="h-8 w-8 rounded-full" />
              </Wrapper>
            </Fragment>
          ))}
        </View>
      </CollapsibleSection>
    </Wrapper>
  );
}
