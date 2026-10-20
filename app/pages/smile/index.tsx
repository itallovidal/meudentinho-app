import { useContext, useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { ErrorState } from "@/components/errorState";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { Button } from "@/components/ui/button";
import { DeleteEventSheet } from "@/components/smile/DeleteEventSheet";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { AddDependentSheet } from "@/components/smile/AddDependentSheet";
import { DentalMap } from "@/components/smile/DentalMap";
import DentalTipCard from "@/components/smile/DentalTipCard";

import { KidSelector } from "@/components/smile/KidSelector";
import RecentEventsList from "@/components/smile/RecentEventsList";
import { ToothEventModal } from "@/components/smile/ToothEventModal";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKidMutations } from "@/hooks/useKidMutations";
import { useKids } from "@/hooks/useKids";
import { useToothEvents } from "@/hooks/useToothEvents";
import { useToothEventEditor } from "@/hooks/useToothEventEditor";
import { resolveAccountId, toothEventsQueryKey } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/errorMessage";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { createToothEvent } from "@/api/smile/createToothEvent";
import PredictionsCard from "@/components/smile/PredictionsCard";
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

const TOTAL_MILK_TEETH = 20;

export function Smile() {
  const { user, authToken, userId, hydrated } = useContext(UserContext)!;
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const queryClient = useQueryClient();
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [addDependentVisible, setAddDependentVisible] = useState(false);
  const [addDependentError, setAddDependentError] = useState<ApiError | null>(
    null,
  );
  const { showToast } = useToast();
  const { createKidMutation } = useKidMutations(authToken);

  const {
    kids: kidsList,
    isLoading: kidsInitialLoading,
    isRefreshing: kidsRefreshing,
    failure: kidsFailure,
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

  useEffect(() => {
    if (kids.length === 0) {
      if (selectedKidId !== null) {
        setSelectedKidId(null);
      }
      return;
    }
    if (!kids.some((kid) => kid.id === selectedKidId)) {
      setSelectedKidId(kids[0].id);
    }
  }, [kids, selectedKidId]);

  const eventsQuery = useToothEvents(selectedKidId, authToken);
  const { events } = eventsQuery;

  const eventsInitialLoading = eventsQuery.isLoading;
  const eventsRefreshing = eventsQuery.isRefetching;
  const eventsFirstLoadError = eventsQuery.isLoadingError;
  const eventsRefetchError = eventsQuery.isRefetchError;

  const registerMutation = useMutation({
    mutationFn: (request: ToothEventRequestDTO) =>
      createToothEvent(request, authToken ?? null),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: toothEventsQueryKey(accountId, selectedKidId),
      });
    },
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
      params: { kid: kidRecord, fromTab: "Smile" },
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
          "Os permanentes nascem empurrando os de leite. Mantenha a escovação após as refeições e visite o dentista regularmente.",
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

  const predictions = useMemo(
    () => buildToothPredictions(kidBirthDate, events, kidGender),
    [kidBirthDate, kidGender, events],
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
    eventsQuery.error instanceof ApiError &&
    eventsQuery.error.code === "KID_NOT_LINKED_TO_PARENT";

  async function handleRefreshKids() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["kids"] }),
      queryClient.invalidateQueries({ queryKey: ["tooth-events"] }),
    ]);
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
          <Wrapper
            className="w-full items-center rounded-xl bg-base-100 p-5"
            direction="column"
            align="center"
            justify="center"
            gap="gap-4"
          >
            <Text variant="h4" className="text-center text-primary-500">
              Acompanhe o sorriso
            </Text>
            <Text className="text-center text-base-500">
              Faça login para registrar e acompanhar os eventos dentários.
            </Text>
            <Button
              onPress={() =>
                navigation.navigate("Profile", {
                  screen: "Login",
                  params: { fromTab: "Smile" },
                })
              }
            >
              <Text>Fazer login</Text>
            </Button>
          </Wrapper>
        </Wrapper>
      </Wrapper>
    );
  }

  if (kidsInitialLoading) {
    return (
      <SkeletonSmilePage
        refreshing={kidsRefreshing}
        onRefresh={() => void refetchKids()}
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
            <Wrapper
              className="w-full items-center rounded-xl bg-base-100 p-5"
              direction="column"
              align="center"
              justify="center"
              gap="gap-4"
            >
              <Text variant="h4" className="text-center text-primary-500">
                Sessão expirada
              </Text>
              <Text className="text-center text-base-500">
                Faça login novamente para acompanhar o sorriso.
              </Text>
              <Button
                onPress={() =>
                  navigation.navigate("Profile", {
                    screen: "Login",
                    params: { fromTab: "Smile" },
                  })
                }
              >
                <Text>Fazer login</Text>
              </Button>
            </Wrapper>
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
              refreshing={kidsRefreshing}
              onRefresh={() => void handleRefreshKids()}
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
            <SkeletonKidSelector />
            <SkeletonDentalMap
              error={<ErrorState onRetry={() => void refetchKids()} />}
            />
            <SkeletonDentalTipCard />
            <SkeletonRecentEventsList />
          </Wrapper>
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
            refreshing={kidsRefreshing || eventsRefreshing}
            onRefresh={() => void handleRefreshKids()}
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
          <KidSelector
            kids={kids}
            selectedId={selectedKidId}
            onSelect={setSelectedKidId}
            onOpen={handleOpenKid}
            onAdd={() =>
              navigation.navigate("Profile", {
                screen: "Dependents",
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
                        ? "Este dependente não está mais vinculado à sua conta."
                        : "Não foi possível carregar os eventos. Verifique sua conexão."
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
                      ? "Este dependente não está mais vinculado à sua conta."
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
                onRegisterEvent={handleRegisterEvent}
                onMissingKid={() => setAddDependentVisible(true)}
              />
              {kids.length > 0 && (
                <DentalTipCard
                  title={dentalTip.title}
                  description={dentalTip.description}
                />
              )}
              <PredictionsCard
                items={predictions.slice(0, 3)}
                onPress={openPredictions}
              />
              <RecentEventsList
                items={events.slice(0, 3)}
                onHistoryPress={openHistory}
                onItemPress={editor.openEditor}
              />
            </>
          )}
        </Wrapper>
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
