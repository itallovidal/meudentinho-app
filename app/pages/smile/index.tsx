import { ScreenContent } from "@/components/screenContent";
import { loginReturnPath } from "@/navigation/linking";
import { useToothPredictionAlerts } from "@/hooks/useToothPredictionAlerts";
import { useContext, useMemo, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { ErrorState } from "@/components/errorState";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { DeleteEventSheet } from "@/components/smile/DeleteEventSheet";
import { useToast } from "@/components/ui/toast";
import { AddDependentSheet } from "@/components/smile/AddDependentSheet";
import { DentalMap } from "@/components/smile/DentalMap";
import { DentalTipCard } from "@/components/smile/DentalTipCard";

import { KidSelector } from "@/components/smile/KidSelector";
import { RecentEventsList } from "@/components/smile/RecentEventsList";
import { ToothEventModal } from "@/components/smile/ToothEventModal";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKidMutations } from "@/hooks/useKidMutations";
import { useKids } from "@/hooks/useKids";
import { useToothEvents } from "@/hooks/useToothEvents";
import { useToothEventEditor } from "@/hooks/useToothEventEditor";
import { resolveAccountId, toothEventsQueryKey } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/errorMessage";
import {
  KID_NOT_LINKED_MESSAGE,
  toothEventErrorMessage,
} from "@/lib/toothEventError";
import { isApiError } from "@/types/predicates";
import type { SmileStackParamList } from "@/navigation/SmileStack";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { createToothEvent } from "@/api/smile/createToothEvent";
import { PredictionsCard } from "@/components/smile/PredictionsCard";
import { ApiError } from "@/types/domain";
import { KidFormValues } from "@/lib/schemas/kid";
import { buildKidRequest } from "@/lib/privacyPolicy";
import type { ToothEventRequestDTO } from "@/types/teeth";
import { ageInMonths, birthDateToString } from "@/lib/utils";
import { buildToothPredictions } from "@/lib/toothPredictions";
import { SkeletonDentalMap } from "@/skeletons/components/SkeletonDentalMap";
import { SkeletonKidSelector } from "@/skeletons/components/skeletonKidSelector";
import { SkeletonDentalTipCard } from "@/skeletons/components/skeletonDentalTipCard";
import { SkeletonRecentEventsList } from "@/skeletons/components/skeletonRecentEventsList";
import { SkeletonSmilePage } from "@/skeletons/pages/skeletonSmilePage";
import { SessionCard } from "@/components/sessionCard";
import { SessionNotice } from "@/components/sessionNotice";

const TOTAL_MILK_TEETH = 20;

