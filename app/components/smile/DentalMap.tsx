import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Wrapper } from "@/components/wrapper";
import ToothSVG from "./teeth/ToothSVG";
import { FDI_TEETH } from "./teeth/fdiTeeth";
import {
  LEGEND,
  LEGEND_TOOTH,
  MILK_SYMBOL_DASH,
  TOOTH_STYLE,
  isMilkSymbol,
} from "./teeth/toothStyle";
import { Text } from "@/components/ui/text";
import { ToothEventModal } from "./ToothEventModal";
import { ageInMonths } from "@/lib/utils";
import { parseToothId } from "@/lib/teethLabels";
import {
  isInEruptionWindow,
  toothState,
  type ChronologyGender,
  type MapToothState,
} from "@/lib/toothChronology";
import { ApiError } from "@/types/domain";
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

type LegendCounts = Record<MapToothState, number> & { eruptionWindow: number };

const OPEN_TOOTH_SIZE = 28;
const OPEN_ARCH_HEIGHT = 190;
const GUM_COLOR = "#F4A3A6";
const GUM_EDGE_COLOR = "#C2555F";

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
  kidId: string | null;
  kidBirthDate: string | null;
  kidGender: ChronologyGender | null;
  events: ToothEvent[];
  onRegisterEvent: (payload: ToothEventRequestDTO) => Promise<void>;
  onMissingKid?: () => void;
};

export function DentalMap({
  kidId,
  kidBirthDate,
  kidGender,
  events,
  onRegisterEvent,
  onMissingKid,
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
          toothState(position, events),
        );
      }
    }
    return map;
  }, [arches, events]);

  const archWidth = Math.max(300, screenWidth - 100);

  const legendCounts = useMemo(() => {
    const counts: LegendCounts = {
      unregistered: 0,
      bornMilk: 0,
      bornPermanent: 0,
      fell: 0,
      eruptionWindow: 0,
    };
    for (const positions of Object.values(arches)) {
      for (const position of positions) {
        const state =
          states.get(`${position.quadrant}:${position.toothType}`) ??
          "unregistered";
        if (state === "unregistered" && eruptionWindowOf(position)) {
          counts.eruptionWindow += 1;
        } else {
          counts[state] += 1;
        }
      }
    }
    return counts;
  }, [arches, states, ageMonths]);

  const onToothPress = useCallback(
    (toothId: string) => {
      if (!kidId) {
        onMissingKid?.();
        return;
      }
      setSelectedTooth(toothId);
      setModalVisible(true);
    },
    [kidId, onMissingKid],
  );

  const handleRegister = useCallback(
    async (payload: ToothEventRequestDTO) => {
      try {
        await onRegisterEvent(payload);
        setModalVisible(false);
      } catch (error) {
        console.log("[smile] falha ao registrar evento", error);
        const detail =
          error instanceof ApiError
            ? `${error.message} (${error.code})`
            : error instanceof Error
              ? error.message
              : String(error);
        Alert.alert(
          "Erro",
          `Não foi possível registrar o evento.\n\n${detail}`,
        );
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

  function eruptionWindowOf(position: ToothPosition): boolean {
    return isInEruptionWindow(
      position.arch,
      position.toothType,
      ageMonths,
      position.side,
      kidGender,
    );
  }

  function stateOf(position: ToothPosition): MapToothState {
    return (
      states.get(`${position.quadrant}:${position.toothType}`) ?? "unregistered"
    );
  }

  function renderOpenArch(
    right: ToothPosition[],
    left: ToothPosition[],
    upper?: boolean,
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

    const gumPoints: string[] = [];
    for (let k = 7; k >= 0; k -= 0.5) {
      const { x, y } = place(-1, k);
      gumPoints.push(`${x},${y}`);
    }
    for (let k = 0; k <= 7; k += 0.5) {
      const { x, y } = place(1, k);
      gumPoints.push(`${x},${y}`);
    }
    const gumPath = `M${gumPoints.join(" L")}`;

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
      const highlighted =
        state === "unregistered" && eruptionWindowOf(position);
      const key = highlighted ? "eruptionWindow" : state;
      const style = TOOTH_STYLE[key];
      const milk = isMilkSymbol(key);
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
          }}
        >
          <ToothSVG
            viewBox={tooth.viewBox}
            contour={tooth.contour}
            details={tooth.details}
            fill={style.fill}
            stroke={style.stroke}
            strokeDasharray={milk ? MILK_SYMBOL_DASH : undefined}
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
        <Svg
          width={archWidth}
          height={OPEN_ARCH_HEIGHT}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <Path
            d={gumPath}
            fill="none"
            stroke={GUM_EDGE_COLOR}
            strokeWidth={OPEN_TOOTH_SIZE + 12}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d={gumPath}
            fill="none"
            stroke={GUM_COLOR}
            strokeWidth={OPEN_TOOTH_SIZE + 4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        {right.map((position, index) => renderPlaced(position, -1, 7 - index))}
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
        {title == "Inferior" && renderOpenArch(right, left)}
        <Wrapper direction="row" justify="between" className="mb-1 w-full">
          <Text className="text-xs font-bold text-base-500">
            {`${title} · Direito`}
          </Text>
          <Text className="text-xs font-bold text-base-500">
            {`${title} · Esquerdo`}
          </Text>
        </Wrapper>
        {title == "Superior" && renderOpenArch(right, left, true)}
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
        className="w-full rounded-xl bg-base-100 p-5 shadow-sm shadow-base-300"
      >
        <Text variant="h4" className="text-primary-500">
          Mapa do Sorriso
        </Text>

        {renderArchSection(arches.upperRight, arches.upperLeft, "Superior")}
        {renderArchSection(arches.lowerRight, arches.lowerLeft, "Inferior")}

        <Wrapper
          justify="center"
          align="center"
          direction="column"
          gap="gap-2"
          className="mt-1 w-full"
        >
          {LEGEND.map((entry) => (
            <Wrapper
              key={entry.key}
              direction="row"
              align="center"
              justify="between"
              className="w-full px-1"
            >
              <Wrapper direction="row" align="center" gap="gap-3">
                <ToothSVG
                  viewBox={LEGEND_TOOTH.viewBox}
                  contour={LEGEND_TOOTH.contour}
                  details={LEGEND_TOOTH.details}
                  fill={TOOTH_STYLE[entry.key].fill}
                  stroke={TOOTH_STYLE[entry.key].stroke}
                  strokeDasharray={
                    isMilkSymbol(entry.key) ? MILK_SYMBOL_DASH : undefined
                  }
                  width={22}
                  height={22}
                />
                <View>
                  <Text className="text-sm font-semibold text-base-600">
                    {entry.label}
                  </Text>
                  <Text className="text-xs text-base-500">
                    {entry.description}
                  </Text>
                </View>
              </Wrapper>
              <Text className="text-sm font-bold text-base-600">
                {legendCounts[entry.key]}
              </Text>
            </Wrapper>
          ))}
        </Wrapper>
      </Wrapper>

      {kidId && (
        <ToothEventModal
          visible={modalVisible}
          toothId={selectedTooth}
          kidId={kidId}
          kidBirthDate={kidBirthDate}
          kidGender={kidGender}
        toothEvents={selectedToothEvents}
        events={events}
        onClose={() => setModalVisible(false)}
        onSubmit={handleRegister}
      />
      )}
    </Wrapper>
  );
}
