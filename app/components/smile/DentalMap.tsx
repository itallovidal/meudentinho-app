import {
  buildToothMilestones,
  type ToothMilestone,
} from "@/lib/toothMilestones";
import {
  compareToothEventProgress,
  normalizePrimaryToothType,
} from "@/lib/toothIdentity";
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Wrapper } from "@/components/wrapper";
import { useToast } from "@/components/ui/toast";
import { ToothSVG } from "./teeth/ToothSVG";
import { FDI_TEETH, type FdiNumber } from "./teeth/fdiTeeth";
import {
  LEGEND,
  LEGEND_TOOTH,
  MILK_SYMBOL_DASH,
  TOOTH_STYLE,
  isMilkSymbol,
  type ToothMapStateKey,
} from "./teeth/toothStyle";
import { Text } from "@/components/ui/text";
import { InfoPopover } from "@/components/infoPopover";
import { ToothEventModal } from "./ToothEventModal";
import { parseToothId, toothAccessibilityLabel } from "@/lib/teethLabels";
import {
  toothState,
  type ChronologyGender,
  type MapToothState,
} from "@/lib/toothChronology";
import { isApiError } from "@/types/predicates";
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
  fdi: FdiNumber;
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
const ALERT_BADGE_SIZE = 16;
const ALERT_BADGE_DISTANCE = OPEN_TOOTH_SIZE / 2 + ALERT_BADGE_SIZE / 2;
const OPEN_ARCH_HEIGHT = 190;
const GUM_COLOR = "#F4A3A6";
const GUM_EDGE_COLOR = "#C2555F";

function nearestPosition(
  points: { id: string; x: number; y: number }[],
  px: number,
  py: number,
) {
  return points.reduce((best, point) =>
    Math.hypot(point.x - px, point.y - py) <
    Math.hypot(best.x - px, best.y - py)
      ? point
      : best,
  );
}

function buildArch(arch: Arch, side: Side): ToothPosition[] {
  const quadrant = `${arch}_${side}` as Quadrant;
  return QUADRANT_TYPES.map((toothType) => ({
    id: `${arch}_${side}_${toothType}`,
    toothType,
    arch,
    side,
    quadrant,
    fdi: `${FDI_DECADE[quadrant]}${FDI_UNIT[toothType]}` as FdiNumber,
  }));
}

type DentalMapProps = {
  kidId: string | null;
  kidBirthDate: string | null;
  kidGender: ChronologyGender | null;
  events: ToothEvent[];
  onRegisterEvent: (payload: ToothEventRequestDTO) => Promise<void>;
  onMissingKid?: () => void;
  pendingMilestones?: ToothMilestone[];
  referenceDate?: Date;
};

