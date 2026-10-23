import { normalizePrimaryToothType } from "@/lib/toothIdentity";
import type {
  Arch,
  Dentition,
  Quadrant,
  Side,
  ToothEvent,
  ToothType,
} from "@/types/teeth";

export interface ToothChronology {
  deciduous: {
    from: number;
    to: number;
    limit: number;
    limitDays: number;
  } | null;
  permanent: { from: number; to: number; limit: number | null };
}

type ChronologyKey = `${Arch}:${ToothType}`;

type PermanentKey = `${Quadrant}:${ToothType}`;

const PRIMARY_PREDECESSOR: Record<ToothType, ToothType | null> = {
  central_incisor: "central_incisor",
  lateral_incisor: "lateral_incisor",
  canine: "canine",
  first_premolar: "first_molar",
  second_premolar: "second_molar",
  first_molar: null,
  second_molar: null,
  third_molar: null,
};

const CHRONOLOGY: Record<ChronologyKey, ToothChronology> = {
  "upper:central_incisor": {
    deciduous: { from: 10, to: 10, limit: 16, limitDays: 6 },
    permanent: { from: 84, to: 96, limit: 102 },
  },
  "upper:lateral_incisor": {
    deciduous: { from: 13, to: 13, limit: 17, limitDays: 26 },
    permanent: { from: 96, to: 108, limit: 114 },
  },
  "upper:canine": {
    deciduous: { from: 22, to: 22, limit: 27, limitDays: 3 },
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
    deciduous: { from: 18, to: 18, limit: 23, limitDays: 5 },
    permanent: { from: 72, to: 84, limit: 86 },
  },
  "upper:second_molar": {
    deciduous: { from: 30, to: 30, limit: 33, limitDays: 27 },
    permanent: { from: 144, to: 156, limit: 160 },
  },
  "upper:third_molar": {
    deciduous: null,
    permanent: { from: 204, to: 360, limit: null },
  },
  "lower:central_incisor": {
    deciduous: { from: 6, to: 8, limit: 14, limitDays: 24 },
    permanent: { from: 72, to: 84, limit: 90 },
  },
  "lower:lateral_incisor": {
    deciduous: { from: 9, to: 11, limit: 18, limitDays: 19 },
    permanent: { from: 84, to: 96, limit: 102 },
  },
  "lower:canine": {
    deciduous: { from: 20, to: 20, limit: 27, limitDays: 18 },
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
    deciduous: { from: 16, to: 16, limit: 23, limitDays: 26 },
    permanent: { from: 72, to: 84, limit: 84 },
  },
  "lower:second_molar": {
    deciduous: { from: 28, to: 28, limit: 34, limitDays: 5 },
    permanent: { from: 132, to: 144, limit: 156 },
  },
  "lower:third_molar": {
    deciduous: null,
    permanent: { from: 204, to: 360, limit: null },
  },
};

export type ChronologyGender = "male" | "female";

const MEN_PERMANENT: Record<PermanentKey, ToothChronology["permanent"]> = {
  "upper_right:central_incisor": { from: 84, to: 96, limit: 102 },
  "upper_right:lateral_incisor": { from: 96, to: 108, limit: 114 },
  "upper_right:canine": { from: 132, to: 144, limit: 147 },
  "upper_right:first_premolar": { from: 120, to: 132, limit: 142 },
  "upper_right:second_premolar": { from: 120, to: 144, limit: 149 },
  "upper_right:first_molar": { from: 72, to: 84, limit: 86 },
  "upper_right:second_molar": { from: 144, to: 156, limit: 160 },
  "upper_right:third_molar": { from: 204, to: 360, limit: null },
  "upper_left:central_incisor": { from: 84, to: 96, limit: 102 },
  "upper_left:lateral_incisor": { from: 96, to: 108, limit: 114 },
  "upper_left:canine": { from: 132, to: 144, limit: 147 },
  "upper_left:first_premolar": { from: 120, to: 132, limit: 143 },
  "upper_left:second_premolar": { from: 120, to: 144, limit: 152 },
  "upper_left:first_molar": { from: 72, to: 84, limit: 95 },
  "upper_left:second_molar": { from: 144, to: 156, limit: 165 },
  "upper_left:third_molar": { from: 204, to: 360, limit: null },
  "lower_left:central_incisor": { from: 72, to: 84, limit: 90 },
  "lower_left:lateral_incisor": { from: 84, to: 96, limit: 102 },
  "lower_left:canine": { from: 108, to: 132, limit: 140 },
  "lower_left:first_premolar": { from: 108, to: 132, limit: 142 },
  "lower_left:second_premolar": { from: 120, to: 144, limit: 152 },
  "lower_left:first_molar": { from: 72, to: 84, limit: 95 },
  "lower_left:second_molar": { from: 132, to: 144, limit: 161 },
  "lower_left:third_molar": { from: 204, to: 360, limit: null },
  "lower_right:central_incisor": { from: 72, to: 84, limit: 90 },
  "lower_right:lateral_incisor": { from: 84, to: 96, limit: 102 },
  "lower_right:canine": { from: 108, to: 132, limit: 140 },
  "lower_right:first_premolar": { from: 108, to: 132, limit: 141 },
  "lower_right:second_premolar": { from: 120, to: 144, limit: 150 },
  "lower_right:first_molar": { from: 72, to: 84, limit: 84 },
  "lower_right:second_molar": { from: 132, to: 144, limit: 156 },
  "lower_right:third_molar": { from: 204, to: 360, limit: null },
};

const WOMEN_PERMANENT: Record<PermanentKey, ToothChronology["permanent"]> = {
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
  "lower_right:first_premolar": { from: 108, to: 132, limit: 139 },
  "lower_right:second_premolar": { from: 120, to: 144, limit: 154 },
  "lower_right:first_molar": { from: 72, to: 84, limit: 90 },
  "lower_right:second_molar": { from: 132, to: 144, limit: 167 },
  "upper_right:third_molar": { from: 204, to: 360, limit: null },
  "upper_left:third_molar": { from: 204, to: 360, limit: null },
  "lower_left:third_molar": { from: 204, to: 360, limit: null },
  "lower_right:third_molar": { from: 204, to: 360, limit: null },
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
  if (!base) {
    return base;
  }
  const predecessor = PRIMARY_PREDECESSOR[toothType];
  const deciduous = predecessor
    ? CHRONOLOGY[`${arch}:${predecessor}`].deciduous
    : null;
  const chronology = { ...base, deciduous };
  if (!side) {
    return chronology;
  }
  const table = gender === "female" ? WOMEN_PERMANENT : MEN_PERMANENT;
  const permanent = table[`${arch}_${side}:${toothType}`];
  return permanent ? { ...chronology, permanent } : chronology;
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
    ageMonths >= info.deciduous.from &&
    ageMonths <= info.deciduous.limit + info.deciduous.limitDays / 30.4375;
  const inPermanent =
    ageMonths >= info.permanent.from &&
    ageMonths <= (info.permanent.limit ?? info.permanent.to);
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
    (event) => `${event.quadrant}:${normalizePrimaryToothType(event)}` === key,
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
