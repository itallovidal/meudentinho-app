import { useContext, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { DentalMap } from "@/components/smile/DentalMap";
import DentalTipCard from "@/components/smile/DentalTipCard";
import { KidSelector } from "@/components/smile/KidSelector";
import PredictionsCard from "@/components/smile/PredictionsCard";
import RecentEventsList from "@/components/smile/RecentEventsList";
import TeethExchangeCard from "@/components/smile/TeethExchangeCard";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKids } from "@/hooks/useKids";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { getToothEventsByKid } from "@/api/smile/getToothEvents";
import { createToothEvent } from "@/api/smile/createToothEvent";
import { updateToothEvent } from "@/api/smile/updateToothEvent";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";
import { birthDateToString } from "@/lib/utils";

const TOTAL_MILK_TEETH = 20;

export function Smile() {
  const { user, authToken } = useContext(UserContext)!;
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const queryClient = useQueryClient();
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);

  const {
    kids: kidsList,
    isLoading: kidsPending,
    isFetching: kidsFetching,
  } = useKids(authToken);

  const kids = useMemo(
    () => kidsList.map((kid) => ({ id: kid.id, name: kid.name, birthDate: birthDateToString(kid.birthDate) })),
    [kidsList],
  );
  const kidsReady = !kidsPending;

  useEffect(() => {
    if (!kids.some((kid) => kid.id === selectedKidId)) {
      setSelectedKidId(kids[0]?.id ?? null);
    }
  }, [kids, selectedKidId]);

  const eventsQuery = useQuery({
    queryKey: ["tooth-events", selectedKidId],
    queryFn: () =>
      getToothEventsByKid(selectedKidId!, authToken!).then(
        (response) => response.data,
      ),
    enabled: !!selectedKidId && !!authToken,
    staleTime: 1000 * 60 * 5,
  });

  const events = useMemo(() => {
    const data = eventsQuery.data ?? [];
    return [...data].sort((a, b) =>
      a.occurrenceDate < b.occurrenceDate ? 1 : -1,
    );
  }, [eventsQuery.data]);

  const registerMutation = useMutation({
    mutationFn: (request: ToothEventRequestDTO) =>
      createToothEvent(request, authToken ?? ""),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["tooth-events", selectedKidId],
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: ToothEventRequestDTO;
    }) => updateToothEvent(id, authToken ?? "", request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["tooth-events", selectedKidId],
      }),
  });

  async function handleRegisterEvent(
    payload: ToothEventRequestDTO,
    editingId: string | null,
  ) {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, request: payload });
      return;
    }
    try {
      await registerMutation.mutateAsync(payload);
    } catch (error) {
      if (error instanceof ApiError && error.code === "TOOTH_EVENT_DUPLICATE") {
        const cached = queryClient.getQueryData<ResponsePayload<ToothEvent[]>>([
          "tooth-events",
          selectedKidId,
        ]);
        const match = (cached?.data ?? []).find(
          (event) =>
            event.quadrant === payload.quadrant &&
            event.toothType === payload.toothType &&
            event.eventType === payload.eventType,
        );
        if (match) {
          await updateMutation.mutateAsync({ id: match.id, request: payload });
          return;
        }
      }
      throw error;
    }
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

  const selectedKid = kids.find((kid) => kid.id === selectedKidId);
  const selectedKidRecord = kidsList.find((kid) => kid.id === selectedKidId);
  const kidBirthDate = selectedKidRecord ? selectedKidRecord.birthDate : null;

  const kidUnlinked =
    eventsQuery.error instanceof ApiError &&
    eventsQuery.error.code === "KID_NOT_LINKED_TO_PARENT";

  async function handleRefreshKids() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["kids"] }),
      queryClient.invalidateQueries({ queryKey: ["tooth-events"] }),
    ]);
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

  if (!kidsReady) {
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
          <Text className="text-base-500">Carregando dependentes...</Text>
        </Wrapper>
      </Wrapper>
    );
  }

  if (kids.length === 0) {
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
              Nenhum dependente ainda
            </Text>
            <Text className="text-center text-base-500">
              Adicione um dependente para começar a registrar os eventos
              dentários.
            </Text>
            <Button
              onPress={() =>
                navigation.navigate("Profile", {
                  screen: "Dependents",
                  params: { fromTab: "Smile" },
                })
              }
            >
              <Text>Gerenciar dependentes</Text>
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
            refreshing={kidsFetching || eventsQuery.isFetching}
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
            onAdd={() =>
              navigation.navigate("Profile", {
                screen: "Dependents",
                params: { fromTab: "Smile" },
              })
            }
          />

          {eventsQuery.isPending && (
            <Text className="text-base-500">Carregando eventos...</Text>
          )}

          {eventsQuery.isError && (
            <Wrapper
              direction="column"
              align="center"
              justify="center"
              gap="gap-4"
              className="w-full rounded-xl bg-base-100 p-6"
            >
              <Text className="text-center">
                {kidUnlinked
                  ? "Este dependente não está mais vinculado à sua conta."
                  : "Não foi possível carregar os eventos. Verifique sua conexão."}
              </Text>
              {kidUnlinked ? (
                <Button onPress={() => void handleRefreshKids()}>
                  <Text>Atualizar</Text>
                </Button>
              ) : (
                <Button onPress={() => void eventsQuery.refetch()}>
                  <Text>Tentar novamente</Text>
                </Button>
              )}
            </Wrapper>
          )}

          {!eventsQuery.isPending && !eventsQuery.isError && selectedKidId && (
            <>
              <DentalMap
                kidId={selectedKidId}
                kidBirthDate={kidBirthDate}
                events={events}
                onRegisterEvent={handleRegisterEvent}
              />
              <DentalTipCard
                title="Molar dos 6 anos"
                description="Este dente nasce sem cair nenhum outro. Atenção especial à escovação no fundo da boca!"
              />
              <RecentEventsList items={events.slice(0, 5)} />
              <PredictionsCard items={[]} />
              {events.length > 0 && (
                <TeethExchangeCard
                  total={stats.totalMilkTeeth}
                  exchanged={stats.exchanged}
                  kidName={selectedKid?.name}
                />
              )}
            </>
          )}
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
