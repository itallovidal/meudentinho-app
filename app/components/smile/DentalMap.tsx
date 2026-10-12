import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Wrapper } from "@/components/wrapper";
import ToothSVG from "./teeth/ToothSVG";
import { FDI_TEETH } from "./teeth/fdiTeeth";
import { Text } from "@/components/ui/text";
import { ToothIcon } from "phosphor-react-native";
import ToothEventModal from "./ToothEventModal";
import { ageInMonths } from "@/lib/utils";
import { parseToothId } from "@/lib/teethLabels";
import { toothState, type MapToothState } from "@/lib/toothChronology";
import type {
  Arch,
  Quadrant,
  Side,
  ToothEvent,
  ToothEventRequestDTO,
  ToothType,
} from "@/types/teeth";

type ToothPosition = {
  id: string;
  toothType: ToothType;
  arch: Arch;
  side: Side;
  quadrant: Quadrant;
  fdi: string;
};

const QUADRANT_TYPES: ToothType[] = [
  "central_incisor",
  "lateral_incisor",
  "canine",
  "first_premolar",
  "second_premolar",
  "first_molar",
  "second_molar",
  "third_molar",
];

const FDI_DECADE: Record<Quadrant, string> = {
  upper_right: "1",
  upper_left: "2",
  lower_left: "3",
  lower_right: "4",
};

const FDI_UNIT: Record<ToothType, string> = {
  central_incisor: "1",
  lateral_incisor: "2",
  canine: "3",
  first_premolar: "4",
  second_premolar: "5",
  first_molar: "6",
  second_molar: "7",
  third_molar: "8",
};

const STATE_COLORS: Record<MapToothState, string> = {
  unregistered: "#8E97A3",
  dimmed: "#C4CBD4",
  bornMilk: "#4C9BDD",
  bornPermanent: "#1E3A5F",
  fell: "#DE7F02",
  delayed: "#DA4E4E",
};

const LEGEND: { state: MapToothState; label: string; color: string }[] = [
  { state: "unregistered", label: "Sem registro", color: "#8E97A3" },
  { state: "dimmed", label: "Fora da faixa etária", color: "#D9D9D9" },
  { state: "bornMilk", label: "Nasceu (leite)", color: "#4C9BDD" },
  { state: "bornPermanent", label: "Nasceu (permanente)", color: "#1E3A5F" },
  { state: "fell", label: "Caiu", color: "#DE7F02" },
  { state: "delayed", label: "Atrasado", color: "#DA4E4E" },
];

const OPEN_TOOTH_SIZE = 28;
const OPEN_ARCH_HEIGHT = 190;

function buildArch(arch: Arch, side: Side): ToothPosition[] {
  const quadrant = `${arch}_${side}` as Quadrant;
  return QUADRANT_TYPES.map((toothType) => ({
    id: `${arch}_${side}_${toothType}`,
    toothType,
    arch,
    side,
    quadrant,
    fdi: `${FDI_DECADE[quadrant]}${FDI_UNIT[toothType]}`,
  }));
}

type DentalMapProps = {
  kidId: string;
  kidBirthDate: string | null;
  events: ToothEvent[];
  onRegisterEvent: (
    payload: ToothEventRequestDTO,
    editingId: string | null,
  ) => Promise<void>;
};

