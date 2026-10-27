import { isToothEventDateUnknown } from "@/lib/toothIdentity";
import { type ChronologyGender } from "@/lib/toothChronology";
import { buildToothMilestones } from "@/lib/toothMilestones";
import {
  archLabel,
  dentitionLabel,
  toothDentitionLabel,
} from "@/lib/teethLabels";
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
  tolerance: "Após o período previsto",
  upcoming: "Previsto",
};

export const PREDICTION_STATUS_DESCRIPTION: Record<
  ToothPredictionStatus,
  string
> = {
  current: "Período provável para a erupção deste dente.",
  tolerance:
    "A faixa prevista terminou. O limite estimado ainda não foi ultrapassado.",
  upcoming: "Estimativa baseada na cronologia média de erupção.",
};

const STATUS_PRIORITY: Record<ToothPredictionStatus, number> = {
  current: 0,
  tolerance: 1,
  upcoming: 2,
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
  prematureWeeks: string | number | null = null,
): ToothPrediction[] {
  const groups = new Map<string, ToothPrediction>();
  const today = toLocalDateKey(referenceDate);
  for (const milestone of buildToothMilestones({
    kidId: "",
    birthDate,
    events,
    gender,
    prematureWeeks,
    referenceDate,
  })) {
    if (milestone.status !== "current" && milestone.status !== "upcoming")
      continue;
    if (milestone.limitDate === null && today > milestone.expectedEnd) continue;
    const status = milestone.inTolerance ? "tolerance" : milestone.status;
    const key = `${milestone.arch}:${milestone.toothType}:${milestone.dentition}:${milestone.windowStart}:${milestone.expectedEnd}:${milestone.limitDate}:${status}`;
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
        title: `${toothDentitionLabel(milestone.toothType, milestone.dentition).replace(/ de leite$/, "")} ${archLabel(milestone.arch)} (${dentitionLabel(milestone.dentition).toLowerCase()})`,
        sides: [milestone.side],
        pendingSides: 1,
        status,
        windowStart: milestone.windowStart,
        windowEnd: milestone.expectedEnd,
        limitDate: milestone.limitDate,
      });
    }
  }
  return [...groups.values()].sort((a, b) => {
    const priority = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    const dateA =
      a.status === "tolerance" ? (a.limitDate ?? a.windowEnd) : a.windowStart;
    const dateB =
      b.status === "tolerance" ? (b.limitDate ?? b.windowEnd) : b.windowStart;
    return priority || dateA.localeCompare(dateB) || a.id.localeCompare(b.id);
  });
}

export function formatPredictionWindow(
  startKey: string,
  endKey: string,
  referenceDate: Date = new Date(),
): string {
  const [startYear, startMonth, startDay] = startKey.split("-").map(Number);
  const [endYear, endMonth, endDay] = endKey.split("-").map(Number);
  const yearSuffix =
    endYear !== referenceDate.getFullYear() ? ` de ${endYear}` : "";
  if (startKey === endKey) {
    return `${startDay} de ${MONTH_NAMES_PT_BR[startMonth - 1]}${yearSuffix}`;
  }
  if (startYear !== endYear) {
    return `${startDay} de ${MONTH_NAMES_PT_BR[startMonth - 1]} de ${startYear} a ${endDay} de ${MONTH_NAMES_PT_BR[endMonth - 1]} de ${endYear}`;
  }
  if (startMonth === endMonth) {
    return `${startDay} a ${endDay} de ${MONTH_NAMES_PT_BR[startMonth - 1]}${yearSuffix}`;
  }
  return `${startDay} de ${MONTH_NAMES_PT_BR[startMonth - 1]} a ${endDay} de ${MONTH_NAMES_PT_BR[endMonth - 1]}${yearSuffix}`;
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
