import type { Dentition, ToothEvent, ToothType } from "@/types/teeth";

export function normalizePrimaryToothType(event: {
  toothType: ToothType;
  dentition: Dentition;
}): ToothType {
  if (event.dentition === "primary") {
    if (event.toothType === "first_molar") return "first_premolar";
    if (event.toothType === "second_molar") return "second_premolar";
  }
  return event.toothType;
}

export function toothEventReferenceDate(event: ToothEvent): string {
  return isToothEventDateUnknown(event)
    ? (event.confirmedAt ?? event.createdAt)
    : event.occurrenceDate;
}

export function isToothEventDateUnknown(event: {
  recordKind?: ToothEvent["recordKind"];
}): boolean {
  return event.recordKind === "presence" || event.recordKind === "undated";
}

export function compareToothEventProgress(
  left: ToothEvent,
  right: ToothEvent,
): number {
  const leftStage =
    (left.dentition === "permanent" ? 2 : 0) +
    (left.eventType === "exfoliation" ? 1 : 0);
  const rightStage =
    (right.dentition === "permanent" ? 2 : 0) +
    (right.eventType === "exfoliation" ? 1 : 0);
  return (
    leftStage - rightStage ||
    toothEventReferenceDate(left).localeCompare(toothEventReferenceDate(right))
  );
}
