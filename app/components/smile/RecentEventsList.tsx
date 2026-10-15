import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { ToothEvent } from "@/types/teeth";
import { ClockCounterClockwiseIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { ToothEventCard } from "@/components/smile/ToothEventCard";

export default function RecentEventsList({
  items,
  onHistoryPress,
  onItemPress,
}: {
  items: ToothEvent[];
  onHistoryPress?: () => void;
  onItemPress?: (event: ToothEvent) => void;
}) {
  const colors = THEME.light;

  if (items.length === 0) {
    return null;
  }

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
        className="mb-3 w-full flex-1"
      >
        <Text variant="h4" className="flex-1 text-primary-500">
          Últimos Registros
        </Text>
        <Pressable
          onPress={onHistoryPress}
          disabled={!onHistoryPress}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico completo"
          hitSlop={8}
        >
          <ClockCounterClockwiseIcon
            size={24}
            color={colors.primary400}
            weight="regular"
          />
        </Pressable>
      </Wrapper>

      <View className="w-full gap-3">
        {items.map((item) => (
          <ToothEventCard
            key={item.id}
            event={item}
            tone="muted"
            onPress={onItemPress}
          />
        ))}
      </View>
    </Wrapper>
  );
}
