import { ScreenContent } from "@/components/screenContent";
import { loginReturnPath } from "@/navigation/linking";
import { useContext, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ExportIcon } from "phosphor-react-native";
import { Header } from "@/components/header";
import { ErrorState } from "@/components/errorState";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { SkeletonToothEventCard } from "@/skeletons/components/skeletonToothEventCard";
import { SessionGate } from "@/components/sessionGate";
import { SessionNotice } from "@/components/sessionNotice";
import type { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { Button } from "@/components/ui/button";
import { DeleteEventSheet } from "@/components/smile/DeleteEventSheet";
import { ExportHistorySheet } from "@/components/smile/ExportHistorySheet";
import { Text } from "@/components/ui/text";
import { ToothEventCard } from "@/components/smile/ToothEventCard";
import { ToothEventModal } from "@/components/smile/ToothEventModal";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKids } from "@/hooks/useKids";
import { useToothEvents } from "@/hooks/useToothEvents";
import { useToothEventsInfinite } from "@/hooks/useToothEventsInfinite";
import { useToothEventEditor } from "@/hooks/useToothEventEditor";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { KID_NOT_LINKED_MESSAGE } from "@/lib/toothEventError";
import { isApiError } from "@/types/predicates";
import type {
  SmileNavigationProp,
  SmileStackParamList,
} from "@/navigation/SmileStack";

const LOAD_MORE_THRESHOLD = 200;
const colors = THEME.light;

export function SmileHistory() {
  const { authToken, sessionExpired } = useContext(UserContext)!;
  const navigation = useNavigation<SmileNavigationProp>();
  const { params } = useRoute<RouteProp<SmileStackParamList, "SmileHistory">>();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [exportVisible, setExportVisible] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const allEventsQuery = useToothEvents(params.kidId, authToken);
  const {
    events,
    total,
    error: eventsError,
    isPending,
    isLoadingError,
    isRefetchError,
    isFetchNextPageError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useToothEventsInfinite(params.kidId, authToken);
  const { kids } = useKids(authToken);
  const kidRecord = kids.find((kid) => kid.id === params.kidId);
  const kidBirthDate = kidRecord?.birthDate ?? null;
  const kidGender = kidRecord?.gender ?? null;
  const canExport =
    !!kidRecord &&
    !isPending &&
    !isLoadingError &&
    allEventsQuery.events.length > 0;

  const kidUnlinked =
    (isApiError(eventsError) &&
      eventsError.code === "KID_NOT_LINKED_TO_PARENT") ||
    (isApiError(allEventsQuery.error) &&
      allEventsQuery.error.code === "KID_NOT_LINKED_TO_PARENT");

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

  function goToLogin() {
    navigation.getParent<TabNavigatorNavigationProp>()?.navigate("Profile", {
      screen: "Login",
      initial: false,
      params: { fromTab: "Smile", returnTo: loginReturnPath() },
    });
  }

  async function handleRefresh() {
    if (!authToken) {
      return;
    }
    setManualRefreshing(true);
    try {
      await Promise.all([refetch(), allEventsQuery.refetch()]);
    } finally {
      setManualRefreshing(false);
    }
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
      <SessionGate
        loadingFallback={
          <ScrollView className="w-full px-6 py-4">
            <View className="w-full gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonToothEventCard key={index} />
              ))}
            </View>
          </ScrollView>
        }
        fallback={
          <Wrapper
            className="w-full flex-1 px-6 py-4"
            direction="column"
            align="center"
            justify="center"
          >
            <SessionNotice
              title={
                sessionExpired
                  ? "Sessão expirada"
                  : "Entre para ver o histórico"
              }
              message={
                sessionExpired
                  ? "Faça login novamente para ver o histórico."
                  : "Faça login para acompanhar os registros do seu filho."
              }
              actionLabel="Fazer login"
              onAction={goToLogin}
            />
          </Wrapper>
        }
      >
        <ScrollView
          className="w-full"
          onLayout={(event) =>
            setViewportHeight(event.nativeEvent.layout.height)
          }
          onContentSizeChange={(_, height) => {
            if (viewportHeight > 0 && height <= viewportHeight) {
              loadMore();
            }
          }}
          onScroll={handleScroll}
          scrollEventThrottle={200}
          refreshControl={
            <RefreshControl
              refreshing={manualRefreshing}
              onRefresh={() => void handleRefresh()}
            />
          }
        >
          <ScreenContent
            className="my-4"
            direction="column"
            align="center"
            justify="start"
            gap="gap-4"
          >
            <Wrapper
              direction="row"
              align="center"
              justify="between"
              className="w-full"
            >
              <Wrapper direction="column" gap="gap-1" className="flex-1">
                <Text variant="h3" className="text-primary-500">
                  Histórico de registros
                </Text>
                {!isPending && !isLoadingError && (
                  <Text className="text-sm text-base-500">
                    {total === 1 ? "1 registro" : `${total} registros`}
                  </Text>
                )}
              </Wrapper>
              <Pressable
                onPress={() => setExportVisible(true)}
                disabled={!canExport}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Exportar histórico em PDF"
                accessibilityState={{ disabled: !canExport }}
                className={cn("p-1", !canExport && "opacity-40")}
              >
                <ExportIcon
                  size={24}
                  color={colors.primary500}
                  weight="regular"
                />
              </Pressable>
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
                  message={
                    kidUnlinked
                      ? KID_NOT_LINKED_MESSAGE
                      : "Verifique sua conexão e tente novamente."
                  }
                  onRetry={() => void refetch()}
                  retryLabel={kidUnlinked ? "Atualizar" : "Tentar novamente"}
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
                    message={
                      kidUnlinked
                        ? KID_NOT_LINKED_MESSAGE
                        : "Não foi possível atualizar os registros. Mostrando o histórico carregado anteriormente."
                    }
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
          </ScreenContent>
        </ScrollView>
      </SessionGate>

      <ToothEventModal {...editor.modalProps} />

      <DeleteEventSheet {...editor.confirmProps} />

      <ExportHistorySheet
        visible={exportVisible}
        kidName={kidRecord?.name ?? "Dependente"}
        kidBirthDate={kidBirthDate}
        kidGender={kidGender ?? "male"}
        kidPrematureWeeks={kidRecord?.prematureWeeks ?? null}
        events={allEventsQuery.events}
        onClose={() => setExportVisible(false)}
      />
    </Wrapper>
  );
}
