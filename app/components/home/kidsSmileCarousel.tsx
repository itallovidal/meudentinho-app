import { memo, useCallback, useContext, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { InfoIcon, PlusIcon } from "phosphor-react-native";
import { NoticeCard } from "@/components/noticeCard";
import { ToothReviewSummary } from "@/components/smile/ToothReviewSummary";
import { Separator } from "@/components/ui/separator";
import { UserContext } from "@/contexts/UserContext";
import { useToothEvents } from "@/hooks/useToothEvents";
import { useToothPredictionAlerts } from "@/hooks/useToothPredictionAlerts";
import { toothEventErrorMessage } from "@/lib/toothEventError";
import { SmileSummaryBadge } from "@/components/smile/smileSummaryBadge";
import { ToothEventCard } from "@/components/smile/ToothEventCard";
import type { ToothMapStateKey } from "@/components/smile/teeth/toothStyle";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import type { KidSmileSummary } from "@/hooks/useKidsSmileSummaries";
import type { SmileSummary } from "@/lib/smileSummary";
import { THEME } from "@/lib/theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import {
  cn,
  formatAgeFromBirthDate,
  formatAgeMonthsFromBirthDate,
} from "@/lib/utils";

const PAGE_MARGIN = 24;
const CARD_GAP = 12;
const CARD_PEEK = 8;
export const SMILE_SUMMARY_BLOCK_HEIGHT = 64;
export const EVENTS_BLOCK_HEIGHT = 96;
export const SMILE_CONTENT_MIN_HEIGHT = 144;

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

function emptyMapDescription(
  name: string,
  birthDate: string,
  referenceDate: Date,
): string {
  const age =
    formatAgeMonthsFromBirthDate(birthDate, referenceDate) ?? "poucos meses";
  return `Como o ${name} tem ${age}, as gengivas ainda estão se preparando.`;
}

function emptyEventsDescription(name: string): string {
  return `Cada conquista do ${name} ficará registrada neste espaço. Toque em '+ novo registro' ali embaixo para começar!`;
}

type KidAction = (kidId: string) => void;

type SmileSummaryCardProps = {
  item: KidSmileSummary;
  width: number;
  summaryHeight: number;
  badgesHeight: number;
  onBadgesLayout: (event: LayoutChangeEvent) => void;
  onSummaryLayout: (event: LayoutChangeEvent) => void;
  onOpenKid: KidAction;
  onOpenHistory: KidAction;
};

