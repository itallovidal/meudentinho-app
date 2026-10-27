import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { getChronology } from "@/lib/toothChronology";
import { buildToothPredictions } from "@/lib/toothPredictions";

describe("PDF eruption reference", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-17T12:00:00-03:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("preserves male limits that differ between quadrants", () => {
    expect(
      getChronology("upper", "first_molar", "right", "male")?.permanent.limit,
    ).toBe(86);
    expect(
      getChronology("upper", "first_molar", "left", "male")?.permanent.limit,
    ).toBe(95);
    expect(
      getChronology("lower", "first_molar", "left", "male")?.permanent.limit,
    ).toBe(95);
    expect(
      getChronology("lower", "first_molar", "right", "male")?.permanent.limit,
    ).toBe(84);
  });

  it("uses female lower-right limits from the reference", () => {
    expect(
      getChronology("lower", "first_premolar", "right", "female")?.permanent
        .limit,
    ).toBe(139);
    expect(
      getChronology("lower", "first_molar", "right", "female")?.permanent.limit,
    ).toBe(90);
  });

  it("preserves the primary age range and exact limit days", () => {
    expect(getChronology("lower", "central_incisor")?.deciduous).toEqual({
      from: 6,
      to: 8,
      limit: 14,
      limitDays: 24,
    });
    expect(getChronology("upper", "first_premolar")?.deciduous).toEqual({
      from: 18,
      to: 18,
      limit: 23,
      limitDays: 5,
    });
  });

  it("does not invent a limit where the source marks X", () => {
    expect(
      getChronology("upper", "third_molar", "right", "male")?.permanent,
    ).toEqual({
      from: 204,
      to: 360,
      limit: null,
    });
  });

  it("predicts the primary predecessor at the premolar position and keeps molars permanent-only", () => {
    jest.setSystemTime(new Date("2026-10-22T12:00:00-03:00"));
    const predictions = buildToothPredictions("2025-04-22", [], "male");
    expect(
      predictions.filter(
        (item) =>
          item.dentition === "primary" && item.toothType === "first_premolar",
      ),
    ).toHaveLength(2);
    expect(
      predictions.some(
        (item) =>
          item.dentition === "primary" &&
          ["first_molar", "second_molar", "third_molar"].includes(
            item.toothType,
          ),
      ),
    ).toBe(false);
    expect(getChronology("lower", "second_premolar")?.deciduous).toEqual({
      from: 28,
      to: 28,
      limit: 34,
      limitDays: 5,
    });
    expect(getChronology("upper", "first_molar")?.deciduous).toBeNull();
  });

  it("adds whole calendar months and source days to end-of-month births", () => {
    jest.setSystemTime(new Date("2025-11-30T12:00:00-03:00"));
    const prediction = buildToothPredictions("2025-01-31", [], "male").find(
      (item) =>
        item.arch === "upper" &&
        item.toothType === "central_incisor" &&
        item.dentition === "primary",
    );
    expect(prediction).toEqual(
      expect.objectContaining({
        windowStart: "2025-11-30",
        windowEnd: "2026-06-06",
        status: "current",
      }),
    );
  });

  it("keeps the exact last limit day and removes the prediction the next day", () => {
    function hasUpperPrimaryIncisor() {
      return buildToothPredictions("2025-01-31", [], "male").some(
        (item) =>
          item.arch === "upper" &&
          item.toothType === "central_incisor" &&
          item.dentition === "primary",
      );
    }
    jest.setSystemTime(new Date("2026-06-06T23:59:00-03:00"));
    expect(hasUpperPrimaryIncisor()).toBe(true);
    jest.setSystemTime(new Date("2026-06-07T00:00:00-03:00"));
    expect(hasUpperPrimaryIncisor()).toBe(false);
  });

  it("expires each side using its own sex-specific limit", () => {
    const male = buildToothPredictions("2019-06-17", [], "male").find(
      (item) =>
        item.arch === "upper" &&
        item.toothType === "first_molar" &&
        item.dentition === "permanent",
    );
    expect(male?.sides).toEqual(["left"]);
    const female = buildToothPredictions("2019-06-17", [], "female").find(
      (item) =>
        item.arch === "upper" &&
        item.toothType === "first_molar" &&
        item.dentition === "permanent",
    );
    expect(female).toBeUndefined();
  });

  it("starts the permanent period on the calendar birthday", () => {
    function status() {
      return buildToothPredictions("2019-10-17", [], "male").find(
        (item) =>
          item.arch === "upper" &&
          item.toothType === "central_incisor" &&
          item.dentition === "permanent",
      )?.status;
    }
    jest.setSystemTime(new Date("2026-10-16T12:00:00-03:00"));
    expect(status()).toBe("upcoming");
    jest.setSystemTime(new Date("2026-10-17T00:00:00-03:00"));
    expect(status()).toBe("current");
  });
});
