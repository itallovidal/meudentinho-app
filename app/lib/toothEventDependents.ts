import { isToothEventDateUnknown } from "@/lib/toothIdentity";
import type { ToothEvent } from "@/types/teeth";

function lifecycleStage(event: ToothEvent): number {
  return (
    (event.dentition === "permanent" ? 2 : 0) +
    (event.eventType === "exfoliation" ? 1 : 0)
  );
}

export function getToothEventDependents(
  event: ToothEvent | null,
  events: ToothEvent[],
): ToothEvent[] {
  if (!event) return [];
  const independentPermanent = events.some(
    (other) =>
      other.quadrant === event.quadrant &&
      other.toothType === event.toothType &&
      other.dentition === "permanent" &&
      other.eventType === "eruption" &&
      (other.historyIncomplete || isToothEventDateUnknown(other)),
  );
  return events.filter(
    (other) =>
      other.id !== event.id &&
      other.kidId === event.kidId &&
      other.parentId === event.parentId &&
      other.quadrant === event.quadrant &&
      other.toothType === event.toothType &&
      (!(
        event.toothType === "first_molar" || event.toothType === "second_molar"
      ) ||
        other.dentition === event.dentition) &&
      !(
        event.dentition === "primary" &&
        other.dentition === "permanent" &&
        independentPermanent
      ) &&
      lifecycleStage(other) > lifecycleStage(event),
  );
}
