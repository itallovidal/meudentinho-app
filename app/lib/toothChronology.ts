import type {
  Arch,
  Dentition,
  Side,
  ToothEvent,
  ToothType,
} from "@/types/teeth";

export interface ToothChronology {
  deciduous: { at: number; limit: number } | null;
  permanent: { from: number; to: number; limit: number };
}

const CHRONOLOGY: Record<string, ToothChronology> = {
  "upper:central_incisor": {
    deciduous: { at: 10, limit: 16.2 },
    permanent: { from: 84, to: 96, limit: 102 },
  },
  "upper:lateral_incisor": {
    deciduous: { at: 13, limit: 17.9 },
    permanent: { from: 96, to: 108, limit: 114 },
  },
  "upper:canine": {
    deciduous: { at: 22, limit: 27.1 },
    permanent: { from: 132, to: 144, limit: 147 },
  },
  "upper:first_premolar": {
    deciduous: null,
    permanent: { from: 120, to: 132, limit: 142 },
  },
  "upper:second_premolar": {
    deciduous: null,
    permanent: { from: 120, to: 144, limit: 149 },
  },
  "upper:first_molar": {
    deciduous: { at: 18, limit: 23.2 },
    permanent: { from: 72, to: 84, limit: 86 },
  },
  "upper:second_molar": {
    deciduous: { at: 30, limit: 33.9 },
    permanent: { from: 144, to: 156, limit: 160 },
  },
  "lower:central_incisor": {
    deciduous: { at: 7, limit: 14.8 },
    permanent: { from: 72, to: 84, limit: 90 },
  },
  "lower:lateral_incisor": {
    deciduous: { at: 10, limit: 18.6 },
    permanent: { from: 84, to: 96, limit: 102 },
  },
  "lower:canine": {
    deciduous: { at: 20, limit: 27.6 },
    permanent: { from: 108, to: 132, limit: 140 },
  },
  "lower:first_premolar": {
    deciduous: null,
    permanent: { from: 108, to: 132, limit: 141 },
  },
  "lower:second_premolar": {
    deciduous: null,
    permanent: { from: 120, to: 144, limit: 150 },
  },
  "lower:first_molar": {
    deciduous: { at: 16, limit: 23.9 },
    permanent: { from: 72, to: 84, limit: 84 },
  },
  "lower:second_molar": {
    deciduous: { at: 28, limit: 34.2 },
    permanent: { from: 132, to: 144, limit: 156 },
  },
};

export type MapToothState =
  | "unregistered"
  | "dimmed"
  | "bornMilk"
  | "bornPermanent"
  | "fell"
  | "delayed";

export function getChronology(
  arch: Arch,
  toothType: ToothType,
): ToothChronology | null {
  return CHRONOLOGY[`${arch}:${toothType}`] ?? null;
}

export function expectedDentition(
  toothType: ToothType,
  arch: Arch,
  ageMonths: number | null,
): Dentition {
  const info = getChronology(arch, toothType);
  if (!info || !info.deciduous) {
    return "permanent";
  }
  if (
    ageMonths !== null &&
    !Number.isNaN(ageMonths) &&
    ageMonths >= info.permanent.from
  ) {
    return "permanent";
  }
  return "primary";
}

export function toothState(
  position: { toothType: ToothType; arch: Arch; side: Side },
  ageMonths: number | null,
  events: ToothEvent[],
): MapToothState {
  const key = `${position.arch}_${position.side}:${position.toothType}`;
  const mine = events.filter(
    (event) => `${event.quadrant}:${event.toothType}` === key,
  );
  if (
    mine.some(
      (event) =>
        event.eventType === "eruption" && event.dentition === "permanent",
    )
  ) {
    return "bornPermanent";
  }
  if (mine.some((event) => event.eventType === "exfoliation")) {
    return "fell";
  }
  if (mine.some((event) => event.eventType === "eruption")) {
    return "bornMilk";
  }
  const info = getChronology(position.arch, position.toothType);
  if (
    !info ||
    ageMonths === null ||
    Number.isNaN(ageMonths) ||
    ageMonths < 0
  ) {
    return "unregistered";
  }
  if (ageMonths >= info.permanent.from) {
    return ageMonths > info.permanent.limit ? "delayed" : "unregistered";
  }
  if (!info.deciduous || ageMonths < info.deciduous.at) {
    return "dimmed";
  }
  return ageMonths > info.deciduous.limit ? "delayed" : "unregistered";
}
