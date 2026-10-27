import { QuestionIcon } from "phosphor-react-native";
import { Pressable, View } from "react-native";
import { THEME } from "@/lib/theme";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Text } from "./ui/text";

type InfoPopoverProps = {
  message: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  iconSize?: number;
  iconColor?: string;
  portalHost?: string;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
};

export function InfoPopover({
  message,
  accessibilityLabel,
  accessibilityHint,
  iconSize = 22,
  iconColor,
  portalHost,
  side = "top",
  align = "end",
}: InfoPopoverProps) {
  const colors = THEME.light;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
        >
          <QuestionIcon
            size={iconSize}
            color={iconColor ?? colors.base400}
            weight="fill"
          />
        </Pressable>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        portalHost={portalHost}
        className="w-64 border-0 bg-transparent p-0 shadow-none"
      >
        <View
          testID="info-popover-message"
          className="rounded-2xl bg-base-400 px-4 py-3 shadow-lg"
        >
          <Text className="text-sm leading-5 text-base-100">{message}</Text>
        </View>
      </PopoverContent>
    </Popover>
  );
}
