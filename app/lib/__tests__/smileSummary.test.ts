/// <reference types="jest" />
import { buildSmileSummary } from "@/lib/smileSummary";
import type { Arch, Quadrant, Side, ToothEvent } from "@/types/teeth";

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

function buildForQuadrant(
  quadrant: Quadrant,
  toothType: ToothEvent["toothType"],
  dentition: ToothEvent["dentition"],
  eventType: ToothEvent["eventType"],
  id: string,
): ToothEvent {
  return buildEvent({
    id,
    quadrant,
    toothType,
    dentition,
    eventType,
    arch: (quadrant.startsWith("upper") ? "upper" : "lower") as Arch,
    side: (quadrant.endsWith("right") ? "right" : "left") as Side,
  });
}

describe("buildSmileSummary", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-17T12:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("counts nothing without a birth date and without events", () => {
    expect(buildSmileSummary(null, [])).toEqual({
      bornPermanent: 0,
      bornMilk: 0,
      fell: 0,
      eruptionWindow: 0,
      registered: 0,
    });
  });

  it("counts milk, permanent and exchanged teeth", () => {
    const events = [
      ...(
        ["upper_right", "upper_left", "lower_right", "lower_left"] as Quadrant[]
      ).map((quadrant, index) =>
        buildForQuadrant(
          quadrant,
          "lateral_incisor",
          "primary",
          "eruption",
          `milk-${index}`,
        ),
      ),
      buildForQuadrant(
        "upper_right",
        "central_incisor",
        "primary",
        "exfoliation",
        "fell-1",
      ),
      buildForQuadrant(
        "lower_right",
        "central_incisor",
        "permanent",
        "eruption",
        "permanent-1",
      ),
      buildForQuadrant(
        "lower_left",
        "central_incisor",
        "permanent",
        "eruption",
        "permanent-2",
      ),
    ];

    const summary = buildSmileSummary("2021-10-17", events, "male");

    expect(summary.registered).toBe(7);
    expect(summary.bornMilk).toBe(4);
    expect(summary.fell).toBe(1);
    expect(summary.bornPermanent).toBe(2);
  });

  it("ignores a milk eruption replaced by a permanent one", () => {
    const events = [
      buildForQuadrant(
        "upper_right",
        "central_incisor",
        "primary",
        "eruption",
        "milk-1",
      ),
      buildForQuadrant(
        "upper_right",
        "central_incisor",
        "permanent",
        "eruption",
        "permanent-1",
      ),
    ];

    const summary = buildSmileSummary("2021-10-17", events, "male");

    expect(summary.registered).toBe(1);
    expect(summary.bornMilk).toBe(0);
    expect(summary.bornPermanent).toBe(1);
  });

  it("counts unregistered teeth inside the eruption window as upcoming", () => {
    const summary = buildSmileSummary("2026-02-17", [], "male");

    expect(summary.registered).toBe(0);
    expect(summary.eruptionWindow).toBeGreaterThan(0);
    expect(summary.eruptionWindow).toBeLessThan(32);
  });

  it("does not count unregistered teeth outside the eruption window", () => {
    const summary = buildSmileSummary("2026-10-01", [], "male");

    expect(summary.eruptionWindow).toBe(0);
  });
});
