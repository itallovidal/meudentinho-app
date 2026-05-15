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

export default function DentalTipCard({
  title,
  description,
}: DentalTipCardProps) {
  const colors = THEME.light;

  return (
    <Wrapper
      direction="row"
      align="start"
      justify="start"
      gap="gap-3"
      className="rounded-xl bg-base-200 p-4"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-white/15">
        <WarningCircleIcon
          size={22}
          color={colors.destructive}
          weight="light"
        />
      </View>

      <View className="flex-1">
        <Text variant="large">{title}</Text>
        <Text variant="muted">{description}</Text>
      </View>
    </Wrapper>
  );
}
