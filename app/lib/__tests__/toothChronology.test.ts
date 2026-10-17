/// <reference types="jest" />
import {
  expectedDentition,
  isInEruptionWindow,
  pendingMilkStep,
  toothState,
} from "@/lib/toothChronology";
import type { ToothEvent } from "@/types/teeth";

function buildEvent(overrides: Partial<ToothEvent>): ToothEvent {
  return {
    id: "event-1",
    parentId: "parent-1",
    kidId: "kid-1",
    occurrenceDate: "2026-10-01T12:00:00.000Z",
    dentition: "primary",
    arch: "upper",
    side: "right",
    toothType: "central_incisor",
    eventType: "eruption",
    quadrant: "upper_right",
    note: undefined,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("toothState", () => {
  const position = {
    toothType: "central_incisor" as const,
    arch: "upper" as const,
    side: "right" as const,
  };

  it("is unregistered without events", () => {
    expect(toothState(position, [])).toBe("unregistered");
  });

  it("tracks milk eruption, permanent eruption and fall", () => {
    expect(
      toothState(position, [
        buildEvent({ eventType: "eruption", dentition: "primary" }),
      ]),
    ).toBe("bornMilk");
    expect(
      toothState(position, [
        buildEvent({ eventType: "eruption", dentition: "permanent" }),
      ]),
    ).toBe("bornPermanent");
    expect(
      toothState(position, [
        buildEvent({ eventType: "exfoliation", dentition: "primary" }),
      ]),
    ).toBe("fell");
  });

  it("resolves to the highest stage when events mix", () => {
    expect(
      toothState(position, [
        buildEvent({ id: "a", eventType: "exfoliation" }),
        buildEvent({ id: "b", eventType: "eruption", dentition: "permanent" }),
      ]),
    ).toBe("bornPermanent");
    expect(
      toothState(position, [
        buildEvent({ id: "a", eventType: "eruption" }),
        buildEvent({ id: "b", eventType: "exfoliation" }),
      ]),
    ).toBe("fell");
  });

  it("ignores events from other teeth", () => {
    expect(
      toothState(position, [
        buildEvent({ quadrant: "upper_left", side: "left" }),
        buildEvent({ toothType: "lateral_incisor" }),
      ]),
    ).toBe("unregistered");
  });
});

describe("pendingMilkStep", () => {
  it("asks for the milk eruption first", () => {
    expect(
      pendingMilkStep("upper", "upper_right", "central_incisor", []),
    ).toBe("eruption");
  });

  it("asks for the fall after the milk eruption", () => {
    expect(
      pendingMilkStep("upper", "upper_right", "central_incisor", [
        buildEvent({ eventType: "eruption", dentition: "primary" }),
      ]),
    ).toBe("exfoliation");
  });

  it("has nothing pending once both milk events exist", () => {
    expect(
      pendingMilkStep("upper", "upper_right", "central_incisor", [
        buildEvent({ id: "a", eventType: "eruption", dentition: "primary" }),
        buildEvent({ id: "b", eventType: "exfoliation", dentition: "primary" }),
      ]),
    ).toBeNull();
  });

  it("has no milk step for teeth without a milk form", () => {
    expect(pendingMilkStep("upper", "upper_right", "third_molar", [])).toBeNull();
  });

  it("counts only the events of the requested quadrant", () => {
    expect(
      pendingMilkStep("upper", "upper_right", "central_incisor", [
        buildEvent({ quadrant: "upper_left", side: "left" }),
      ]),
    ).toBe("eruption");
  });
});

describe("expectedDentition", () => {
  it("is permanent for teeth without a milk form", () => {
    expect(expectedDentition("third_molar", "upper", 10)).toBe("permanent");
  });

  it("switches to permanent after the window", () => {
    expect(expectedDentition("central_incisor", "upper", 10)).toBe("primary");
    expect(expectedDentition("central_incisor", "upper", 84)).toBe("permanent");
  });

  it("stays primary when the age is unknown", () => {
    expect(expectedDentition("central_incisor", "upper", null)).toBe("primary");
  });
});

describe("isInEruptionWindow", () => {
  it("detects the milk and the permanent windows", () => {
    expect(isInEruptionWindow("upper", "central_incisor", 12)).toBe(true);
    expect(isInEruptionWindow("upper", "central_incisor", 90)).toBe(true);
    expect(isInEruptionWindow("upper", "central_incisor", 20)).toBe(false);
  });

  it("applies the women override for the lower molars", () => {
    expect(isInEruptionWindow("upper", "first_molar", 86, "right", "female")).toBe(
      false,
    );
    expect(isInEruptionWindow("upper", "first_molar", 86, "right", null)).toBe(
      true,
    );
    expect(isInEruptionWindow("upper", "first_molar", 85, "right", "female")).toBe(
      true,
    );
  });

  it("returns false for unknown ages", () => {
    expect(isInEruptionWindow("upper", "central_incisor", null)).toBe(false);
  });
});
