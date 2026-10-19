import type {
  Arch,
  Dentition,
  Quadrant,
  Side,
  ToothEvent,
  ToothType,
} from "@/types/teeth";

export interface ToothChronology {
  deciduous: { at: number; limit: number } | null;
  permanent: { from: number; to: number; limit: number };
}

type ChronologyKey = `${Arch}:${ToothType}`;

type WomenPermanentKey = `${Quadrant}:${ToothType}`;

const CHRONOLOGY: Record<ChronologyKey, ToothChronology> = {
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
  "upper:third_molar": {
    deciduous: null,
    permanent: { from: 204, to: 360, limit: 1200 },
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
  "lower:third_molar": {
    deciduous: null,
    permanent: { from: 204, to: 360, limit: 1200 },
  },
};

export type ChronologyGender = "male" | "female";

const WOMEN_PERMANENT: Record<WomenPermanentKey, ToothChronology["permanent"]> = {
  "upper_right:central_incisor": { from: 84, to: 96, limit: 102 },
  "upper_right:lateral_incisor": { from: 96, to: 108, limit: 114 },
  "upper_right:canine": { from: 132, to: 144, limit: 147 },
  "upper_right:first_premolar": { from: 120, to: 132, limit: 141 },
  "upper_right:second_premolar": { from: 120, to: 144, limit: 153 },
  "upper_right:first_molar": { from: 72, to: 84, limit: 85 },
  "upper_right:second_molar": { from: 144, to: 156, limit: 170 },
  "upper_left:central_incisor": { from: 84, to: 96, limit: 102 },
  "upper_left:lateral_incisor": { from: 96, to: 108, limit: 114 },
  "upper_left:canine": { from: 132, to: 144, limit: 145 },
  "upper_left:first_premolar": { from: 120, to: 132, limit: 141 },
  "upper_left:second_premolar": { from: 120, to: 144, limit: 155 },
  "upper_left:first_molar": { from: 72, to: 84, limit: 85 },
  "upper_left:second_molar": { from: 144, to: 156, limit: 175 },
  "lower_left:central_incisor": { from: 72, to: 84, limit: 90 },
  "lower_left:lateral_incisor": { from: 84, to: 96, limit: 102 },
  "lower_left:canine": { from: 108, to: 132, limit: 133 },
  "lower_left:first_premolar": { from: 108, to: 132, limit: 140 },
  "lower_left:second_premolar": { from: 120, to: 144, limit: 153 },
  "lower_left:first_molar": { from: 72, to: 84, limit: 90 },
  "lower_left:second_molar": { from: 132, to: 144, limit: 170 },
  "lower_right:central_incisor": { from: 72, to: 84, limit: 90 },
  "lower_right:lateral_incisor": { from: 84, to: 96, limit: 102 },
  "lower_right:canine": { from: 108, to: 132, limit: 133 },
  "lower_right:first_premolar": { from: 108, to: 132, limit: 141 },
  "lower_right:second_premolar": { from: 120, to: 144, limit: 154 },
  "lower_right:first_molar": { from: 72, to: 84, limit: 84 },
  "lower_right:second_molar": { from: 132, to: 144, limit: 167 },
  "upper_right:third_molar": { from: 204, to: 360, limit: 1200 },
  "upper_left:third_molar": { from: 204, to: 360, limit: 1200 },
  "lower_left:third_molar": { from: 204, to: 360, limit: 1200 },
  "lower_right:third_molar": { from: 204, to: 360, limit: 1200 },
};

export type MapToothState =
  "unregistered" | "bornMilk" | "bornPermanent" | "fell";

export function getChronology(
  arch: Arch,
  toothType: ToothType,
  side?: Side,
  gender?: ChronologyGender | null,
): ToothChronology | null {
  const base = CHRONOLOGY[`${arch}:${toothType}`] ?? null;
  if (!base || !side || gender !== "female") {
    return base;
  }
  const permanent = WOMEN_PERMANENT[`${arch}_${side}:${toothType}`];
  return permanent ? { ...base, permanent } : base;
}

export function hasDeciduousForm(arch: Arch, toothType: ToothType): boolean {
  const info = getChronology(arch, toothType);
  return info !== null && info.deciduous !== null;
}

export function expectedDentition(
  toothType: ToothType,
  arch: Arch,
  ageMonths: number | null,
  side?: Side,
  gender?: ChronologyGender | null,
): Dentition {
  const info = getChronology(arch, toothType, side, gender);
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

export function isInEruptionWindow(
  arch: Arch,
  toothType: ToothType,
  ageMonths: number | null,
  side?: Side,
  gender?: ChronologyGender | null,
): boolean {
  const info = getChronology(arch, toothType, side, gender);
  if (!info || ageMonths === null || Number.isNaN(ageMonths) || ageMonths < 0) {
    return false;
  }
  const inDeciduous =
    info.deciduous !== null &&
    ageMonths >= info.deciduous.at &&
    ageMonths <= info.deciduous.limit;
  const inPermanent =
    ageMonths >= info.permanent.from && ageMonths <= info.permanent.limit;
  return inDeciduous || inPermanent;
}

export type PendingMilkStep = "eruption" | "exfoliation";

export function pendingMilkStep(
  arch: Arch,
  quadrant: Quadrant,
  toothType: ToothType,
  events: ToothEvent[],
): PendingMilkStep | null {
  if (!hasDeciduousForm(arch, toothType)) {
    return null;
  }
  const milkEvents = events.filter(
    (event) =>
      event.quadrant === quadrant &&
      event.toothType === toothType &&
      event.dentition === "primary",
  );
  if (!milkEvents.some((event) => event.eventType === "eruption")) {
    return "eruption";
  }
  if (!milkEvents.some((event) => event.eventType === "exfoliation")) {
    return "exfoliation";
  }
  return null;
}

export function toothState(
  position: { toothType: ToothType; arch: Arch; side: Side },
  events: ToothEvent[],
): MapToothState {
  const key = `${position.arch}_${position.side}:${position.toothType}`;
  const mine = events.filter(
    (event) => `${event.quadrant}:${event.toothType}` === key,
  );
  if (mine.length === 0) {
    return "unregistered";
  }
  const stage = (event: ToothEvent): number =>
    (event.dentition === "permanent" ? 2 : 0) +
    (event.eventType === "exfoliation" ? 1 : 0);
  const highest = mine.reduce((best, event) =>
    stage(event) > stage(best) ? event : best,
  );
  if (highest.dentition === "permanent") {
    return highest.eventType === "exfoliation" ? "fell" : "bornPermanent";
  }
  return highest.eventType === "exfoliation" ? "fell" : "bornMilk";
}
