import {
  compareToothEventProgress,
  toothEventReferenceDate,
} from "@/lib/toothIdentity";
import { toothEventAccessibilityLabel } from "@/lib/teethLabels";
import type { ToothEvent } from "@/types/teeth";

const birth: ToothEvent = {
  id: "birth",
  kidId: "kid",
  parentId: "parent",
  toothType: "central_incisor",
  arch: "upper",
  side: "right",
  quadrant: "upper_right",
  dentition: "primary",
  eventType: "eruption",
  occurrenceDate: "2026-10-01T12:00:00Z",
  createdAt: "2026-10-02T12:00:00Z",
  updatedAt: "2026-10-02T12:00:00Z",
};
const loss: ToothEvent = {
  ...birth,
  id: "loss",
  eventType: "exfoliation",
  recordKind: "undated",
  occurrenceDate: "",
  confirmedAt: "2026-10-03T12:00:00Z",
};

it("shows the loss as the current stage even though it has no occurrence date", () => {
  expect(compareToothEventProgress(loss, birth)).toBeGreaterThan(0);
  expect(compareToothEventProgress(birth, loss)).toBeLessThan(0);
  expect(
    compareToothEventProgress({ ...birth, dentition: "permanent" }, loss),
  ).toBeGreaterThan(0);
});

it("uses confirmation only as the history reference date for an undated loss", () => {
  expect(toothEventReferenceDate(loss)).toBe(loss.confirmedAt);
  expect(toothEventReferenceDate(birth)).toBe(birth.occurrenceDate);
});

it("announces a loss without a date instead of a confirmed birth", () => {
  const label = toothEventAccessibilityLabel(loss);
  expect(label).toContain("caiu");
  expect(label).toContain("data não informada");
  expect(label).not.toContain("nascimento confirmado");
  expect(label).not.toContain("null");
});
