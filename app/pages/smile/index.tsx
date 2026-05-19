import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Header } from "@/components/header";
import { DentalMap } from "@/components/smile/DentalMap";
import DentalTipCard from "@/components/smile/DentalTipCard";
import PredictionsCard from "@/components/smile/PredictionsCard";
import RecentEventsList from "@/components/smile/RecentEventsList";
import TeethExchangeCard from "@/components/smile/TeethExchangeCard";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import {
  getTeethExchangeStats,
  getToothEvents,
  getToothPredictions,
  registerToothEvent,
} from "@/api/smile";
import { TeethExchangeStats, ToothEvent, ToothPrediction } from "@/types/teeth";

export function Smile() {
  const userCtx = useContext(UserContext);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [events, setEvents] = useState<ToothEvent[]>([]);
  const [predictions, setPredictions] = useState<ToothPrediction[]>([]);
  const [stats, setStats] = useState<TeethExchangeStats>({
    totalMilkTeeth: 20,
    exchanged: 0,
  });

  useEffect(() => {
    if (!userCtx?.user) return;
    setSelectedKidId(userCtx.user?.kids?.[0]?.id || null);
  }, [userCtx?.user]);

  const loadSmileData = useCallback(async (kidId: string) => {
    const [ev, pr, st] = await Promise.all([
      getToothEvents(kidId),
      getToothPredictions(kidId),
      getTeethExchangeStats(kidId),
    ]);
    setEvents(ev);
    setPredictions(pr);
    setStats(st);
  }, []);

  useEffect(() => {
    if (!selectedKidId) return;
    void loadSmileData(selectedKidId);
  }, [loadSmileData, selectedKidId]);

  const handleRegisterEvent = useCallback(
    async (payload: Omit<ToothEvent, "id">) => {
      if (!selectedKidId) return;
      await registerToothEvent(selectedKidId, payload);
      await loadSmileData(selectedKidId);
    },
    [loadSmileData, selectedKidId],
  );

  const kidName = userCtx?.user?.kids?.[0]?.name;

  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="flex-1 bg-base-200"
    >
      <Header />
      <ScrollView className="w-full">
        <Wrapper
          className="mx-6 my-4"
          direction="column"
          align="center"
          justify="start"
          gap="gap-4"
        >
          <DentalMap onRegisterEvent={handleRegisterEvent} />
          <DentalTipCard
            title="Molar dos 6 anos"
            description="Este dente nasce sem cair nenhum outro. Atenção especial à escovação no fundo da boca!"
          />

          <RecentEventsList items={events} />

          <PredictionsCard items={predictions} />

          <TeethExchangeCard
            total={stats.totalMilkTeeth}
            exchanged={stats.exchanged}
            kidName={kidName}
          />
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
