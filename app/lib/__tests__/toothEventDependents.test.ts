import { getToothEventDependents } from "@/lib/toothEventDependents";
import type { ToothEvent } from "@/types/teeth";
const primary: ToothEvent = {
  id: "primary",
  parentId: "parent",
  kidId: "kid",
  toothType: "central_incisor",
  quadrant: "upper_right",
  arch: "upper",
  side: "right",
  dentition: "primary",
  eventType: "eruption",
  occurrenceDate: "2026-01-01",
  createdAt: "",
  updatedAt: "",
};
const permanent: ToothEvent = {
  ...primary,
  id: "permanent",
  dentition: "permanent",
};
it("preserves explicitly independent permanent evidence when deleting primary history", () => {
  const independent = { ...permanent, historyIncomplete: true };
  const loss: ToothEvent = {
    ...permanent,
    id: "loss",
    eventType: "exfoliation",
  };
  expect(getToothEventDependents(primary, [independent, loss])).toEqual([]);
  expect(getToothEventDependents(independent, [independent, loss])).toEqual([
    loss,
  ]);
});
it("keeps the original cascade for a documented linked cycle", () => {
  expect(getToothEventDependents(primary, [permanent])).toEqual([permanent]);
});
