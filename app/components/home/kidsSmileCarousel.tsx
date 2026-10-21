import { memo, useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { PlusIcon } from "phosphor-react-native";
import { SmileSummaryBadge } from "@/components/smile/smileSummaryBadge";
import { ToothEventCard } from "@/components/smile/ToothEventCard";
import type { ToothMapStateKey } from "@/components/smile/teeth/toothStyle";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import type { KidSmileSummary } from "@/hooks/useKidsSmileSummaries";
import type { SmileSummary } from "@/lib/smileSummary";
import { THEME } from "@/lib/theme";
import {
  cn,
  formatAgeFromBirthDate,
  formatAgeMonthsFromBirthDate,
} from "@/lib/utils";

const PAGE_MARGIN = 24;
const CARD_GAP = 12;
const CARD_PEEK = 24;
export const SMILE_SUMMARY_BLOCK_HEIGHT = 112;
export const EVENTS_BLOCK_HEIGHT = 96;

export function kidsSmileCardWidth(
  screenWidth: number,
  itemCount: number,
): number {
  const availableWidth = screenWidth - PAGE_MARGIN * 2;
  return itemCount > 1 ? availableWidth - CARD_GAP - CARD_PEEK : availableWidth;
}

const SUMMARY_BADGES: {
  state: ToothMapStateKey;
  key: keyof Omit<SmileSummary, "registered">;
  label: string;
}[] = [
  { state: "bornPermanent", key: "bornPermanent", label: "definitivos" },
  { state: "bornMilk", key: "bornMilk", label: "de leite" },
  { state: "fell", key: "fell", label: "caiu" },
  { state: "eruptionWindow", key: "eruptionWindow", label: "por nascer" },
];

const EMPTY_MAP_TITLE = "O primeiro dentinho está por vir!";
const EMPTY_EVENTS_TITLE = "A história do sorriso começa aqui!";

function emptyMapDescription(name: string, birthDate: string): string {
  const age = formatAgeMonthsFromBirthDate(birthDate) ?? "poucos meses";
  return `Como o ${name} tem apenas ${age}, as gengivas ainda estão se preparando.`;
}

function emptyEventsDescription(name: string): string {
  return `Cada conquista do ${name} ficará registrada neste espaço. Toque em '+ registrar evento' ali embaixo para começar!`;
}

type KidAction = (kidId: string) => void;

type SmileSummaryCardProps = {
  item: KidSmileSummary;
  width: number;
  onOpenKid: KidAction;
  onOpenHistory: KidAction;
};

const SmileSummaryCard = memo(function SmileSummaryCard({
  item,
  width,
  onOpenKid,
  onOpenHistory,
}: SmileSummaryCardProps) {
  const { kid, summary, recentEvents } = item;
  const initial = (kid.name.trim().charAt(0) || "?").toUpperCase();
  const age = formatAgeFromBirthDate(kid.birthDate);
  const badges = SUMMARY_BADGES.filter((badge) => summary[badge.key] > 0);

  return (
    <View
      style={{ width, marginRight: CARD_GAP }}
      className="rounded-2xl bg-base-100 p-5"
    >
      <Pressable
        onPress={() => onOpenKid(kid.id)}
        accessibilityRole="button"
        accessibilityLabel={`Ver o sorriso de ${kid.name}`}
        className="w-full flex-row items-center gap-3"
      >
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500">
          <Text className="text-xl font-bold text-base-100">{initial}</Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="text-lg font-bold leading-6 text-primary-800"
            numberOfLines={1}
          >
            {kid.name}
          </Text>
          {age ? (
            <Text className="text-sm text-base-500" numberOfLines={1}>
              {age}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="mb-3 mt-4 w-full"
      >
        <Text variant="h4" className="text-primary-500">
          Mapa do Sorriso
        </Text>
        <Pressable
          onPress={() => onOpenKid(kid.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ver detalhes do mapa do sorriso"
        >
          <Text className="text-xs font-bold tracking-wide text-primary-400">
            VER DETALHES
          </Text>
        </Pressable>
      </Wrapper>

      <Wrapper
        direction="row"
        align="center"
        justify={badges.length === 0 ? "center" : "start"}
        gap="gap-2"
        className="w-full flex-wrap"
        style={{ minHeight: SMILE_SUMMARY_BLOCK_HEIGHT }}
      >
        {badges.length === 0 ? (
          <View className="w-full flex-row items-center gap-3">
            <Image
              source={require("../../../assets/dentalkidmap.png")}
              resizeMode="contain"
              accessibilityLabel="Mapa do sorriso sem registros"
              className="h-24 w-24"
            />
            <View className="min-w-0 flex-1 gap-1">
              <Text
                className="text-sm font-bold leading-5 text-primary-800"
                numberOfLines={2}
              >
                {EMPTY_MAP_TITLE}
              </Text>
              <Text
                className="text-xs leading-5 text-base-500"
                numberOfLines={3}
              >
                {emptyMapDescription(kid.name, kid.birthDate)}
              </Text>
            </View>
          </View>
        ) : (
          badges.map((badge) => (
            <SmileSummaryBadge
              key={badge.state}
              state={badge.state}
              value={summary[badge.key]}
              label={badge.label}
            />
          ))
        )}
      </Wrapper>

      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="mb-3 mt-5 w-full"
      >
        <Text variant="h4" className="text-primary-500">
          Últimos Registros
        </Text>
        <Pressable
          onPress={() => onOpenHistory(kid.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ver mais registros"
        >
          <Text className="text-xs font-bold tracking-wide text-primary-400">
            VER MAIS
          </Text>
        </Pressable>
      </Wrapper>

      <View className="w-full" style={{ minHeight: EVENTS_BLOCK_HEIGHT }}>
        {recentEvents.length === 0 ? (
          <View className="w-full flex-row items-center gap-3">
            <Image
              source={require("../../../assets/smilehistory.png")}
              resizeMode="contain"
              accessibilityLabel="Histórico sem registros"
              className="h-32 w-24"
            />
            <View className="min-w-0 flex-1 gap-1">
              <Text
                className="text-sm font-bold leading-5 text-primary-800"
                numberOfLines={2}
              >
                {EMPTY_EVENTS_TITLE}
              </Text>
              <Text
                className="text-xs leading-5 text-base-500"
                numberOfLines={5}
              >
                {emptyEventsDescription(kid.name)}
              </Text>
            </View>
          </View>
        ) : (
          <View className="w-full gap-2">
            {recentEvents.map((event) => (
              <ToothEventCard
                key={event.id}
                event={event}
                tone="muted"
                size="small"
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

type KidsSmileCarouselProps = {
  items: KidSmileSummary[];
  onOpenKid: KidAction;
  onOpenHistory: KidAction;
  onRegisterEvent: KidAction;
};

export function KidsSmileCarousel({
  items,
  onOpenKid,
  onOpenHistory,
  onRegisterEvent,
}: KidsSmileCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const colors = THEME.light;
  const [activeIndex, setActiveIndex] = useState(0);

  const hasPagination = items.length > 1;
  const cardWidth = kidsSmileCardWidth(screenWidth, items.length);
  const step = cardWidth + CARD_GAP;
  const lastIndex = Math.max(items.length - 1, 0);
  const currentIndex = Math.min(activeIndex, lastIndex);
  const activeKidId = items[currentIndex]?.kid.id ?? null;

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / step);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), lastIndex));
    },
    [lastIndex, step],
  );

  const renderItem = useCallback(
    ({ item }: { item: KidSmileSummary }) => (
      <SmileSummaryCard
        item={item}
        width={cardWidth}
        onOpenKid={onOpenKid}
        onOpenHistory={onOpenHistory}
      />
    ),
    [cardWidth, onOpenKid, onOpenHistory],
  );

  return (
    <View className="mt-2 w-full">
      <FlatList
        data={items}
        keyExtractor={(item) => item.kid.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-base-200"
        snapToInterval={step}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: step,
          offset: step * index,
          index,
        })}
        renderItem={renderItem}
      />

      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="mt-3 w-full"
      >
        {hasPagination ? (
          <Wrapper
            direction="row"
            align="center"
            gap="gap-1.5"
            accessibilityLabel={`Dependente ${currentIndex + 1} de ${items.length}`}
          >
            {items.map((item, index) => (
              <View
                key={item.kid.id}
                className={cn(
                  "h-2 w-2 rounded-full",
                  index === currentIndex ? "bg-primary-500" : "bg-base-300",
                )}
              />
            ))}
          </Wrapper>
        ) : (
          <View className="h-2 w-2" />
        )}

        <Pressable
          onPress={() => {
            if (activeKidId) {
              onRegisterEvent(activeKidId);
            }
          }}
          disabled={!activeKidId}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Registrar evento dentário"
        >
          <Wrapper direction="row" align="center" gap="gap-1">
            <PlusIcon size={16} color={colors.primary400} weight="bold" />
            <Text className="text-sm font-bold text-primary-400">
              registrar evento
            </Text>
          </Wrapper>
        </Pressable>
      </Wrapper>
    </View>
  );
}