export function DentalMap({
  kidId,
  kidBirthDate,
  kidGender,
  events,
  onRegisterEvent,
  onMissingKid,
  pendingMilestones = [],
  referenceDate = new Date(),
}: DentalMapProps) {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
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

  const milestones = useMemo(
    () =>
      buildToothMilestones({
        kidId: kidId ?? "",
        birthDate: kidBirthDate,
        events,
        gender: kidGender,
        referenceDate,
      }),
    [kidId, kidBirthDate, events, kidGender, referenceDate],
  );
  const currentPositions = useMemo(
    () =>
      new Set(
        milestones
          .filter((item) => item.status === "current")
          .map((item) => `${item.quadrant}:${item.toothType}`),
      ),
    [milestones],
  );
  const overduePositions = new Set(
    pendingMilestones.map((item) => `${item.quadrant}:${item.toothType}`),
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

  const latestEventByTooth = useMemo(() => {
    const map = new Map<string, ToothEvent>();
    for (const event of events) {
      const key = `${event.quadrant}:${normalizePrimaryToothType(event)}`;
      const current = map.get(key);
      if (!current || compareToothEventProgress(event, current) > 0) {
        map.set(key, event);
      }
    }
    return map;
  }, [events]);

  const archWidth = Math.max(300, screenWidth - 100);

  const legendCounts = useMemo(() => {
    const counts: LegendCounts = {
      unregistered: 0,
      bornMilk: 0,
      bornPermanent: 0,
      fell: 0,
      eruptionWindow: currentPositions.size,
    };
    for (const positions of Object.values(arches)) {
      for (const position of positions) {
        const state =
          states.get(`${position.quadrant}:${position.toothType}`) ??
          "unregistered";
        counts[state] += 1;
      }
    }
    return counts;
  }, [arches, states, currentPositions]);

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
        if (isApiError(error) && error.code === "TOOTH_EVENT_DUPLICATE") {
          await queryClient.invalidateQueries({
            queryKey: ["tooth-events"],
          });
          setModalVisible(false);
          showToast("Este evento já estava registrado.");
          return;
        }
        throw error;
      }
    },
    [onRegisterEvent, queryClient, showToast],
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
    return currentPositions.has(`${position.quadrant}:${position.toothType}`);
  }

  function stateOf(position: ToothPosition): MapToothState {
    return (
      states.get(`${position.quadrant}:${position.toothType}`) ?? "unregistered"
    );
  }

  function eventOf(position: ToothPosition): ToothEvent | undefined {
    return latestEventByTooth.get(`${position.quadrant}:${position.toothType}`);
  }

  function stateKeyOf(position: ToothPosition): ToothMapStateKey {
    const state = stateOf(position);
    if (state === "unregistered" && eruptionWindowOf(position)) {
      return "eruptionWindow";
    }
    return state;
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
      const { x, y, rotation } = place(sign, curveIndex);
      const key = stateKeyOf(position);
      const style = TOOTH_STYLE[key];
      const milk = isMilkSymbol(key);
      const event = eventOf(position);
      const isSelected = selectedTooth === position.id;
      const theta = (curveIndex / 7) * (Math.PI / 2);
      const indicatorX = -sign * Math.sin(theta);
      const indicatorY = upper ? Math.cos(theta) : -Math.cos(theta);
      const rotationRadians = (rotation * Math.PI) / 180;
      const localIndicatorX =
        indicatorX * Math.cos(rotationRadians) +
        indicatorY * Math.sin(rotationRadians);
      const localIndicatorY =
        -indicatorX * Math.sin(rotationRadians) +
        indicatorY * Math.cos(rotationRadians);
      return (
        <TouchableOpacity
          key={position.id}
          onPress={() => onToothPress(position.id)}
          accessibilityRole="button"
          accessibilityLabel={toothAccessibilityLabel({
            toothId: position.id,
            state: key,
            event,
          })}
          accessibilityHint={
            overduePositions.has(`${position.quadrant}:${position.toothType}`)
              ? "Há um registro pendente após o limite estimado. Abre o registro deste dente."
              : "Abre o registro deste dente"
          }
          accessibilityState={{ selected: isSelected }}
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
          {overduePositions.has(
            `${position.quadrant}:${position.toothType}`,
          ) && (
            <View
              className="items-center justify-center rounded-full bg-primary-500"
              style={{
                position: "absolute",
                left:
                  OPEN_TOOTH_SIZE / 2 +
                  localIndicatorX * ALERT_BADGE_DISTANCE -
                  ALERT_BADGE_SIZE / 2,
                top:
                  OPEN_TOOTH_SIZE / 2 +
                  localIndicatorY * ALERT_BADGE_DISTANCE -
                  ALERT_BADGE_SIZE / 2,
                width: ALERT_BADGE_SIZE,
                height: ALERT_BADGE_SIZE,
                transform: [{ rotate: `${-rotation}deg` }],
              }}
            >
              <Text className="text-xs font-bold text-base-100">!</Text>
            </View>
          )}
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
        <Pressable
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: archWidth,
            height: OPEN_ARCH_HEIGHT,
          }}
          onPress={(event) => {
            const { locationX, locationY } = event.nativeEvent;
            const points = [
              ...right.map((position, index) => ({
                id: position.id,
                ...place(-1, 7 - index),
              })),
              ...left.map((position, index) => ({
                id: position.id,
                ...place(1, index),
              })),
            ];
            const nearest = nearestPosition(points, locationX, locationY);
            if (nearest) {
              onToothPress(nearest.id);
            }
          }}
        />
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
        {title === "Inferior" && renderOpenArch(right, left)}
        <Wrapper direction="row" justify="between" className="mb-1 w-full">
          <Text className="text-xs font-bold text-base-500">
            {`${title} · Direito`}
          </Text>
          <Text className="text-xs font-bold text-base-500">
            {`${title} · Esquerdo`}
          </Text>
        </Wrapper>
        {title === "Superior" && renderOpenArch(right, left, true)}
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
        <Wrapper
          direction="row"
          align="center"
          justify="between"
          className="w-full"
        >
          <Text variant="h4" className="text-primary-500">
            Mapa do Sorriso
          </Text>
          <InfoPopover
            accessibilityLabel="Sobre o Mapa do Sorriso"
            accessibilityHint="Mostra um aviso sobre os registros e as previsões do mapa"
            message="O registro e as previsões estimadas não substituem o acompanhamento de um profissional odontológico."
          />
        </Wrapper>

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
