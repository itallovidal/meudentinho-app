import React, { useState, useCallback, useContext, useEffect } from "react";
import { TouchableOpacity, useWindowDimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import ToothSVG from "./teeth/ToothSVG";
import { TOOTH_PATHS, TOOTH_IDS } from "./teeth/paths";
import { Card } from "@/components/card";
import { Text } from "@/components/ui/text";
import { UserContext } from "@/contexts/UserContext";
import {
  getToothEvents,
  getToothPredictions,
  getTeethExchangeStats,
  registerToothEvent,
} from "@/api/smile";
import { ToothEvent } from "@/types/teeth";
import RecentEventsList from "./RecentEventsList";
import PredictionsCard from "./PredictionsCard";
import TeethExchangeCard from "./TeethExchangeCard";
import ToothEventModal from "./ToothEventModal";

// IDs dos 5 dentes superiores e inferiores exibidos por lado
const UPPER_TEETH_IDS = [
  "upper_central_incisor",
  "upper_lateral_incisor",
  "upper_canine",
  "upper_first_premolar",
  "upper_second_premolar",
];

const LOWER_TEETH_IDS = [
  "lower_central_incisor",
  "lower_lateral_incisor",
  "lower_canine",
  "lower_first_premolar",
  "lower_second_premolar",
];

type SideSlide = {
  side: "right" | "left";
  label: string;
  upper: string[];
  lower: string[];
  flip: boolean;
};

const SLIDES: SideSlide[] = [
  {
    side: "right",
    label: "Direito",
    upper: UPPER_TEETH_IDS,
    lower: LOWER_TEETH_IDS,
    flip: false,
  },
  {
    side: "left",
    label: "Esquerdo",
    upper: [...UPPER_TEETH_IDS].reverse(),
    lower: [...LOWER_TEETH_IDS].reverse(),
    flip: true,
  },
];

export function DentalMap() {
  const { width: screenWidth } = useWindowDimensions();
  const userCtx = useContext(UserContext);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [events, setEvents] = useState<ToothEvent[]>([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState({ totalMilkTeeth: 20, exchanged: 0 });
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // useEffect(() => {
  //   if (userCtx?.user) {
  //     // choose first kid if any (mocked later)
  //     setSelectedKidId(userCtx.user?.kids?.[0]?.id || null);
  //   }
  // }, [userCtx?.user]);

  // useEffect(() => {
  //   if (!selectedKidId) return;
  //   (async () => {
  //     const ev = await getToothEvents(selectedKidId);
  //     const pr = await getToothPredictions(selectedKidId);
  //     const st = await getTeethExchangeStats(selectedKidId);
  //     setEvents(ev);
  //     setPredictions(pr as any);
  //     setStats(st as any);
  //   })();
  // }, [selectedKidId]);

  // const onToothPress = useCallback((toothId: string) => {
  //   setSelectedTooth(toothId);
  //   setModalVisible(true);
  // }, []);

  // const handleRegister = async (payload: Omit<ToothEvent, "id">) => {
  //   if (!selectedKidId) return;
  //   await registerToothEvent(selectedKidId, payload);
  //   setModalVisible(false);
  //   const ev = await getToothEvents(selectedKidId);
  //   setEvents(ev);
  // };

  console.log("Selected kid ID:", selectedKidId);
  console.log("Tooth events:", events);
  console.log("Predictions:", predictions);
  console.log("Teeth exchange stats:", stats);
  console.log("Selected tooth:", TOOTH_IDS);

  const carouselWidth = screenWidth - 32; // desconta o padding p-4 de cada lado

  return (
    <Wrapper direction="column">
      <Wrapper direction="column" className="p-4">
        <Card title="Mapa do Sorriso">
          <Carousel
            width={carouselWidth}
            height={180}
            data={SLIDES}
            loop={false}
            mode="horizontal-stack"
            modeConfig={{
              snapDirection: "left",
              stackInterval: 20,
              scaleInterval: 0.06,
              rotateZDeg: 12,
              showLength: 2,
            }}
            renderItem={({ item }: { item: SideSlide }) => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 8,
                }}
              >
                {/* Arcada superior */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  {item.upper.map((id) => {
                    const path = TOOTH_PATHS[id];
                    if (!path) return null;
                    return (
                      <TouchableOpacity
                        key={`${item.side}-upper-${id}`}
                        // onPress={() => onToothPress(id)}
                        onPress={() => console.log(id)}
                      >
                        <ToothSVG
                          viewBox={path.viewBox}
                          content={path.content}
                          width={48}
                          height={48}
                          stroke="black"
                          flipHorizontal={item.flip}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Arcada inferior */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  {item.lower.map((id) => {
                    const path = TOOTH_PATHS[id];
                    if (!path) return null;
                    return (
                      <TouchableOpacity
                        key={`${item.side}-lower-${id}`}
                        // onPress={() => onToothPress(id)}
                        onPress={() => console.log(id)}
                      >
                        <ToothSVG
                          viewBox={path.viewBox}
                          content={path.content}
                          width={48}
                          height={48}
                          stroke="black"
                          flipHorizontal={item.flip}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text className="text-sm text-base-500">{item.label}</Text>
              </View>
            )}
          />

          <Wrapper
            justify="center"
            align="center"
            className="mt-4 w-full"
            direction="column"
          >
            <Text>3 Ausentes</Text>
            <Text>15 Permanentes</Text>
            <Text>2 Dentes de leite</Text>
          </Wrapper>
        </Card>

        {/* <Wrapper className="mt-4">
          <PredictionsCard items={predictions} />
        </Wrapper> */}

        {/* <Wrapper className="mt-4">
          <RecentEventsList items={events} />
        </Wrapper> */}

        {/* <Wrapper className="mt-4">
          <TeethExchangeCard
            total={stats.totalMilkTeeth}
            exchanged={stats.exchanged}
          />
        </Wrapper> */}
      </Wrapper>

      {/* <ToothEventModal
        visible={modalVisible}
        toothId={selectedTooth}
        onClose={() => setModalVisible(false)}
        onSubmit={handleRegister}
      /> */}
    </Wrapper>
  );
}

export default DentalMap;
