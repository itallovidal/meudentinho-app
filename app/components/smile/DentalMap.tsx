import { useCallback, useState } from "react";
import { TouchableOpacity, useWindowDimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Wrapper } from "@/components/wrapper";
import ToothSVG from "./teeth/ToothSVG";
import { TOOTH_PATHS } from "./teeth/paths";
import { Card } from "@/components/card";
import { Text } from "@/components/ui/text";
import { ToothEvent } from "@/types/teeth";
import ToothEventModal from "./ToothEventModal";
import { ToothIcon, EyeSlashIcon, SmileyIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";

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

type DentalMapProps = {
  onRegisterEvent: (payload: Omit<ToothEvent, "id">) => Promise<void>;
};

export function DentalMap({ onRegisterEvent }: DentalMapProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const onToothPress = useCallback((toothId: string) => {
    setSelectedTooth(toothId);
    setModalVisible(true);
  }, []);

  const handleRegister = useCallback(
    async (payload: Omit<ToothEvent, "id">) => {
      await onRegisterEvent(payload);
      setModalVisible(false);
    },
    [onRegisterEvent],
  );

  const colors = THEME.light;
  const carouselWidth = screenWidth - 72;

  return (
    <Wrapper
      direction="column"
      align="center"
    >
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
            <View className="flex-1 items-center justify-center bg-base-100 px-2">
              <View className="mb-2 flex-row justify-center gap-1.5">
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

              <View className="mb-2 flex-row justify-center gap-1.5">
                {item.lower.map((id) => {
                  const path = TOOTH_PATHS[id];
                  if (!path) return null;
                  return (
                    <TouchableOpacity
                      key={`${item.side}-lower-${id}`}
                      onPress={() => onToothPress(id)}
                      // onPress={() => console.log(id)}
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
          direction="row"
          gap="gap-4"
        >
          <Wrapper direction="row" align="center" gap="gap-1">
            <EyeSlashIcon size={16} color={colors.base500} weight="bold" />
            <Text className="text-xs font-medium text-base-500">
              3 Ausentes
            </Text>
          </Wrapper>
          <Wrapper direction="row" align="center" gap="gap-1">
            <ToothIcon size={16} color={colors.primary400} weight="fill" />
            <Text className="text-xs font-medium text-primary-400">
              15 Permanentes
            </Text>
          </Wrapper>
          <Wrapper direction="row" align="center" gap="gap-1">
            <SmileyIcon size={16} color={colors.tertiary300} weight="bold" />
            <Text className="text-tertiary-300 text-xs font-medium">
              2 De leite
            </Text>
          </Wrapper>
        </Wrapper>
      </Card>

      <ToothEventModal
        visible={modalVisible}
        toothId={selectedTooth}
        onClose={() => setModalVisible(false)}
        onSubmit={handleRegister}
      />
    </Wrapper>
  );
}
