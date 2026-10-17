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
import { ErrorState } from "@/components/errorState";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { SkeletonToothEventCard } from "@/skeletons/components/skeletonToothEventCard";
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
    isLoadingError,
    isRefetchError,
    isFetchNextPageError,
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
    if (isFetchNextPageError) {
      return (
        <View className="w-full items-center py-2">
          <Button
            variant="outline"
            size="sm"
            onPress={() => void fetchNextPage()}
          >
            <Text className="text-sm font-bold text-primary-500">
              Tentar novamente
            </Text>
          </Button>
        </View>
      );
    }
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
            {!isPending && !isLoadingError && (
              <Text className="text-sm text-base-500">
                {total === 1 ? "1 registro" : `${total} registros`}
              </Text>
            )}
          </Wrapper>

          {isPending && (
            <View className="w-full gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonToothEventCard key={index} />
              ))}
            </View>
          )}

          {isLoadingError && (
            <View className="w-full gap-3">
              <ErrorState
                title="Não foi possível carregar os registros"
                message="Verifique sua conexão e tente novamente."
                onRetry={() => void refetch()}
              />
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonToothEventCard key={index} />
              ))}
            </View>
          )}

          {!isPending && !isLoadingError && events.length === 0 && (
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

          {!isPending && !isLoadingError && events.length > 0 && (
            <View className="w-full gap-3">
              {isRefetchError && (
                <QueryWarningBanner
                  message="Não foi possível atualizar os registros. Mostrando o histórico carregado anteriormente."
                  onRetry={() => void refetch()}
                />
              )}
              {events.map((event) => (
                <ToothEventCard
                  key={event.id}
                  event={event}
                  onPress={editor.openEditor}
                />
              ))}
            </View>
          )}

          {!isPending && !isLoadingError && renderFooter()}
        </Wrapper>
      </ScrollView>

      <ToothEventModal {...editor.modalProps} />

      <DeleteEventSheet {...editor.confirmProps} />
    </Wrapper>
  );
}