export function Smile() {
  const { user, authToken, userId, hydrated, sessionExpired, expireSession } =
    useContext(UserContext)!;
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const { params } = useRoute<RouteProp<SmileStackParamList, "SmileHome">>();
  const routeKidId = params?.kidId ?? null;
  const queryClient = useQueryClient();
  const [addDependentVisible, setAddDependentVisible] = useState(false);
  const [addDependentError, setAddDependentError] = useState<ApiError | null>(
    null,
  );
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const { showToast } = useToast();
  const { createKidMutation } = useKidMutations(authToken);

  const {
    kids: kidsList,
    isLoading: kidsInitialLoading,
    failure: kidsFailure,
    error: kidsError,
    refetchError: kidsRefetchError,
    refetch: refetchKids,
  } = useKids(authToken);

  const kids = useMemo(
    () =>
      kidsList.map((kid) => ({
        id: kid.id,
        name: kid.name,
        birthDate: birthDateToString(kid.birthDate),
      })),
    [kidsList],
  );

  const accountId = resolveAccountId(userId, authToken);

  const [selectedKidId, setSelectedKidId] = useState<string | null>(routeKidId);
  const [prevRouteKidId, setPrevRouteKidId] = useState(routeKidId);
  const kidsKey = kids.map((kid) => kid.id).join(",");
  const [prevKidsKey, setPrevKidsKey] = useState<string | null>(null);

  if (routeKidId !== prevRouteKidId) {
    setPrevRouteKidId(routeKidId);
    if (routeKidId) {
      setSelectedKidId(routeKidId);
    }
  }

  if (kidsKey !== prevKidsKey) {
    setPrevKidsKey(kidsKey);
    if (kids.length === 0) {
      if (selectedKidId !== null) {
        setSelectedKidId(null);
      }
    } else if (!kids.some((kid) => kid.id === selectedKidId)) {
      setSelectedKidId(kids[0].id);
    }
  }

  const eventsQuery = useToothEvents(selectedKidId, authToken);
  const { events } = eventsQuery;

  const eventsInitialLoading = eventsQuery.isLoading;
  const eventsFirstLoadError = eventsQuery.isLoadingError;
  const eventsRefetchError = eventsQuery.isRefetchError;

  const registerMutation = useMutation({
    mutationFn: (request: ToothEventRequestDTO) =>
      createToothEvent(request, authToken ?? null),
    onSuccess: (_data, request) =>
      queryClient.invalidateQueries({
        queryKey: toothEventsQueryKey(accountId, request.kidId),
      }),
  });

  async function handleRegisterEvent(payload: ToothEventRequestDTO) {
    await registerMutation.mutateAsync(payload);
  }

  async function handleCreateDependent(data: KidFormValues) {
    if (createKidMutation.isPending) {
      return;
    }
    try {
      await createKidMutation.mutateAsync(await buildKidRequest(data));
      setAddDependentError(null);
      setAddDependentVisible(false);
      showToast("Dependente cadastrado com sucesso.");
    } catch (error) {
      if (error instanceof ApiError) {
        setAddDependentError(error);
        return;
      }
      setAddDependentError(
        new ApiError(
          errorMessage(
            error,
            "Não foi possível cadastrar o dependente. Verifique sua conexão e tente novamente.",
          ),
          "NETWORK_ERROR",
        ),
      );
    }
  }

  function handleCloseDependentSheet() {
    setAddDependentError(null);
    setAddDependentVisible(false);
  }

  function handleOpenKid(kidId: string) {
    const kidRecord = kidsList.find((kid) => kid.id === kidId);
    if (!kidRecord) {
      return;
    }
    navigation.navigate("Profile", {
      screen: "EditDependent",
      initial: false,
      params: { kidId: kidRecord.id, fromTab: "Smile" },
    });
  }

  const stats = useMemo(() => {
    const exfoliated = new Set<string>();
    for (const event of events) {
      if (event.eventType === "exfoliation" && event.dentition === "primary") {
        exfoliated.add(`${event.quadrant}:${event.toothType}`);
      }
    }
    return {
      totalMilkTeeth: TOTAL_MILK_TEETH,
      exchanged: Math.min(exfoliated.size, TOTAL_MILK_TEETH),
    };
  }, [events]);

  const selectedKidRecord = kidsList.find((kid) => kid.id === selectedKidId);
  const kidBirthDate = selectedKidRecord ? selectedKidRecord.birthDate : null;
  const kidGender = selectedKidRecord?.gender ?? null;
  const kidAgeMonths = kidBirthDate ? ageInMonths(kidBirthDate) : null;

  const dentalTip = useMemo(() => {
    if (stats.exchanged > 0) {
      return {
        title: "Troca de dentes",
        description:
          "Os dentes permanentes substituem os de leite; os molares permanentes nascem atrás da arcada. Mantenha a escovação após as refeições e visite o dentista regularmente.",
      };
    }
    if (kidAgeMonths !== null && kidAgeMonths < 30) {
      return {
        title: "Primeiros dentinhos",
        description:
          "Os incisivos centrais inferiores costumam nascer por volta dos 6 meses. Alivie o desconforto com mordedores limpos.",
      };
    }
    return {
      title: "Molar dos 6 anos",
      description:
        "Este dente nasce sem cair nenhum outro. Atenção especial à escovação no fundo da boca!",
    };
  }, [stats.exchanged, kidAgeMonths]);

  const alerts = useToothPredictionAlerts({
    kid: selectedKidRecord,
    events,
    eventsReady: eventsQuery.hasCompleteData,
    eventsStale: eventsRefetchError || !!kidsRefetchError,
  });
  const predictions = useMemo(
    () =>
      buildToothPredictions(
        kidBirthDate,
        events,
        kidGender,
        alerts.referenceDate,
      ),
    [kidBirthDate, kidGender, events, alerts.referenceDate],
  );

  const editor = useToothEventEditor({
    kidId: selectedKidId,
    kidBirthDate,
    kidGender,
    authToken,
    events,
  });

  function openHistory() {
    if (selectedKidId) {
      navigation.navigate("Smile", {
        screen: "SmileHistory",
        params: { kidId: selectedKidId },
      });
    }
  }

  function openPredictions() {
    if (selectedKidId) {
      navigation.navigate("Smile", {
        screen: "SmilePredictions",
        params: { kidId: selectedKidId },
      });
    }
  }

  const kidUnlinked =
    isApiError(eventsQuery.error) &&
    eventsQuery.error.code === "KID_NOT_LINKED_TO_PARENT";

  async function handleRefreshKids() {
    setManualRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["kids"] }),
        queryClient.invalidateQueries({ queryKey: ["tooth-events"] }),
      ]);
    } finally {
      setManualRefreshing(false);
    }
  }

  function goToLogin() {
    navigation.navigate("Profile", {
      screen: "Login",
      initial: false,
      params: { fromTab: "Smile", returnTo: loginReturnPath() },
    });
  }

  function goToSignup() {
    navigation.navigate("Profile", {
      screen: "Signup",
      initial: false,
      params: { fromTab: "Smile", returnTo: loginReturnPath() },
    });
  }

  if (!hydrated) {
    return <SkeletonSmilePage />;
  }

  if (!authToken || !user) {
    return (
      <Wrapper
        direction="column"
        align="center"
        justify="start"
        className="flex-1 bg-base-200"
      >
        <Header />
        <Wrapper
          direction="column"
          align="center"
          justify="center"
          className="w-full flex-1 px-6"
        >
          {sessionExpired ? (
            <SessionNotice
              title="Sessão expirada"
              message="Entre novamente para acompanhar o sorriso."
              actionLabel="Entrar"
              onAction={goToLogin}
            />
          ) : (
            <SessionCard
              layout="stacked"
              title="Acompanhe o sorriso"
              message="Faça login para registrar e acompanhar os eventos dentários."
              actionLabel="Fazer login"
              onAction={goToLogin}
              secondaryLabel="Criar conta"
              onSecondary={goToSignup}
            />
          )}
        </Wrapper>
      </Wrapper>
    );
  }

  if (kidsInitialLoading) {
    return (
      <SkeletonSmilePage
        refreshing={manualRefreshing}
        onRefresh={() => void handleRefreshKids()}
      />
    );
  }

  if (kidsFailure) {
    const isAuth = kidsFailure === "auth";
    if (isAuth) {
      return (
        <Wrapper
          direction="column"
          align="center"
          justify="start"
          className="flex-1 bg-base-200"
        >
          <Header />
          <Wrapper
            direction="column"
            align="center"
            justify="center"
            className="w-full flex-1 px-6"
          >
            <SessionNotice
              title="Sessão expirada"
              message="Faça login novamente para acompanhar o sorriso."
              actionLabel="Entrar"
              onAction={() => void expireSession()}
            />
          </Wrapper>
        </Wrapper>
      );
    }
    return (
      <Wrapper
        direction="column"
        align="center"
        justify="start"
        className="flex-1 bg-base-200"
      >
        <Header />
        <ScrollView
          className="w-full"
          refreshControl={
            <RefreshControl
              refreshing={manualRefreshing}
              onRefresh={() => void handleRefreshKids()}
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
            <SkeletonKidSelector />
            <SkeletonDentalMap
              error={
                <ErrorState
                  message={toothEventErrorMessage(
                    kidsError,
                    "Não foi possível carregar os dependentes.",
                  )}
                  onRetry={() => void refetchKids()}
                />
              }
            />
            <SkeletonDentalTipCard />
            <SkeletonRecentEventsList />
          </ScreenContent>
        </ScrollView>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="flex-1 bg-base-200"
    >
      <Header />
      <ScrollView
        className="w-full"
        refreshControl={
          <RefreshControl
            refreshing={manualRefreshing}
            onRefresh={() => void handleRefreshKids()}
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
          <KidSelector
            referenceDate={alerts.referenceDate}
            kids={kids}
            selectedId={selectedKidId}
            onSelect={setSelectedKidId}
            onOpen={handleOpenKid}
            onAdd={() =>
              navigation.navigate("Profile", {
                screen: "Dependents",
                initial: false,
                params: { fromTab: "Smile" },
              })
            }
          />

          {eventsInitialLoading && (
            <>
              <SkeletonDentalMap />
              <SkeletonDentalTipCard />
              <SkeletonRecentEventsList />
            </>
          )}

          {eventsFirstLoadError && (
            <>
              <SkeletonDentalMap
                error={
                  <ErrorState
                    message={
                      kidUnlinked
                        ? KID_NOT_LINKED_MESSAGE
                        : toothEventErrorMessage(
                            eventsQuery.error,
                            "Não foi possível carregar os eventos. Tente novamente.",
                          )
                    }
                    onRetry={() =>
                      kidUnlinked
                        ? void handleRefreshKids()
                        : void eventsQuery.refetch()
                    }
                    retryLabel={kidUnlinked ? "Atualizar" : "Tentar novamente"}
                  />
                }
              />
              <SkeletonDentalTipCard />
              <SkeletonRecentEventsList />
            </>
          )}

          {!eventsInitialLoading && !eventsFirstLoadError && (
            <>
              {(eventsRefetchError || kidsRefetchError) && (
                <QueryWarningBanner
                  message={
                    kidUnlinked
                      ? KID_NOT_LINKED_MESSAGE
                      : "Não foi possível atualizar os dados. Mostrando as últimas informações carregadas."
                  }
                  onRetry={() => void handleRefreshKids()}
                />
              )}
              <DentalMap
                kidId={selectedKidId}
                kidBirthDate={kidBirthDate}
                kidGender={kidGender}
                events={events}
                referenceDate={alerts.referenceDate}
                pendingMilestones={
                  alerts.ready && !alerts.stale ? alerts.active : []
                }
                onRegisterEvent={handleRegisterEvent}
                onMissingKid={() => setAddDependentVisible(true)}
              />
              {kids.length > 0 && (
                <DentalTipCard
                  title={dentalTip.title}
                  description={dentalTip.description}
                />
              )}
              {selectedKidRecord && (
                <PredictionsCard
                  referenceDate={alerts.referenceDate}
                  items={predictions.slice(0, 3)}
                  reviewCounts={
                    alerts.ready
                      ? {
                          active: alerts.active.length,
                          snoozed: alerts.snoozed.length,
                          historical: alerts.historical.length,
                        }
                      : null
                  }
                  reviewError={
                    alerts.evaluationError ??
                    (alerts.error
                      ? toothEventErrorMessage(
                          alerts.error,
                          "Não foi possível carregar a revisão dos registros.",
                        )
                      : null)
                  }
                  onPress={openPredictions}
                  onRetry={() => void handleRefreshKids()}
                />
              )}
              <RecentEventsList
                items={events.slice(0, 3)}
                onHistoryPress={openHistory}
                onItemPress={editor.openEditor}
              />
            </>
          )}
        </ScreenContent>
      </ScrollView>

      <ToothEventModal {...editor.modalProps} />

      <AddDependentSheet
        visible={addDependentVisible}
        submitError={addDependentError}
        onClose={handleCloseDependentSheet}
        onSubmit={handleCreateDependent}
      />

      <DeleteEventSheet {...editor.confirmProps} />
    </Wrapper>
  );
}
