import { useContext, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { DeleteEventSheet } from "@/components/smile/DeleteEventSheet";
import { Text } from "@/components/ui/text";
import { ToothEventCard } from "@/components/smile/ToothEventCard";
import { ToothEventModal } from "@/components/smile/ToothEventModal";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKids } from "@/hooks/useKids";
import { useToothEvents } from "@/hooks/useToothEvents";
import { useToothEventsInfinite } from "@/hooks/useToothEventsInfinite";
import { useToothEventEditor } from "@/hooks/useToothEventEditor";
import type { SmileStackParamList } from "@/navigation/SmileStack";

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
            <View className="w-full gap-3">
              {events.map((event) => (
                <ToothEventCard
                  key={event.id}
                  event={event}
                  onPress={editor.openEditor}
                />
              ))}
            </View>
          )}

          {!isPending && !isError && renderFooter()}
        </Wrapper>
      </ScrollView>

      <ToothEventModal {...editor.modalProps} />

      <DeleteEventSheet {...editor.confirmProps} />
    </Wrapper>
  );
}
