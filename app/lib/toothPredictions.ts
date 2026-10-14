import { getChronology, type ChronologyGender } from "@/lib/toothChronology";
import { archLabel, toothTypeLabel } from "@/lib/teethLabels";
import { ageInMonths, parseLocalDate, toLocalDateKey } from "@/lib/utils";
import type {
  Arch,
  Dentition,
  Quadrant,
  Side,
  ToothEvent,
  ToothPrediction,
  ToothPredictionStatus,
  ToothType,
} from "@/types/teeth";

const ARCHES: Arch[] = ["upper", "lower"];
const SIDES: Side[] = ["right", "left"];
const TOOTH_TYPES: ToothType[] = [
  "central_incisor",
  "lateral_incisor",
  "canine",
  "first_premolar",
  "second_premolar",
  "first_molar",
  "second_molar",
  "third_molar",
];

const MONTH_MS = 1000 * 60 * 60 * 24 * 30.4375;

const MONTH_NAMES_PT_BR = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const PREDICTION_STATUS_LABEL: Record<ToothPredictionStatus, string> = {
  current: "Em período",
  upcoming: "Previsto",
};

interface EruptionRange {
  dentition: Dentition;
  start: number;
  end: number;
  limit: number;
}

function rangesFor(
  arch: Arch,
  toothType: ToothType,
  side: Side,
  gender: ChronologyGender | null,
): EruptionRange[] {
  const chronology = getChronology(arch, toothType, side, gender);
  if (!chronology) {
    return [];
  }
  const ranges: EruptionRange[] = [];
  if (chronology.deciduous) {
    ranges.push({
      dentition: "primary",
      start: chronology.deciduous.at,
      end: chronology.deciduous.limit,
      limit: chronology.deciduous.limit,
    });
  }
  ranges.push({
    dentition: "permanent",
    start: chronology.permanent.from,
    end: chronology.permanent.to,
    limit: chronology.permanent.limit,
  });
  return ranges;
}

function isSidePending(
  events: ToothEvent[],
  arch: Arch,
  side: Side,
  toothType: ToothType,
  dentition: Dentition,
): boolean {
  const quadrant = `${arch}_${side}` as Quadrant;
  const mine = events.filter(
    (event) => event.quadrant === quadrant && event.toothType === toothType,
  );
  if (dentition === "permanent") {
    return !mine.some(
      (event) =>
        event.eventType === "eruption" && event.dentition === "permanent",
    );
  }

  return !mine.some(
    (event) =>
      event.eventType === "eruption" || event.eventType === "exfoliation",
  );
}

function monthsAfter(birth: Date, months: number): Date {
  return new Date(birth.getTime() + months * MONTH_MS);
}

function keyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function buildToothPredictions(
  birthDate: string | null,
  events: ToothEvent[],
  gender: ChronologyGender | null = null,
): ToothPrediction[] {
  if (!birthDate) {
    return [];
  }
  const birth = parseLocalDate(birthDate);
  const ageMonths = ageInMonths(birthDate);
  if (!birth || ageMonths === null || ageMonths < 0) {
    return [];
  }

  const predictions: ToothPrediction[] = [];
  for (const arch of ARCHES) {
    for (const toothType of TOOTH_TYPES) {
      // Lados com a mesma janela viram um único marco (ex.: "2 lados pendentes").
      const groups = new Map<string, { range: EruptionRange; sides: Side[] }>();
      for (const side of SIDES) {
        for (const range of rangesFor(arch, toothType, side, gender)) {
          if (
            ageMonths > range.limit ||
            !isSidePending(events, arch, side, toothType, range.dentition)
          ) {
            continue;
          }
          const key = `${range.dentition}:${range.start}:${range.end}`;
          const group = groups.get(key) ?? { range, sides: [] };
          group.sides.push(side);
          groups.set(key, group);
        }
      }

      for (const { range, sides } of groups.values()) {
        predictions.push({
          id: `${arch}:${toothType}:${range.dentition}:${range.start}-${range.end}`,
          toothType,
          arch,
          dentition: range.dentition,
          title: `${toothTypeLabel(toothType)} ${archLabel(arch)}`,
          sides,
          pendingSides: sides.length,
          status: ageMonths >= range.start ? "current" : "upcoming",
          windowStart: toLocalDateKey(monthsAfter(birth, range.start)),
          windowEnd: toLocalDateKey(monthsAfter(birth, range.end)),
        });
      }
    }
  }

  return predictions.sort((a, b) =>
    a.windowStart < b.windowStart ? -1 : a.windowStart > b.windowStart ? 1 : 0,
  );
}

