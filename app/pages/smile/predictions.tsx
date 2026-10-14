import { useContext, useMemo } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Header } from "@/components/header";
import { CustomCalendar } from "@/components/calendar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKids } from "@/hooks/useKids";
import { useToothEvents } from "@/hooks/useToothEvents";
import type { SmileStackParamList } from "@/navigation/SmileStack";
import { THEME } from "@/lib/theme";
import {
  buildPredictionCalendarMarks,
  buildToothPredictions,
  formatPredictionWindow,
  PREDICTION_STATUS_LABEL,
} from "@/lib/toothPredictions";
import { toLocalDateKey } from "@/lib/utils";

const TOTAL_MILK_TEETH = 20;
const TOTAL_PERMANENT_TEETH = 32;

export function SmilePredictions() {
  const { authToken } = useContext(UserContext)!;
  const colors = THEME.light;
  const { params } =
    useRoute<RouteProp<SmileStackParamList, "SmilePredictions">>();
  const {
    kids,
    isLoading: kidsPending,
    isFetching: kidsFetching,
    failure: kidsFailure,
    refetch: refetchKids,
  } = useKids(authToken);
  const { events, isPending, isError, isFetching, refetch } = useToothEvents(
    params.kidId,
    authToken,
  );

  const kid = kids.find((item) => item.id === params.kidId);
  const birthDate = kid?.birthDate ?? null;

  const predictions = useMemo(
    () => buildToothPredictions(birthDate, events),
    [birthDate, events],
  );

  const marks = useMemo(
    () => buildPredictionCalendarMarks(predictions, colors.primary400),
    [predictions, colors.primary400],
  );

  const calendarMaxDate = useMemo(() => {
    const today = toLocalDateKey(new Date());
    return predictions.reduce(
      (latest, prediction) =>
        prediction.windowEnd > latest ? prediction.windowEnd : latest,
      today,
    );
  }, [predictions]);

  const progress = useMemo(() => {
    const countDistinct = (dentition: "primary" | "permanent") =>
      new Set(
        events
          .filter(
            (event) =>
              event.eventType === "eruption" && event.dentition === dentition,
          )
          .map((event) => `${event.quadrant}:${event.toothType}`),
      ).size;
    return {
      primary: Math.min(countDistinct("primary"), TOTAL_MILK_TEETH),
      permanent: Math.min(countDistinct("permanent"), TOTAL_PERMANENT_TEETH),
    };
  }, [events]);

  const isLoading = kidsPending || isPending;
  const hasError = !!kidsFailure || isError;
  const kidMissing = !kidsPending && !kidsFailure && !kid;

  function handleRefresh() {
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
      <ScrollView
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
            <Wrapper
              direction="column"
              align="center"
              justify="center"
              gap="gap-4"
              className="w-full rounded-xl bg-base-100 p-6"
            >
              <Text className="text-center">
                Não foi possível carregar as previsões. Verifique sua conexão.
              </Text>
              <Button onPress={handleRefresh}>
                <Text>Tentar novamente</Text>
              </Button>
            </Wrapper>
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
              <Wrapper
                className="w-full rounded-xl bg-base-100 p-5"
                direction="column"
                align="start"
                justify="start"
                gap="gap-2"
              >
                <Text variant="h4" className="text-primary-500">
                  Previsões de {kid.name}
                </Text>
                <Text className="text-sm text-base-500">
                  Estas datas são estimativas com base na idade e na cronologia
                  média de erupção. Elas não substituem a avaliação de um
                  dentista.
                </Text>
              </Wrapper>

              <Wrapper
                className="w-full rounded-xl bg-base-100 p-5"
                direction="column"
                align="start"
                justify="start"
                gap="gap-4"
              >
                <Text variant="h4" className="text-primary-500">
                  Progresso
                </Text>
                <View className="w-full gap-2">
                  <Wrapper direction="row" align="center" justify="between">
                    <Text className="text-sm font-semibold text-primary-800">
                      Dentes de leite
                    </Text>
                    <Text className="text-sm text-base-500">
                      {`${progress.primary} de ${TOTAL_MILK_TEETH}`}
                    </Text>
                  </Wrapper>
                  <Progress
                    value={(progress.primary / TOTAL_MILK_TEETH) * 100}
                  />
                </View>
                <View className="w-full gap-2">
                  <Wrapper direction="row" align="center" justify="between">
                    <Text className="text-sm font-semibold text-primary-800">
                      Dentes permanentes
                    </Text>
                    <Text className="text-sm text-base-500">
                      {`${progress.permanent} de ${TOTAL_PERMANENT_TEETH}`}
                    </Text>
                  </Wrapper>
                  <Progress
                    value={(progress.permanent / TOTAL_PERMANENT_TEETH) * 100}
                  />
                </View>
              </Wrapper>

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
                    className="w-full rounded-xl bg-base-100 p-3"
                    direction="column"
                    align="center"
                    justify="start"
                  >
                    <CustomCalendar
                      markingType="period"
                      markedDates={marks}
                      maxDate={calendarMaxDate}
                    />
                  </Wrapper>

                  <Wrapper
                    className="w-full rounded-xl bg-base-100 p-5"
                    direction="column"
                    align="start"
                    justify="start"
                    gap="gap-3"
                  >
                    <Text variant="h4" className="text-primary-500">
                      Próximos marcos
                    </Text>
                    {predictions.map((prediction) => (
                      <View
                        key={prediction.id}
                        className="w-full gap-1 rounded-xl bg-base-200 p-3.5"
                      >
                        <Text className="text-sm font-semibold text-primary-800">
                          {prediction.title}
                        </Text>
                        <Text className="text-xs text-base-500">
                          {`${PREDICTION_STATUS_LABEL[prediction.status]}: ${formatPredictionWindow(prediction.windowStart, prediction.windowEnd)}`}
                        </Text>
                        <Text className="text-xs text-base-500">
                          {prediction.pendingSides === 1
                            ? "1 lado pendente"
                            : `${prediction.pendingSides} lados pendentes`}
                        </Text>
                      </View>
                    ))}
                  </Wrapper>
                </>
              )}
            </>
          )}
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
