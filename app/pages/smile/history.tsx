import { useContext, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { BabyIcon, CalendarCheckIcon, ToothIcon } from "phosphor-react-native";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { Text } from "@/components/ui/text";
import { ToothEventModal } from "@/components/smile/ToothEventModal";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKids } from "@/hooks/useKids";
import { useToothEvents } from "@/hooks/useToothEvents";
import { useToothEventsInfinite } from "@/hooks/useToothEventsInfinite";
import { useToothEventEditor } from "@/hooks/useToothEventEditor";
import type { SmileStackParamList } from "@/navigation/SmileStack";
import { archLabel, toothEventTitle, toothTypeLabel } from "@/lib/teethLabels";
import { parseLocalDate } from "@/lib/utils";
import type { ToothEvent } from "@/types/teeth";
import { THEME } from "@/lib/theme";

const EVENT_COLOR_MAP: Record<string, string> = {
  exfoliation: THEME.light.primary400,
  eruption: THEME.light.tertiary400,
};

const DENTITION_ICON_MAP: Record<string, any> = {
  primary: BabyIcon,
  permanent: ToothIcon,
};

const DEFAULT_EVENT_ICON = {
  Icon: CalendarCheckIcon,
  color: THEME.light.base500,
};

const LOAD_MORE_THRESHOLD = 200;

export function SmileHistory() {
  const { authToken } = useContext(UserContext)!;
  const { params } = useRoute<RouteProp<SmileStackParamList, "SmileHistory">>();
  const [viewportHeight, setViewportHeight] = useState(0);

  const allEventsQuery = useToothEvents(params.kidId, authToken);
  const {
    events,
    total,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useToothEventsInfinite(params.kidId, authToken);
  const { kids } = useKids(authToken);
  const kidRecord = kids.find((kid) => kid.id === params.kidId);
  const kidBirthDate = kidRecord?.birthDate ?? null;
  const kidGender = kidRecord?.gender ?? null;

  const editor = useToothEventEditor({
    kidId: params.kidId,
    kidBirthDate,
    kidGender,
    authToken,
    events: allEventsQuery.events,
  });

  function loadMore() {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - LOAD_MORE_THRESHOLD
    ) {
      loadMore();
    }
  }

  function handleRefresh() {
    void refetch();
    void allEventsQuery.refetch();
  }

  function renderDateBlock(occurrenceDate: string) {
    const date = parseLocalDate(occurrenceDate);
    if (!date) {
      return null;
    }
    const month = date
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "");
    return (
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-base-200">
        <Text className="text-lg font-bold leading-none text-primary-500">
          {String(date.getDate()).padStart(2, "0")}
        </Text>
        <Text className="text-xs uppercase text-base-500">{month}</Text>
      </View>
    );
  }

  function renderEvent(event: ToothEvent) {
    const Icon = DENTITION_ICON_MAP[event.dentition] ?? DEFAULT_EVENT_ICON.Icon;
    const color = EVENT_COLOR_MAP[event.eventType] ?? DEFAULT_EVENT_ICON.color;
    return (
      <Pressable
        key={event.id}
        onPress={() => editor.openEditor(event)}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${toothTypeLabel(event.toothType)} ${archLabel(event.arch)}`}
        className="w-full flex-row items-center gap-3 rounded-2xl bg-base-100 p-3 shadow-sm shadow-base-300"
      >
        {renderDateBlock(event.occurrenceDate)}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Icon size={16} color={color} weight="bold" />
            <Text className="flex-1 text-sm font-semibold text-primary-800">
              {toothEventTitle(event)}
            </Text>
          </View>
          {event.note ? (
            <Text className="text-xs text-base-500" numberOfLines={2}>
              {event.note}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  }

  function renderFooter() {
    if (isFetchingNextPage) {
      return (
        <Text className="py-2 text-center text-sm text-base-500">
          Carregando mais registros...
        </Text>
      );
    }
    if (!hasNextPage && events.length > 0) {
      return (
        <Text className="py-2 text-center text-sm text-base-500">
          Você chegou ao fim do histórico
        </Text>
      );
    }
    return null;
  }

  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="flex-1 bg-base-200"
    >
      <Header hasBackButton />
      <ScrollView
        className="w-full"
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => {
          if (viewportHeight > 0 && height <= viewportHeight) {
            loadMore();
          }
        }}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || allEventsQuery.isFetching}
            onRefresh={handleRefresh}
          />
        }
      >
        <Wrapper
          className="mx-6 my-4"
          direction="column"
          align="center"
          justify="start"
          gap="gap-4"
        >
          <Wrapper direction="column" gap="gap-1" className="w-full">
            <Text variant="h3" className="text-primary-500">
              Histórico de registros
            </Text>
            {!isPending && !isError && (
              <Text className="text-sm text-base-500">
                {total === 1 ? "1 registro" : `${total} registros`}
              </Text>
            )}
          </Wrapper>

          {isPending && (
            <Text className="text-base-500">Carregando registros...</Text>
          )}

          {isError && (
            <Wrapper
              direction="column"
              align="center"
              justify="center"
              gap="gap-4"
              className="w-full rounded-xl bg-base-100 p-6"
            >
              <Text className="text-center">
                Não foi possível carregar os registros. Verifique sua conexão.
              </Text>
              <Button onPress={() => void refetch()}>
                <Text>Tentar novamente</Text>
              </Button>
            </Wrapper>
          )}

          {!isPending && !isError && events.length === 0 && (
            <Wrapper
              className="w-full rounded-xl bg-base-100 p-6"
              direction="column"
              align="center"
              justify="center"
            >
              <Text className="text-center text-base-500">
                Nenhum registro ainda. Os eventos aparecem aqui conforme forem
                cadastrados no mapa.
              </Text>
            </Wrapper>
          )}

          {!isPending && !isError && events.length > 0 && (
            <View className="w-full gap-3">{events.map(renderEvent)}</View>
          )}

          {!isPending && !isError && renderFooter()}
        </Wrapper>
      </ScrollView>

      <ToothEventModal {...editor.modalProps} />

      <ConfirmDialog {...editor.confirmProps} />
    </Wrapper>
  );
}