export function formatPredictionWindow(
  startKey: string,
  endKey: string,
): string {
  const [startYear, startMonth, startDay] = startKey.split("-").map(Number);
  const [endYear, endMonth, endDay] = endKey.split("-").map(Number);
  if (startKey === endKey) {
    return `${startDay} de ${MONTH_NAMES_PT_BR[startMonth - 1]}`;
  }
  if (startYear !== endYear) {
    return `${startDay} de ${MONTH_NAMES_PT_BR[startMonth - 1]} de ${startYear} a ${endDay} de ${MONTH_NAMES_PT_BR[endMonth - 1]} de ${endYear}`;
  }
  if (startMonth === endMonth) {
    return `${startDay} a ${endDay} de ${MONTH_NAMES_PT_BR[startMonth - 1]}`;
  }
  return `${startDay} de ${MONTH_NAMES_PT_BR[startMonth - 1]} a ${endDay} de ${MONTH_NAMES_PT_BR[endMonth - 1]}`;
}

export interface PredictionCalendarMark {
  inWindow: boolean;
  windowStart: boolean;
  windowEnd: boolean;
  registered: boolean;
}

export function buildPredictionCalendarMarks(
  predictions: ToothPrediction[],
  events: ToothEvent[],
): Record<string, PredictionCalendarMark> {
  const marks: Record<string, PredictionCalendarMark> = {};
  const markFor = (key: string): PredictionCalendarMark => {
    if (!marks[key]) {
      marks[key] = {
        inWindow: false,
        windowStart: false,
        windowEnd: false,
        registered: false,
      };
    }
    return marks[key];
  };

  for (const prediction of predictions) {
    const end = keyToDate(prediction.windowEnd);
    const cursor = keyToDate(prediction.windowStart);
    while (cursor <= end) {
      const key = toLocalDateKey(cursor);
      const mark = markFor(key);
      mark.inWindow = true;
      if (key === prediction.windowStart) {
        mark.windowStart = true;
      }
      if (key === prediction.windowEnd) {
        mark.windowEnd = true;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  for (const event of events) {
    markFor(toLocalDateKey(new Date(event.occurrenceDate))).registered = true;
  }

  return marks;
}

export function getPredictionFocusKey(
  prediction: ToothPrediction,
  events: ToothEvent[],
): string {
  let latest: string | null = null;
  for (const event of events) {
    if (
      event.toothType !== prediction.toothType ||
      event.dentition !== prediction.dentition ||
      !prediction.sides.some(
        (side) => event.quadrant === `${prediction.arch}_${side}`,
      )
    ) {
      continue;
    }
    const key = toLocalDateKey(new Date(event.occurrenceDate));
    if (!latest || key > latest) {
      latest = key;
    }
  }
  return latest ?? prediction.windowStart;
}

export function getCalendarFocus(
  predictions: ToothPrediction[],
  today: Date,
): { prediction: ToothPrediction; date: Date } | null {
  if (predictions.length === 0) {
    return null;
  }
  const todayKey = toLocalDateKey(today);
  const upcoming = predictions.find(
    (prediction) => prediction.windowEnd >= todayKey,
  );
  if (!upcoming) {
    return { prediction: predictions[predictions.length - 1], date: today };
  }
  if (upcoming.windowStart <= todayKey) {
    return { prediction: upcoming, date: today };
  }
  return { prediction: upcoming, date: keyToDate(upcoming.windowStart) };
}
