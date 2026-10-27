import { isToothEventDateUnknown } from "@/lib/toothIdentity";
import { normalizePrimaryToothType } from "@/lib/toothIdentity";
import { getChronology, type ChronologyGender } from "@/lib/toothChronology";
import {
  calendarAgeInMonths,
  parseLocalDate,
  toLocalDateKey,
} from "@/lib/utils";
import type {
  Arch,
  Dentition,
  Quadrant,
  Side,
  ToothEvent,
  ToothType,
} from "@/types/teeth";

export const CHRONOLOGY_VERSION = "2026-10-calendar-v1";
export const TOOTH_TYPES: ToothType[] = [
  "central_incisor",
  "lateral_incisor",
  "canine",
  "first_premolar",
  "second_premolar",
  "first_molar",
  "second_molar",
  "third_molar",
];
export type ToothMilestoneStatus =
  | "upcoming"
  | "current"
  | "overdue"
  | "recorded"
  | "covered"
  | "outside_reference";

export interface ToothMilestone {
  id: string;
  kidId: string;
  quadrant: Quadrant;
  toothType: ToothType;
  arch: Arch;
  side: Side;
  dentition: Dentition;
  status: ToothMilestoneStatus;
  windowStart: string;
  expectedEnd: string;
  limitDate: string | null;
  inTolerance: boolean;
  historical: boolean;
  chronologyVersion: string;
}

export interface ToothAlertSnooze {
  id: string;
  snoozedUntil: string;
}

export function dateAtDentalAge(birth: Date, months: number, days = 0): Date {
  const target = new Date(birth.getFullYear(), birth.getMonth() + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  return new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(birth.getDate(), lastDay) + days,
  );
}

export function toothMilestoneId(
  kidId: string,
  toothType: ToothType,
  quadrant: Quadrant,
  dentition: Dentition,
): string {
  return `${kidId}|${toothType}|${quadrant}|${dentition}|eruption`;
}

export function buildToothMilestones({
  kidId,
  birthDate,
  events,
  gender = null,
  prematureWeeks = null,
  referenceDate,
  trackingStartedAt = null,
}: {
  kidId: string;
  birthDate: string | null;
  events: ToothEvent[];
  gender?: ChronologyGender | null;
  prematureWeeks?: string | number | null;
  referenceDate: Date;
  trackingStartedAt?: string | null;
}): ToothMilestone[] {
  const birth = birthDate ? parseLocalDate(birthDate) : null;
  if (!birth || !Number.isFinite(referenceDate.getTime())) return [];
  const today = toLocalDateKey(referenceDate);
  if (toLocalDateKey(birth) > today) return [];
  // Idade corrigida (prematuridade): apoio ao desenvolvimento nos primeiros 24
  // meses cronológicos. Estima-se em semanas (termo de 40 semanas) e desloca a
  // data efetiva de nascimento. Não altera a data real nem as decisões de #32.
  // Sem protocolo odontopediátrico aprovado, usa-se a orientação geral da AAP
  // (idade corrigida até 2 anos); ver ADR dependent-registration.md.
  if (gender !== "male" && gender !== "female") return [];
  const effectiveBirth = correctedBirthDate(birth, prematureWeeks, referenceDate);
  const trackingDate = trackingStartedAt ? new Date(trackingStartedAt) : null;
  const trackingKey =
    trackingDate && Number.isFinite(trackingDate.getTime())
      ? toLocalDateKey(trackingDate)
      : null;
  const evidence = new Map<string, ToothEvent[]>();
  for (const event of events) {
    const key = `${event.quadrant}:${normalizePrimaryToothType(event)}:${event.dentition}`;
    const mine = evidence.get(key) ?? [];
    mine.push(event);
    evidence.set(key, mine);
  }
  const result: ToothMilestone[] = [];
  for (const arch of ["upper", "lower"] as const) {
    for (const toothType of TOOTH_TYPES) {
      for (const side of ["right", "left"] as const) {
        const info = getChronology(arch, toothType, side, gender);
        if (!info) continue;
        const quadrant: Quadrant = `${arch}_${side}`;
        for (const dentition of ["primary", "permanent"] as const) {
          const range =
            dentition === "primary" ? info.deciduous : info.permanent;
          if (!range) continue;
          const days =
            dentition === "primary" ? (info.deciduous?.limitDays ?? 0) : 0;
          const windowStart = toLocalDateKey(
            dateAtDentalAge(effectiveBirth, range.from),
          );
          const expectedEnd = toLocalDateKey(
            dateAtDentalAge(
              effectiveBirth,
              dentition === "primary" ? (range.limit ?? range.to) : range.to,
              days,
            ),
          );
          const limitDate =
            toothType === "third_molar" || range.limit === null
              ? null
              : toLocalDateKey(dateAtDentalAge(effectiveBirth, range.limit, days));
          const mine =
            evidence.get(`${quadrant}:${toothType}:${dentition}`) ?? [];
          const eruption = mine.find((event) => event.eventType === "eruption");
          let status: ToothMilestoneStatus;
          if (eruption)
            status = isToothEventDateUnknown(eruption) ? "covered" : "recorded";
          else if (mine.some((event) => event.eventType === "exfoliation"))
            status = "covered";
          else if (limitDate && today > limitDate) status = "overdue";
          else if (!limitDate && today > expectedEnd)
            status = "outside_reference";
          else status = today < windowStart ? "upcoming" : "current";
          const primaryPastPhase =
            dentition === "primary" &&
            today >=
              toLocalDateKey(
                dateAtDentalAge(
                  effectiveBirth,
                  getChronology(arch, "first_molar", side, gender)?.permanent
                    .from ?? info.permanent.from,
                ),
              );
          const historical =
            status === "overdue" &&
            (primaryPastPhase ||
              !!(trackingKey && limitDate && limitDate < trackingKey));
          result.push({
            id: toothMilestoneId(kidId, toothType, quadrant, dentition),
            kidId,
            quadrant,
            toothType,
            arch,
            side,
            dentition,
            status,
            windowStart,
            expectedEnd,
            limitDate,
            inTolerance:
              today > expectedEnd && !!limitDate && today <= limitDate,
            historical,
            chronologyVersion: CHRONOLOGY_VERSION,
          });
        }
      }
    }
  }
  return result;
}

