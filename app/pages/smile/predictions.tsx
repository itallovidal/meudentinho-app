import { useContext, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { CaretDownIcon, ToothIcon } from "phosphor-react-native";
import { Header } from "@/components/header";
import { ErrorState } from "@/components/errorState";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { SessionGate } from "@/components/sessionGate";
import { SessionNotice } from "@/components/sessionNotice";
import { SkeletonText } from "@/skeletons/components/skeletonText";
import DentalProgressChart from "@/components/smile/DentalProgressChart";
import { DentalCalendar } from "@/components/smile/DentalCalendar";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKids } from "@/hooks/useKids";
import { useToothEvents } from "@/hooks/useToothEvents";
import type {
  SmileNavigationProp,
  SmileStackParamList,
} from "@/navigation/SmileStack";
import type { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { THEME } from "@/lib/theme";
import {
  buildPredictionCalendarMarks,
  buildToothPredictions,
  getCalendarFocus,
  getPredictionFocusKey,
  PREDICTION_STATUS_LABEL,
} from "@/lib/toothPredictions";
import { parseLocalDate } from "@/lib/utils";
import type { ToothPrediction } from "@/types/teeth";

const TOTAL_MILK_TEETH = 20;
const PREDICTIONS_PAGE_SIZE = 2;
const TOTAL_PERMANENT_TEETH = 32;
const SHORT_MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function formatMonthYear(isoDate: string) {
  const date = parseLocalDate(isoDate);
  if (!date) {
    return "";
  }
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMonthWindow(start: string, end: string) {
  return `${formatMonthYear(start)} – ${formatMonthYear(end)}`;
}

export function SmilePredictions() {
  const { authToken, sessionExpired } = useContext(UserContext)!;
  const navigation = useNavigation<SmileNavigationProp>();
  const colors = THEME.light;
  const { params } =
    useRoute<RouteProp<SmileStackParamList, "SmilePredictions">>();
  const {
    kids,
    isLoading: kidsPending,
    isFetching: kidsFetching,
    failure: kidsFailure,
    refetchError: kidsRefetchError,
    refetch: refetchKids,
  } = useKids(authToken);
  const {
    events,
    isPending,
    isLoadingError: eventsLoadingError,
    isRefetchError: eventsRefetchError,
    isFetching,
    refetch,
  } = useToothEvents(params.kidId, authToken);

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const kid = kids.find((item) => item.id === params.kidId);
  const birthDate = kid?.birthDate ?? null;
  const gender = kid?.gender ?? null;

  const predictions = useMemo(
    () => buildToothPredictions(birthDate, events, gender),
    [birthDate, gender, events],
  );

  const marks = useMemo(
    () => buildPredictionCalendarMarks(predictions, events),
    [predictions, events],
  );

  const defaultFocus = useMemo(
    () => getCalendarFocus(predictions, new Date()),
    [predictions],
  );
  const [activePredictionId, setActivePredictionId] = useState<string | null>(
    null,
  );
  const [focusRequest, setFocusRequest] = useState<{ date: Date } | null>(null);
  const focusedPredictionId =
    activePredictionId ?? defaultFocus?.prediction.id ?? null;
  const focusedIndex = predictions.findIndex(
    (prediction) => prediction.id === focusedPredictionId,
  );
  const [visibleCount, setVisibleCount] = useState(PREDICTIONS_PAGE_SIZE);
  const shownCount = Math.max(visibleCount, focusedIndex + 1);
  const visiblePredictions = predictions.slice(0, shownCount);

  function handleSelectPrediction(prediction: ToothPrediction) {
    setActivePredictionId(prediction.id);
    setFocusRequest({
      date:
        parseLocalDate(getPredictionFocusKey(prediction, events)) ?? new Date(),
    });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  const progress = useMemo(() => {
    const countDistinct = (
      eventType: "eruption" | "exfoliation",
      dentition: "primary" | "permanent",
    ) =>
      new Set(
        events
          .filter(
            (event) =>
              event.eventType === eventType && event.dentition === dentition,
          )
          .map((event) => `${event.quadrant}:${event.toothType}`),
      ).size;
    return {
      milkExchanged: Math.min(
        countDistinct("exfoliation", "primary"),
        TOTAL_MILK_TEETH,
      ),
      permanentErupted: Math.min(
        countDistinct("eruption", "permanent"),
        TOTAL_PERMANENT_TEETH,
      ),
    };
  }, [events]);

  const isLoading = kidsPending || isPending;
  const hasError = !!kidsFailure || eventsLoadingError;
  const refetchError = kidsRefetchError || eventsRefetchError;
  const kidMissing = !kidsPending && !kidsFailure && !kid;
  const kidName = kid?.name || "Seu filho(a)";

  function goToLogin() {
    navigation.getParent<TabNavigatorNavigationProp>()?.navigate("Profile", {
      screen: "Login",
      initial: false,
      params: { fromTab: "Smile" },
    });
  }

  function handleRefresh() {
    if (!authToken) {
      return;
    }
    void refetchKids();
    void refetch();
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
            <View className="w-full gap-4">
              <SkeletonText variant="h3" />
              <SkeletonText />
              <SkeletonText />
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
                  : "Entre para ver as previsões"
              }
              message={
                sessionExpired
                  ? "Faça login novamente para ver as previsões."
                  : "Faça login para acompanhar as previsões do seu filho."
              }
              actionLabel="Fazer login"
              onAction={goToLogin}
            />
          </Wrapper>
        }
      >
      <ScrollView
        ref={scrollRef}
        className="w-full"
        refreshControl={
          <RefreshControl
            refreshing={kidsFetching || isFetching}
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
          {isLoading && (
            <Text className="text-base-500">Calculando previsões...</Text>
          )}

          {hasError && !isLoading && (
            <ErrorState
              title="Não foi possível carregar as previsões"
              message="Verifique sua conexão e tente novamente."
              onRetry={handleRefresh}
            />
          )}

          {refetchError && !isLoading && (
            <QueryWarningBanner
              message="Não foi possível atualizar os dados. Mostrando as previsões calculadas anteriormente."
              onRetry={handleRefresh}
            />
          )}

          {kidMissing && !isLoading && (
            <Wrapper
              className="w-full rounded-xl bg-base-100 p-6"
              direction="column"
              align="center"
              justify="center"
            >
              <Text className="text-center text-base-500">
                Este dependente não foi encontrado na sua conta.
              </Text>
            </Wrapper>
          )}

          {!isLoading && !hasError && kid && (
            <>
              {predictions.length === 0 ? (
                <Wrapper
                  className="w-full rounded-xl bg-base-100 p-6"
                  direction="column"
                  align="center"
                  justify="center"
                >
                  <Text className="text-center text-base-500">
                    {birthDate
                      ? "Nenhuma previsão pendente. Os dentes esperados para a idade já foram registrados."
                      : "Informe a data de nascimento do dependente para calcular as previsões."}
                  </Text>
                </Wrapper>
              ) : (
                <>
                  <Wrapper
                    className="w-full rounded-xl bg-base-100 p-4"
                    direction="column"
                    align="center"
                    justify="start"
                  >
                    <DentalCalendar
                      key={kid.id}
                      marks={marks}
                      initialDate={defaultFocus?.date ?? new Date()}
                      focusRequest={focusRequest}
                    />
                  </Wrapper>

                  <Wrapper
                    className="w-full rounded-xl bg-base-100 p-5"
                    direction="column"
                    align="start"
                    justify="start"
                    gap="gap-3"
                  >
                    <View className="w-full gap-2 px-4">
                      <Text variant="h4" className="text-primary-500">
                        Próximos marcos
                      </Text>
                      <Text className="text-sm text-base-500">
                        Estas datas são estimativas com base na idade e na
                        cronologia média de erupção. Elas não substituem a
                        avaliação de um dentista.
                      </Text>
                    </View>
                    {visiblePredictions.map((prediction) => {
                      const focused = prediction.id === focusedPredictionId;
                      return (
                        <Pressable
                          key={prediction.id}
                          onPress={() => handleSelectPrediction(prediction)}
                          accessibilityRole="button"
                          accessibilityLabel={`Ver ${prediction.title} no calendário`}
                          className={`w-full flex-row items-start gap-4 rounded-2xl border-2 bg-base-100 p-4 shadow-sm shadow-base-300 ${focused ? "border-primary-400" : "border-base-100"}`}
                        >
                          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                            <ToothIcon
                              size={26}
                              color={colors.primary500}
                              weight="bold"
                            />
                          </View>
                          <View className="flex-1 gap-1">
                            <View className="flex-row items-start justify-between gap-2">
                              <Text className="flex-1 text-base font-bold leading-5 text-primary-800">
                                {prediction.title}
                              </Text>
                              <View
                                className={`rounded-full px-2 py-0.5 ${prediction.status === "current" ? "bg-primary-100" : "bg-base-200"}`}
                              >
                                <Text
                                  className={`text-[10px] font-bold uppercase tracking-wide ${prediction.status === "current" ? "text-primary-800" : "text-base-500"}`}
                                >
                                  {PREDICTION_STATUS_LABEL[prediction.status]}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-xs font-medium text-primary-400">
                              {`${formatMonthWindow(prediction.windowStart, prediction.windowEnd)} · ${prediction.pendingSides === 1 ? "1 lado pendente" : `${prediction.pendingSides} lados pendentes`}`}
                            </Text>
                            <Text
                              className="text-xs leading-4 text-base-400"
                              numberOfLines={2}
                            >
                              {prediction.status === "current"
                                ? "Período provável para a erupção deste dente."
                                : "Estimativa baseada na cronologia média de erupção."}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                    {shownCount < predictions.length && (
                      <Pressable
                        onPress={() =>
                          setVisibleCount(shownCount + PREDICTIONS_PAGE_SIZE)
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Ver mais marcos"
                        className="w-full flex-row items-center justify-center gap-2 py-2"
                      >
                        <Text className="text-sm font-bold text-primary-500">
                          Ver mais
                        </Text>
                        <CaretDownIcon
                          size={18}
                          color={colors.primary500}
                          weight="bold"
                        />
                      </Pressable>
                    )}
                  </Wrapper>
                </>
              )}

              <DentalProgressChart
                title="Troca de Dentes"
                description={`${kidName} já trocou ${progress.milkExchanged} de ${TOTAL_MILK_TEETH} dentinhos de leite e tem ${progress.permanentErupted} de ${TOTAL_PERMANENT_TEETH} dentes permanentes.`}
                items={[
                  {
                    label: "Dentinhos de leite",
                    value: progress.milkExchanged,
                    total: TOTAL_MILK_TEETH,
                    tone: "milk",
                  },
                  {
                    label: "Dentes permanentes",
                    value: progress.permanentErupted,
                    total: TOTAL_PERMANENT_TEETH,
                    tone: "permanent",
                  },
                ]}
              />
            </>
          )}
        </Wrapper>
      </ScrollView>
      </SessionGate>
    </Wrapper>
  );
}