export function DentalMap({
  kidId,
  kidBirthDate,
  events,
  onRegisterEvent,
}: DentalMapProps) {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      return () => setModalVisible(false);
    }, []),
  );

  const arches = useMemo(
    () => ({
      upperRight: [...buildArch("upper", "right")].reverse(),
      upperLeft: buildArch("upper", "left"),
      lowerRight: [...buildArch("lower", "right")].reverse(),
      lowerLeft: buildArch("lower", "left"),
    }),
    [],
  );

  const ageMonths = useMemo(
    () => (kidBirthDate ? ageInMonths(kidBirthDate) : null),
    [kidBirthDate],
  );

  const states = useMemo(() => {
    const map = new Map<string, MapToothState>();
    for (const positions of Object.values(arches)) {
      for (const position of positions) {
        map.set(
          `${position.quadrant}:${position.toothType}`,
          toothState(position, ageMonths, events),
        );
      }
    }
    return map;
  }, [arches, ageMonths, events]);

  const archWidth = Math.max(300, screenWidth - 100);

  const legendCounts = useMemo(() => {
    const counts: Record<MapToothState, number> = {
      unregistered: 0,
      dimmed: 0,
      bornMilk: 0,
      bornPermanent: 0,
      fell: 0,
      delayed: 0,
    };
    for (const state of states.values()) {
      counts[state] += 1;
    }
    return counts;
  }, [states]);

  const onToothPress = useCallback((toothId: string) => {
    setSelectedTooth(toothId);
    setModalVisible(true);
  }, []);

  const handleRegister = useCallback(
    async (payload: ToothEventRequestDTO, editingId: string | null) => {
      try {
        await onRegisterEvent(payload, editingId);
        setModalVisible(false);
      } catch {
        Alert.alert("Erro", "Não foi possível registrar o evento.");
      }
    },
    [onRegisterEvent],
  );

  const selectedParsed = parseToothId(selectedTooth);
  const selectedToothEvents = selectedParsed
    ? events.filter(
        (event) =>
          event.quadrant === selectedParsed.quadrant &&
          event.toothType === selectedParsed.toothType,
      )
    : [];

  function stateOf(position: ToothPosition): MapToothState {
    return (
      states.get(`${position.quadrant}:${position.toothType}`) ??
      "unregistered"
    );
  }

  function renderOpenArch(
    right: ToothPosition[],
    left: ToothPosition[],
    upper: boolean,
  ) {
    const cx = archWidth / 2;
    const yBase = upper ? 30 : OPEN_ARCH_HEIGHT - 30;
    const rx = archWidth / 2 - 34;
    const ry = OPEN_ARCH_HEIGHT - 70;

    function place(sign: 1 | -1, curveIndex: number) {
      const theta = (curveIndex / 7) * Math.PI * 0.5;
      const x = cx + sign * (14 + rx * Math.sin(theta));
      const y = upper
        ? yBase + ry * (1 - Math.cos(theta))
        : yBase - ry * (1 - Math.cos(theta));
      const rotation = sign * (curveIndex / 7) * 12;
      return { x, y, rotation };
    }

    function renderPlaced(
      position: ToothPosition,
      sign: 1 | -1,
      curveIndex: number,
    ) {
      const tooth = FDI_TEETH[position.fdi];
      if (!tooth) {
        return null;
      }
      const { x, y, rotation } = place(sign, curveIndex);
      const state = stateOf(position);
      return (
        <TouchableOpacity
          key={position.id}
          onPress={() => onToothPress(position.id)}
          hitSlop={6}
          style={{
            position: "absolute",
            left: x - OPEN_TOOTH_SIZE / 2,
            top: y - OPEN_TOOTH_SIZE / 2,
            transform: [{ rotate: `${rotation}deg` }],
            opacity: state === "dimmed" ? 0.35 : 1,
          }}
        >
          <ToothSVG
            viewBox={tooth.viewBox}
            contour={tooth.contour}
            details={tooth.details}
            fill={STATE_COLORS[state]}
            width={OPEN_TOOTH_SIZE}
            height={OPEN_TOOTH_SIZE}
          />
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={{ width: archWidth, height: OPEN_ARCH_HEIGHT }}
        className="self-center"
      >
        {right.map((position, index) =>
          renderPlaced(position, -1, 7 - index),
        )}
        {left.map((position, index) => renderPlaced(position, 1, index))}
      </View>
    );
  }

  function renderArchSection(
    right: ToothPosition[],
    left: ToothPosition[],
    title: string,
  ) {
    return (
      <View className="w-full">
        <Wrapper direction="row" justify="between" className="mb-1 w-full">
          <Text className="text-xs font-bold text-base-500">
            {`${title} · Direito`}
          </Text>
          <Text className="text-xs font-bold text-base-500">
            {`${title} · Esquerdo`}
          </Text>
        </Wrapper>
        {renderOpenArch(right, left, title === "Superior")}
      </View>
    );
  }

  return (
    <Wrapper direction="column" align="center" className="w-full">
      <Wrapper
        direction="column"
        align="start"
        justify="start"
        gap="gap-4"
        className="w-full flex-1 rounded-xl bg-base-100 p-5 shadow-sm shadow-base-300"
      >
        <Text variant="h4" className="text-primary-500">
          Mapa do Sorriso
        </Text>

        {renderArchSection(
          arches.upperRight,
          arches.upperLeft,
          "Superior",
        )}
        {renderArchSection(
          arches.lowerRight,
          arches.lowerLeft,
          "Inferior",
        )}

        <Wrapper
          justify="center"
          align="center"
          direction="column"
          gap="gap-1"
          className="mt-1 w-full"
        >
          {LEGEND.map((entry) => (
            <Wrapper
              key={entry.state}
              direction="row"
              align="center"
              justify="between"
              className="w-full px-1"
            >
              <Wrapper direction="row" align="center" gap="gap-2">
                <ToothIcon size={18} color={entry.color} weight="fill" />
                <Text className="text-sm text-base-500">{entry.label}</Text>
              </Wrapper>
              <Text className="text-sm font-bold text-base-600">
                {legendCounts[entry.state]}
              </Text>
            </Wrapper>
          ))}
        </Wrapper>
      </Wrapper>

      <ToothEventModal
        visible={modalVisible}
        toothId={selectedTooth}
        kidId={kidId}
        kidBirthDate={kidBirthDate}
        toothEvents={selectedToothEvents}
        onClose={() => setModalVisible(false)}
        onSubmit={handleRegister}
      />
    </Wrapper>
  );
}
