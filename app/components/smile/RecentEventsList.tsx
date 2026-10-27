import { Pressable, View, type GestureResponderEvent } from "react-native";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import type { ToothEvent } from "@/types/teeth";
import { ClockCounterClockwiseIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { ToothEventCard } from "@/components/smile/ToothEventCard";

export function RecentEventsList({
  items,
  onHistoryPress,
}: {
  items: ToothEvent[];
  onHistoryPress?: () => void;
}) {
  const colors = THEME.light;

  function handleOpenHistory(event: GestureResponderEvent) {
    event.stopPropagation();
    onHistoryPress?.();
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Pressable
      testID="recent-events"
      onPress={onHistoryPress}
      disabled={!onHistoryPress}
      accessible={false}
      focusable={false}
      className="w-full flex-none"
    >
      <Wrapper
        direction="column"
        align="center"
        justify="start"
        className="w-full flex-none rounded-xl bg-base-100 p-5 shadow-sm shadow-base-300"
      >
        <Wrapper
          direction="row"
          align="center"
          justify="between"
          className="mb-3 w-full flex-none"
        >
          <Text variant="h4" className="flex-1 text-primary-500">
            Últimos Registros
          </Text>
          <Pressable
            onPress={handleOpenHistory}
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

        <View
          className="w-full gap-3"
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          {items.map((item) => (
            <ToothEventCard key={item.id} event={item} tone="muted" />
          ))}
        </View>
      </Wrapper>
    </Pressable>
  );
}
