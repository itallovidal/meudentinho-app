import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { ToothPrediction } from "@/types/teeth";
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  ClockIcon,
} from "phosphor-react-native";

export default function PredictionsCard({
  items,
}: {
  items: ToothPrediction[];
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="flex-1 w-full overflow-hidden rounded-2xl bg-primary-500 p-5"
    >
      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="mb-4 flex-1 w-full"
      >
        <Text className="text-xl font-semibold text-white">Previsões</Text>
        <ArrowRightIcon size={22} color="white" weight="bold" />
      </Wrapper>

      <View className="gap-2">
        {items.map((it: ToothPrediction) => (
            <View key={it.id} className="rounded-lg bg-white/10 px-3.5 py-3">
              <Text className="text-sm font-semibold text-white">
                {it.title}
              </Text>
              <Wrapper
                direction="row"
                align="center"
                gap="gap-1"
                className="mt-1"
              >
                <ClockIcon
                  size={14}
                  color="rgba(255, 255, 255, 0.6)"
                  weight="bold"
                />
                <Text className="text-xs text-white/60">
                  Previsto:{" "}
                  {new Date(it.expectedDate).toLocaleDateString("pt-BR", {
                    month: "short",
                  })}
                </Text>
              </Wrapper>
            </View>
          ))}
        </View>

      <View className="absolute bottom-0 right-0 opacity-[0.08]">
        <CalendarBlankIcon size={80} color="white" weight="regular" />
      </View>
    </Wrapper>
  );
}
