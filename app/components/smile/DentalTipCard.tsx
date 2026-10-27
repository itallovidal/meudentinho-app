import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { WarningCircleIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { Wrapper } from "../wrapper";

interface DentalTipCardProps {
  title: string;
  description: string;
}

export function DentalTipCard({ title, description }: DentalTipCardProps) {
  const colors = THEME.light;

  return (
    <Wrapper
      direction="row"
      align="start"
      justify="start"
      gap="gap-3"
      className="w-full rounded-xl bg-base-100 p-4 shadow-sm shadow-base-300"
    >
      <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
        <WarningCircleIcon
          size={22}
          color={colors.destructive}
          weight="light"
        />
      </View>

      <View className="min-w-0 flex-1">
        <Text variant="large">{title}</Text>
        <Text variant="muted">{description}</Text>
      </View>
    </Wrapper>
  );
}
