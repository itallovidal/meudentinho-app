import type { ToothEvent, ToothType } from "@/types/teeth";

const ERUPTION_SEQUENCE: ToothType[] = [
  "central_incisor",
  "lateral_incisor",
  "first_molar",
  "canine",
  "second_molar",
];

export function nextExpectedTooth(events: ToothEvent[]): ToothType | null {
  const erupted = new Set(
    events
      .filter((event) => event.eventType === "eruption")
      .map((event) => event.toothType),
  );
  return ERUPTION_SEQUENCE.find((toothType) => !erupted.has(toothType)) ?? null;
}