export function getEruptionPositions(
  milestones: ToothMilestone[],
): Map<string, ToothMilestone> {
  const permanentRecorded = new Set(
    milestones
      .filter(
        (item) =>
          item.dentition === "permanent" &&
          (item.status === "recorded" || item.status === "covered"),
      )
      .map((item) => `${item.quadrant}:${item.toothType}`),
  );
  const positions = new Map<string, ToothMilestone>();
  for (const milestone of milestones) {
    const key = `${milestone.quadrant}:${milestone.toothType}`;
    if (
      milestone.status !== "current" ||
      milestone.inTolerance ||
      permanentRecorded.has(key)
    )
      continue;
    positions.set(key, milestone);
  }
  return positions;
}

export function partitionToothAlerts(
  milestones: ToothMilestone[],
  snoozes: ToothAlertSnooze[],
  referenceDate: Date,
) {
  const until = new Map(snoozes.map((item) => [item.id, item.snoozedUntil]));
  const active: ToothMilestone[] = [];
  const historical: ToothMilestone[] = [];
  const snoozed: ToothMilestone[] = [];
  for (const milestone of milestones) {
    if (milestone.status !== "overdue") continue;
    if (milestone.historical) historical.push(milestone);
    else if (
      new Date(until.get(milestone.id) ?? "").getTime() >
      referenceDate.getTime()
    )
      snoozed.push(milestone);
    else active.push(milestone);
  }
  return { active, historical, snoozed };
}


export function correctedBirthDate(
  birth: Date,
  prematureWeeks: string | number | null | undefined,
  referenceDate: Date,
): Date {
  const weeks =
    prematureWeeks == null
      ? NaN
      : typeof prematureWeeks === "string"
        ? Number(prematureWeeks.trim())
        : Number(prematureWeeks);
  if (!Number.isFinite(weeks) || weeks <= 0 || weeks >= 40) {
    return new Date(birth);
  }
  // idade corrigida só nos primeiros 24 meses cronológicos
  const ageMonths = calendarAgeInMonths(toLocalDateKey(birth), referenceDate);
  if (ageMonths === null || ageMonths >= 24) {
    return new Date(birth);
  }
  const corrected = new Date(birth);
  corrected.setDate(corrected.getDate() + Math.round((40 - weeks) * 7));
  return corrected;
}