const SmileSummaryCard = memo(function SmileSummaryCard({
  item,
  width,
  summaryHeight,
  badgesHeight,
  onBadgesLayout,
  onSummaryLayout,
  onOpenKid,
  onOpenHistory,
}: SmileSummaryCardProps) {
  const { kid, summary, recentEvents } = item;
  const { authToken } = useContext(UserContext)!;
  const eventsQuery = useToothEvents(kid.id, authToken);
  const alerts = useToothPredictionAlerts({
    kid,
    events: eventsQuery.events,
    eventsReady: eventsQuery.hasCompleteData,
    eventsStale: eventsQuery.isRefetchError,
  });
  const reviewError = alerts.error ?? eventsQuery.error;
  const reviewErrorMessage =
    alerts.evaluationError ??
    (reviewError
      ? toothEventErrorMessage(
          reviewError,
          "Não foi possível carregar a revisão dos registros.",
        )
      : alerts.stale
        ? "Os dados estão desatualizados. Atualize a revisão dos registros."
        : null);
  const colors = THEME.light;
  const initial = (kid.name.trim().charAt(0) || "?").toUpperCase();
  const age = formatAgeFromBirthDate(kid.birthDate, alerts.referenceDate);
  const badges = SUMMARY_BADGES.filter((badge) => summary[badge.key] > 0);

  return (
    <View
      style={{ width }}
      className="shrink-0 rounded-2xl bg-base-100 p-5 web:snap-start web:snap-always"
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
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
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
          <Text className="text-xs font-bold tracking-wide text-primary">
            VER DETALHES
          </Text>
        </Pressable>
      </Wrapper>

      <View className="w-full" style={{ minHeight: summaryHeight }}>
        <View className="w-full" onLayout={onSummaryLayout}>
          <View
            className="w-full"
            style={badges.length > 0 ? { minHeight: badgesHeight } : undefined}
          >
            <Wrapper
              direction="row"
              align="center"
              justify={badges.length === 0 ? "center" : "start"}
              gap="gap-2"
              className="w-full flex-wrap"
              onLayout={badges.length > 0 ? onBadgesLayout : undefined}
            >
              {badges.length === 0 ? (
                <NoticeCard
                  title={EMPTY_MAP_TITLE}
                  description={emptyMapDescription(
                    kid.name,
                    kid.birthDate,
                    alerts.referenceDate,
                  )}
                  icon={
                    <InfoIcon
                      size={17}
                      color={colors.secondary800}
                      weight="bold"
                    />
                  }
                  className="border-secondary-200 bg-secondary-100"
                />
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
          </View>

          {badges.length > 0 && (
            <View className="mt-3 w-full gap-3">
              <Separator className="bg-base-200" />
              <ToothReviewSummary
                reviewCounts={
                  alerts.ready
                    ? {
                        active: alerts.active.length,
                        snoozed: alerts.snoozed.length,
                        historical: alerts.historical.length,
                      }
                    : null
                }
                reviewError={reviewErrorMessage}
                onRetry={() => {
                  void eventsQuery.refetch();
                  void alerts.refetch();
                }}
              />
            </View>
          )}
        </View>
      </View>

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
          <Text className="text-xs font-bold tracking-wide text-primary">
            VER MAIS
          </Text>
        </Pressable>
      </Wrapper>

      <View className="w-full" style={{ minHeight: EVENTS_BLOCK_HEIGHT }}>
        {recentEvents.length === 0 ? (
          <NoticeCard
            title={EMPTY_EVENTS_TITLE}
            description={emptyEventsDescription(kid.name)}
            icon={
              <InfoIcon size={17} color={colors.secondary800} weight="bold" />
            }
            className="border-secondary-200 bg-secondary-100"
          />
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

function CarouselSeparator() {
  return <View style={{ width: CARD_GAP }} />;
}

export function KidsSmileCarousel({
  items,
  onOpenKid,
  onOpenHistory,
  onRegisterEvent,
}: KidsSmileCarouselProps) {
  const { width: containerWidth, onLayout } = useContainerWidth(
    PAGE_MARGIN * 2,
  );
  const colors = THEME.light;
  const [activeIndex, setActiveIndex] = useState(0);
  const [summaryHeight, setSummaryHeight] = useState(SMILE_CONTENT_MIN_HEIGHT);
  const [badgesHeight, setBadgesHeight] = useState(SMILE_SUMMARY_BLOCK_HEIGHT);

  const handleBadgesLayout = useCallback((event: LayoutChangeEvent) => {
    const height = Math.ceil(event.nativeEvent.layout.height);
    setBadgesHeight((current) => Math.max(current, height));
  }, []);

  const handleSummaryLayout = useCallback((event: LayoutChangeEvent) => {
    const height = Math.ceil(event.nativeEvent.layout.height);
    setSummaryHeight((current) => Math.max(current, height));
  }, []);

  const hasPagination = items.length > 1;
  const cardWidth = kidsSmileCardWidth(
    containerWidth + PAGE_MARGIN * 2,
    items.length,
  );
  const step = cardWidth + CARD_GAP;
  const lastIndex = Math.max(items.length - 1, 0);
  const currentIndex = Math.min(activeIndex, lastIndex);
  const activeKidId = items[currentIndex]?.kid.id ?? null;

  const handleScrollIndex = useCallback(
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
        summaryHeight={summaryHeight}
        badgesHeight={badgesHeight}
        onBadgesLayout={handleBadgesLayout}
        onSummaryLayout={handleSummaryLayout}
        onOpenKid={onOpenKid}
        onOpenHistory={onOpenHistory}
      />
    ),
    [
      cardWidth,
      summaryHeight,
      badgesHeight,
      handleBadgesLayout,
      handleSummaryLayout,
      onOpenKid,
      onOpenHistory,
    ],
  );

  return (
    <View className="mt-2 w-full" onLayout={onLayout}>
      <FlatList
        testID="kids-smile-carousel"
        data={items}
        keyExtractor={(item) => item.kid.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-base-200 web:snap-x web:snap-mandatory"
        contentContainerStyle={{
          paddingRight: hasPagination ? CARD_GAP + CARD_PEEK : 0,
        }}
        ItemSeparatorComponent={CarouselSeparator}
        snapToInterval={step}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={handleScrollIndex}
        onScrollEndDrag={handleScrollIndex}
        onScroll={Platform.OS === "web" ? handleScrollIndex : undefined}
        scrollEventThrottle={16}
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
          accessibilityLabel="Novo registro dentário"
        >
          <Wrapper direction="row" align="center" gap="gap-1">
            <PlusIcon size={16} color={colors.primary400} weight="bold" />
            <Text className="text-sm font-bold text-primary">
              novo registro
            </Text>
          </Wrapper>
        </Pressable>
      </Wrapper>
    </View>
  );
}
