import { AnimatedHeight } from "@/components/animatedHeight";
import { ScreenContent } from "@/components/screenContent";
import { loginReturnPath } from "@/navigation/linking";
import { ToothTypeSVG } from "@/components/smile/teeth/ToothTypeSVG";
import { ToothEventModal } from "@/components/smile/ToothEventModal";
import { ToothAlertsPanel } from "@/components/smile/ToothAlertsPanel";
import { useToothPredictionAlerts } from "@/hooks/useToothPredictionAlerts";
import { useToothAlertActions } from "@/hooks/useToothAlertActions";
import { toothEventErrorMessage } from "@/lib/toothEventError";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { CaretDownIcon } from "phosphor-react-native";
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
  PREDICTION_STATUS_DESCRIPTION,
  getPredictionFocusKey,
  PREDICTION_STATUS_LABEL,
} from "@/lib/toothPredictions";
import { parseLocalDate } from "@/lib/utils";
import type { ToothPrediction, ToothPredictionStatus } from "@/types/teeth";

const STATUS_STYLE: Record<
  ToothPredictionStatus,
  { badge: string; text: string }
> = {
  current: { badge: "bg-primary-100", text: "text-primary-800" },
  tolerance: { badge: "bg-warning-100", text: "text-warning-600" },
  upcoming: { badge: "bg-base-200", text: "text-muted-foreground" },
};

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
    failure: kidsFailure,
    error: kidsError,
    refetchError: kidsRefetchError,
    refetch: refetchKids,
  } = useKids(authToken);
  const {
    events,
    error: eventsError,
    hasCompleteData: eventsReady,
    isPending,
    isLoadingError: eventsLoadingError,
    isRefetchError: eventsRefetchError,
    refetch,
  } = useToothEvents(params.kidId, authToken);

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const kid = kids.find((item) => item.id === params.kidId);
  const birthDate = kid?.birthDate ?? null;
  const gender = kid?.gender ?? null;

  const alerts = useToothPredictionAlerts({
    kid,
    events,
    eventsReady,
    eventsStale: eventsRefetchError || !!kidsRefetchError,
  });
  const alertActions = useToothAlertActions(kid, events, {
    active: alerts.active,
    onSnooze: alerts.snooze.mutateAsync,
    disabledReason:
      !alerts.ready || alerts.stale
        ? "Atualize os dados antes de registrar ou adiar."
        : null,
  });
  const predictions = useMemo(
    () =>
      buildToothPredictions(birthDate, events, gender, alerts.referenceDate),
    [birthDate, gender, events, alerts.referenceDate],
  );

  const marks = useMemo(
    () => buildPredictionCalendarMarks(predictions, events),
    [predictions, events],
  );

  const [selection, setSelection] = useState<{
    kidId: string;
    predictionId: string | null;
  }>({
    kidId: params.kidId,
    predictionId: null,
  });
  const activePredictionId =
    selection.kidId === params.kidId ? selection.predictionId : null;
  const [focusRequest, setFocusRequest] = useState<{ date: Date } | null>(null);
  const focusedPredictionId = activePredictionId;
  const focusedIndex = predictions.findIndex(
    (prediction) => prediction.id === focusedPredictionId,
  );
  const [visibleCount, setVisibleCount] = useState(PREDICTIONS_PAGE_SIZE);
  const shownCount = Math.max(visibleCount, focusedIndex + 1);
  const visiblePredictions = predictions.slice(0, shownCount);

  useFocusEffect(
    useCallback(() => {
      setSelection({ kidId: params.kidId, predictionId: null });
      setFocusRequest({ date: new Date() });
      setVisibleCount(PREDICTIONS_PAGE_SIZE);
    }, [params.kidId]),
  );

  function handleSelectPrediction(prediction: ToothPrediction) {
    const deselecting = activePredictionId === prediction.id;
    setSelection({
      kidId: params.kidId,
      predictionId: deselecting ? null : prediction.id,
    });
    setFocusRequest({
      date: deselecting
        ? new Date()
        : (parseLocalDate(getPredictionFocusKey(prediction, events)) ??
          new Date()),
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
      params: { fromTab: "Smile", returnTo: loginReturnPath() },
    });
  }

  const [manualRefreshing, setManualRefreshing] = useState(false);
  async function handleRefresh() {
    if (!authToken) {
      return;
    }
    setManualRefreshing(true);
    try {
      await Promise.all([refetchKids(), refetch(), alerts.refetch()]);
    } finally {
      setManualRefreshing(false);
    }
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
              refreshing={manualRefreshing}
              onRefresh={handleRefresh}
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
            {isLoading && (
              <View className="w-full gap-3">
                <SkeletonText />
                <SkeletonText />
                <SkeletonText />
              </View>
            )}

            {hasError && !isLoading && (
              <View className="w-full gap-3">
                <SkeletonText />
                <SkeletonText />
                <ErrorState
                  title="Não foi possível carregar as previsões"
                  message={toothEventErrorMessage(
                    eventsError ?? kidsError,
                    "Não foi possível carregar os dados. Tente novamente.",
                  )}
                  onRetry={handleRefresh}
                />
              </View>
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
                <Text className="text-center text-muted-foreground">
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
                    <Text className="text-center text-muted-foreground">
                      {birthDate
                        ? "Nenhuma previsão futura nas referências avaliadas. Consulte os registros para revisar e o histórico incompleto."
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
                        initialDate={alerts.referenceDate}
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
                        <Text className="text-sm text-muted-foreground">
                          Estas datas são estimativas com base na idade e na
                          cronologia média de erupção. Elas não substituem a
                          avaliação de um dentista.
                        </Text>
                      </View>
                      <AnimatedHeight>
                        <View className="w-full gap-3">
                          {visiblePredictions.map((prediction) => {
                            const focused =
                              prediction.id === focusedPredictionId;
                            return (
                              <Pressable
                                key={prediction.id}
                                onPress={() =>
                                  handleSelectPrediction(prediction)
                                }
                                accessibilityRole="button"
                                accessibilityState={{ selected: focused }}
                                accessibilityLabel={
                                  focused
                                    ? `Desmarcar ${prediction.title} e voltar para hoje`
                                    : `Ver ${prediction.title} no calendário`
                                }
                                className={`w-full flex-row items-start gap-4 rounded-2xl border-2 bg-base-100 p-4 shadow-sm shadow-base-300 ${focused ? "border-primary-400" : "border-base-100"}`}
                              >
                                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary-100">
                                  <ToothTypeSVG
                                    toothType={prediction.toothType}
                                  />
                                </View>
                                <View className="flex-1 gap-1">
                                  <View className="flex-row items-start justify-between gap-2">
                                    <Text className="flex-1 text-base font-bold leading-5 text-primary-800">
                                      {prediction.title}
                                    </Text>
                                    <View
                                      className={`max-w-[48%] shrink rounded-full px-2 py-0.5 ${STATUS_STYLE[prediction.status].badge}`}
                                    >
                                      <Text
                                        className={`text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[prediction.status].text}`}
                                      >
                                        {
                                          PREDICTION_STATUS_LABEL[
                                            prediction.status
                                          ]
                                        }
                                      </Text>
                                    </View>
                                  </View>
                                  <Text className="text-xs font-medium text-primary">
                                    {`${formatMonthWindow(prediction.windowStart, prediction.windowEnd)} · ${prediction.pendingSides === 1 ? "1 lado pendente" : `${prediction.pendingSides} lados pendentes`}`}
                                  </Text>
                                  <Text
                                    className="text-xs leading-4 text-muted-foreground"
                                    numberOfLines={2}
                                  >
                                    {
                                      PREDICTION_STATUS_DESCRIPTION[
                                        prediction.status
                                      ]
                                    }
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </AnimatedHeight>
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

                <ToothAlertsPanel
                  key={kid.id}
                  {...alerts}
                  errorMessage={
                    alerts.evaluationError ??
                    (alerts.error
                      ? toothEventErrorMessage(
                          alerts.error,
                          "Não foi possível carregar os avisos.",
                        )
                      : null)
                  }
                  busy={alerts.snooze.isPending}
                  onRetry={() => void handleRefresh()}
                  onRegister={alertActions.openRegistration}
                />

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
          </ScreenContent>
        </ScrollView>
      </SessionGate>
      <ToothEventModal
        {...alertActions.modalProps}
        onRetry={() => void handleRefresh()}
      />
    </Wrapper>
  );
}
