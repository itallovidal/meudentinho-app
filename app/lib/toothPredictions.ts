import { isToothEventDateUnknown } from "@/lib/toothIdentity";
import { type ChronologyGender } from "@/lib/toothChronology";
import { buildToothMilestones } from "@/lib/toothMilestones";
import { archLabel, toothTypeLabel } from "@/lib/teethLabels";
import { eventDateKey, toLocalDateKey } from "@/lib/utils";
import type {
  ToothEvent,
  ToothPrediction,
  ToothPredictionStatus,
} from "@/types/teeth";

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

function keyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function buildToothPredictions(
  birthDate: string | null,
  events: ToothEvent[],
  gender: ChronologyGender | null = null,
  referenceDate: Date = new Date(),
): ToothPrediction[] {
  const groups = new Map<string, ToothPrediction>();
  const today = toLocalDateKey(referenceDate);
  for (const milestone of buildToothMilestones({
    kidId: "",
    birthDate,
    events,
    gender,
    referenceDate,
  })) {
    if (milestone.status !== "current" && milestone.status !== "upcoming")
      continue;
    if (milestone.limitDate === null && today > milestone.expectedEnd) continue;
    const key = `${milestone.arch}:${milestone.toothType}:${milestone.dentition}:${milestone.windowStart}:${milestone.expectedEnd}:${milestone.limitDate}:${milestone.status}`;
    const group = groups.get(key);
    if (group) {
      group.sides.push(milestone.side);
      group.pendingSides += 1;
    } else {
      groups.set(key, {
        id: key,
        toothType: milestone.toothType,
        arch: milestone.arch,
        dentition: milestone.dentition,
        title: `${toothTypeLabel(milestone.toothType)} ${archLabel(milestone.arch)}`,
        sides: [milestone.side],
        pendingSides: 1,
        status: milestone.status,
        windowStart: milestone.windowStart,
        windowEnd: milestone.expectedEnd,
      });
    }
  }
  return [...groups.values()].sort((a, b) =>
    a.windowStart.localeCompare(b.windowStart),
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
    if (isToothEventDateUnknown(event)) continue;
    markFor(eventDateKey(event.occurrenceDate)).registered = true;
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
      isToothEventDateUnknown(event) ||
      event.toothType !== prediction.toothType ||
      event.dentition !== prediction.dentition ||
      !prediction.sides.some(
        (side) => event.quadrant === `${prediction.arch}_${side}`,
      )
    ) {
      continue;
    }
    const key = eventDateKey(event.occurrenceDate);
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
