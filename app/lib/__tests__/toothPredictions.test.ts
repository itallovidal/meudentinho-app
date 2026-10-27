/// <reference types="jest" />
import {
  buildToothPredictions,
  formatPredictionWindow,
} from "@/lib/toothPredictions";
import type { ToothEvent } from "@/types/teeth";

function buildEvent(overrides: Partial<ToothEvent>): ToothEvent {
  return {
    id: "event-1",
    parentId: "parent-1",
    kidId: "kid-1",
    occurrenceDate: "2026-08-01T12:00:00.000Z",
    dentition: "primary",
    arch: "upper",
    side: "right",
    toothType: "central_incisor",
    eventType: "eruption",
    quadrant: "upper_right",
    note: undefined,
    createdAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("buildToothPredictions", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-17T12:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns nothing without a birth date", () => {
    expect(buildToothPredictions(null, [])).toEqual([]);
    expect(buildToothPredictions("", [])).toEqual([]);
    expect(buildToothPredictions("not-a-date", [])).toEqual([]);
  });

  it("marks the open window as current for both sides", () => {
    const predictions = buildToothPredictions("2025-11-01", [], "male");
    const current = predictions.find(
      (prediction) =>
        prediction.toothType === "central_incisor" &&
        prediction.arch === "upper" &&
        prediction.dentition === "primary",
    );

    expect(predictions.length).toBeGreaterThan(0);
    expect(current?.status).toBe("current");
    expect(current?.sides).toEqual(["right", "left"]);
    expect(current?.pendingSides).toBe(2);
  });

  it("drops a side once its event is registered", () => {
    const predictions = buildToothPredictions("2025-11-01", [
      buildEvent({ eventType: "eruption", dentition: "primary" }),
    ], "male");
    const prediction = predictions.find(
      (item) =>
        item.toothType === "central_incisor" &&
        item.arch === "upper" &&
        item.dentition === "primary",
    );

    expect(prediction?.pendingSides).toBe(1);
    expect(prediction?.sides).toEqual(["left"]);
  });

  it("removes the prediction once both sides are registered", () => {
    const predictions = buildToothPredictions("2025-11-01", [
      buildEvent({
        id: "right",
        eventType: "eruption",
        dentition: "primary",
        arch: "upper",
        side: "right",
        quadrant: "upper_right",
      }),
      buildEvent({
        id: "left",
        eventType: "eruption",
        dentition: "primary",
        arch: "upper",
        side: "left",
        quadrant: "upper_left",
      }),
    ]);

    expect(
      predictions.some(
        (item) =>
          item.toothType === "central_incisor" &&
          item.arch === "upper" &&
          item.dentition === "primary",
      ),
    ).toBe(false);
  });

  it("sorts predictions by the window start within each status", () => {
    const predictions = buildToothPredictions("2025-11-01", [], "male");
    for (const status of ["current", "tolerance", "upcoming"]) {
      const keys = predictions
        .filter((item) => item.status === status)
        .map((item) => item.windowStart);
      expect(keys).toEqual([...keys].sort());
    }
  });
});

describe("formatPredictionWindow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-27T12:00:00-03:00"));
  });
  afterEach(() => jest.useRealTimers());
  it("formats a single day", () => {
    expect(formatPredictionWindow("2026-10-05", "2026-10-05")).toBe(
      "5 de outubro",
    );
  });

  it("formats a range inside the same month", () => {
    expect(formatPredictionWindow("2026-10-05", "2026-10-07")).toBe(
      "5 a 7 de outubro",
    );
  });

  it("formats a range across months", () => {
    expect(formatPredictionWindow("2026-09-28", "2026-10-03")).toBe(
      "28 de setembro a 3 de outubro",
    );
  });

  it("formats a range across years", () => {
    expect(formatPredictionWindow("2026-12-28", "2027-01-03")).toBe(
      "28 de dezembro de 2026 a 3 de janeiro de 2027",
    );
  });
});
