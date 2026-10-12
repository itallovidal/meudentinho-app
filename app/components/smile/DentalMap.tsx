import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Wrapper } from "@/components/wrapper";
import ToothSVG, { type StrokeColor } from "./teeth/ToothSVG";
import { TOOTH_PATHS } from "./teeth/paths";
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
  pathId: string;
  flipVertical: boolean;
};

type ArchMode = "open" | "closed";

type ShownToothType = Exclude<ToothType, "third_molar">;

const QUADRANT_TYPES: ShownToothType[] = [
  "central_incisor",
  "lateral_incisor",
  "canine",
  "first_premolar",
  "second_premolar",
  "first_molar",
  "second_molar",
];

const UPPER_SHAPES: Record<ShownToothType, { pathId: string; flipVertical: boolean }> = {
  central_incisor: { pathId: "upper_central_incisor", flipVertical: false },
  lateral_incisor: { pathId: "upper_lateral_incisor", flipVertical: false },
  canine: { pathId: "upper_canine", flipVertical: false },
  first_premolar: { pathId: "lower_first_premolar", flipVertical: true },
  second_premolar: { pathId: "lower_second_premolar", flipVertical: true },
  first_molar: { pathId: "lower_first_molar", flipVertical: true },
  second_molar: { pathId: "lower_second_molar", flipVertical: true },
};

const LOWER_SHAPES: Record<ShownToothType, { pathId: string; flipVertical: boolean }> = {
  central_incisor: { pathId: "lower_central_incisor", flipVertical: false },
  lateral_incisor: { pathId: "lower_lateral_incisor", flipVertical: false },
  canine: { pathId: "lower_canine", flipVertical: false },
  first_premolar: { pathId: "lower_first_premolar", flipVertical: false },
  second_premolar: { pathId: "lower_second_premolar", flipVertical: false },
  first_molar: { pathId: "lower_first_molar", flipVertical: false },
  second_molar: { pathId: "lower_second_molar", flipVertical: false },
};

const STROKE_BY_STATE: Record<MapToothState, StrokeColor> = {
  unregistered: "gray",
  dimmed: "gray",
  bornMilk: "light-blue",
  bornPermanent: "dark-blue",
  fell: "orange",
  delayed: "soft-red",
};


const LEGEND: { state: MapToothState; label: string; color: string }[] = [
  { state: "unregistered", label: "Sem registro", color: "#8E97A3" },
  { state: "dimmed", label: "Fora da faixa etária", color: "#D9D9D9" },
  { state: "bornMilk", label: "Nasceu (leite)", color: "#4C9BDD" },
  { state: "bornPermanent", label: "Nasceu (permanente)", color: "#1E3A5F" },
  { state: "fell", label: "Caiu", color: "#DE7F02" },
  { state: "delayed", label: "Atrasado", color: "#DA4E4E" },
];

const FILL_BY_STATE: Record<MapToothState, string> = {
  unregistered: "#FFFFFF",
  dimmed: "#FFFFFF",
  bornMilk: "#E3F1FC",
  bornPermanent: "#DCE7F3",
  fell: "#FDF0DC",
  delayed: "#FDE7E7",
};

const OPEN_TOOTH_SIZE = 28;
const OPEN_ARCH_HEIGHT = 190;

function buildArch(arch: Arch, side: Side): ToothPosition[] {
  const shapes = arch === "upper" ? UPPER_SHAPES : LOWER_SHAPES;
  return QUADRANT_TYPES.map((toothType) => ({
    id: `${arch}_${side}_${toothType}`,
    toothType,
    arch,
    side,
    quadrant: `${arch}_${side}` as Quadrant,
    pathId: shapes[toothType].pathId,
    flipVertical: shapes[toothType].flipVertical,
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
  const [mode, setMode] = useState<ArchMode>("open");
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

  const archWidth = Math.max(280, screenWidth - 120);

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

  function renderTooth(
    position: ToothPosition,
    size: number,
    flipHorizontal: boolean,
  ) {
    const path = TOOTH_PATHS[position.pathId];
    if (!path) {
      return null;
    }
    const state = stateOf(position);
    return (
      <TouchableOpacity
        key={position.id}
        onPress={() => onToothPress(position.id)}
        hitSlop={4}
        style={{ opacity: state === "dimmed" ? 0.35 : 1 }}
      >
        <ToothSVG
          viewBox={path.viewBox}
          content={path.content}
          width={size}
          height={size}
          stroke={STROKE_BY_STATE[state]}
          strokeWidth={1.5}
          fill={FILL_BY_STATE[state]}
          flipHorizontal={flipHorizontal}
          flipVertical={position.flipVertical}
        />
      </TouchableOpacity>
    );
  }

  function renderClosedStrip(right: ToothPosition[], left: ToothPosition[]) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-end gap-1">
          {right.map((position) => renderTooth(position, 30, false))}
          {left.map((position) => renderTooth(position, 30, true))}
        </View>
      </ScrollView>
    );
  }

  function renderOpenArch(
    right: ToothPosition[],
    left: ToothPosition[],
    upper: boolean,
  ) {
    const cx = archWidth / 2;
    const yBase = upper ? 30 : OPEN_ARCH_HEIGHT - 30;
    const rx = archWidth / 2 - 30;
    const ry = OPEN_ARCH_HEIGHT - 70;

    function place(sign: 1 | -1, curveIndex: number) {
      const theta = (curveIndex / 6) * Math.PI * 0.5;
      const x = cx + sign * (14 + rx * Math.sin(theta));
      const y = upper
        ? yBase + ry * (1 - Math.cos(theta))
        : yBase - ry * (1 - Math.cos(theta));
      const rotation = sign * (curveIndex / 6) * 12;
      return { x, y, rotation };
    }

    function renderPlaced(
      position: ToothPosition,
      sign: 1 | -1,
      curveIndex: number,
    ) {
      const path = TOOTH_PATHS[position.pathId];
      if (!path) {
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
            viewBox={path.viewBox}
            content={path.content}
            width={OPEN_TOOTH_SIZE}
            height={OPEN_TOOTH_SIZE}
            stroke={STROKE_BY_STATE[state]}
            strokeWidth={2}
            fill={FILL_BY_STATE[state]}
            flipHorizontal={sign > 0}
            flipVertical={position.flipVertical}
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
          renderPlaced(position, -1, 6 - index),
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
        <Wrapper direction="row" align="center" justify="between" className="w-full">
          <Text variant="h4" className="text-primary-500">
            Mapa do Sorriso
          </Text>
          <Wrapper direction="row" gap="gap-2">
            <TouchableOpacity
              onPress={() => setMode("open")}
              className={`rounded-full px-3 py-1.5 ${mode === "open" ? "bg-primary-500" : "bg-base-200"}`}
            >
              <Text
                className={`text-xs font-bold ${mode === "open" ? "text-white" : ""}`}
              >
                Aberta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("closed")}
              className={`rounded-full px-3 py-1.5 ${mode === "closed" ? "bg-primary-500" : "bg-base-200"}`}
            >
              <Text
                className={`text-xs font-bold ${mode === "closed" ? "text-white" : ""}`}
              >
                Fechada
              </Text>
            </TouchableOpacity>
          </Wrapper>
        </Wrapper>

        {mode === "open" ? (
          <>
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
          </>
        ) : (
          <View className="w-full">
            {renderClosedStrip(arches.upperRight, arches.upperLeft)}
            {renderClosedStrip(arches.lowerRight, arches.lowerLeft)}
          </View>
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
