import {
  buildToothMilestones,
  partitionToothAlerts,
  dateAtDentalAge,
} from "@/lib/toothMilestones";
import {
  buildToothPredictions,
  buildPredictionCalendarMarks,
} from "@/lib/toothPredictions";
import type { ToothEvent } from "@/types/teeth";

function event(overrides: Partial<ToothEvent> = {}): ToothEvent {
  return {
    id: "event",
    parentId: "parent",
    kidId: "kid",
    occurrenceDate: "2026-05-01T12:00:00Z",
    dentition: "primary",
    arch: "upper",
    side: "right",
    toothType: "central_incisor",
    eventType: "eruption",
    quadrant: "upper_right",
    createdAt: "2026-05-01T12:00:00Z",
    updatedAt: "2026-05-01T12:00:00Z",
    ...overrides,
  };
}
function evaluate(
  reference = "2026-06-07T12:00:00-03:00",
  events: ToothEvent[] = [],
  trackingStartedAt?: string,
) {
  return buildToothMilestones({
    kidId: "kid",
    birthDate: "2025-01-31",
    events,
    gender: "male",
    referenceDate: new Date(reference),
    trackingStartedAt,
  });
}
function upperPrimary(milestones: ReturnType<typeof evaluate>) {
  return milestones.find(
    (item) =>
      item.quadrant === "upper_right" &&
      item.toothType === "central_incisor" &&
      item.dentition === "primary",
  )!;
}

it("retains missing registrations after the last limit day", () => {
  const at = upperPrimary(evaluate("2026-06-06T23:59:59-03:00"));
  const after = upperPrimary(evaluate("2026-06-07T00:00:00-03:00"));
  expect(at.status).toBe("current");
  expect(at.limitDate).toBe("2026-06-06");
  expect(after.status).toBe("overdue");
  expect(after.id).toBe(at.id);
});

it("keeps calendar months and end-of-month clamping", () => {
  expect(dateAtDentalAge(new Date(2024, 1, 29), 12)).toEqual(
    new Date(2025, 1, 28),
  );
});

it("resolves only the side and dentition with evidence", () => {
  const milestones = evaluate(undefined, [event()]);
  expect(upperPrimary(milestones).status).toBe("recorded");
  expect(
    milestones.find(
      (item) =>
        item.quadrant === "upper_left" &&
        item.toothType === "central_incisor" &&
        item.dentition === "primary",
    )?.status,
  ).toBe("overdue");
  expect(
    milestones.find(
      (item) =>
        item.quadrant === "upper_right" &&
        item.toothType === "central_incisor" &&
        item.dentition === "permanent",
    )?.status,
  ).toBe("upcoming");
});

it("distinguishes undated confirmation and never paints it as a dated birth", () => {
  const observation = event({
    occurrenceDate: "",
    recordKind: "presence",
    confirmedAt: "2026-06-07T12:00:00Z",
  });
  expect(upperPrimary(evaluate(undefined, [observation])).status).toBe(
    "covered",
  );
  expect(buildPredictionCalendarMarks([], [observation])).toEqual({});
});

it("uses later evidence without inventing an eruption date", () => {
  expect(
    upperPrimary(evaluate(undefined, [event({ eventType: "exfoliation" })]))
      .status,
  ).toBe("covered");
});

it("separates missing history before tracking started from current alerts", () => {
  const reference = new Date("2026-06-07T12:00:00-03:00");
  const recent = evaluate(undefined, [], "2025-02-01T12:00:00Z");
  const late = evaluate(undefined, [], "2026-06-07T12:00:00Z");
  expect(
    partitionToothAlerts(recent, [], reference).active.some(
      (item) => item.id === upperPrimary(recent).id,
    ),
  ).toBe(true);
  expect(
    partitionToothAlerts(late, [], reference).historical.some(
      (item) => item.id === upperPrimary(late).id,
    ),
  ).toBe(true);
});

it("keeps primary history out of the main warning once its permanent phase starts", () => {
  const milestones = buildToothMilestones({
    kidId: "kid",
    birthDate: "2018-01-01",
    events: [],
    gender: "male",
    referenceDate: new Date("2026-06-07T12:00:00Z"),
  });
  const groups = partitionToothAlerts(
    milestones,
    [],
    new Date("2026-06-07T12:00:00Z"),
  );
  expect(groups.active.every((item) => item.dentition === "permanent")).toBe(
    true,
  );
  expect(groups.historical.some((item) => item.dentition === "primary")).toBe(
    true,
  );
});

it("keeps snoozed items in the list and reactivates only unresolved ones at expiration", () => {
  const milestones = evaluate();
  const snoozes = [
    { id: upperPrimary(milestones).id, snoozedUntil: "2026-06-14T12:00:00Z" },
  ];
  expect(
    partitionToothAlerts(milestones, snoozes, new Date("2026-06-14T11:59:59Z"))
      .snoozed,
  ).toContainEqual(upperPrimary(milestones));
  expect(
    partitionToothAlerts(milestones, snoozes, new Date("2026-06-14T12:00:00Z"))
      .active,
  ).toContainEqual(upperPrimary(milestones));
  const resolved = evaluate(undefined, [event()]);
  expect(
    partitionToothAlerts(
      resolved,
      snoozes,
      new Date("2026-06-15T12:00:00Z"),
    ).active.some((item) => item.id === upperPrimary(resolved).id),
  ).toBe(false);
});

it("does not turn third molars into automatic alerts even for adults", () => {
  const milestones = buildToothMilestones({
    kidId: "kid",
    birthDate: "1980-01-01",
    events: [],
    gender: "male",
    referenceDate: new Date("2026-06-07T12:00:00Z"),
  });
  expect(
    milestones
      .filter((item) => item.toothType === "third_molar")
      .every((item) => item.limitDate === null && item.status !== "overdue"),
  ).toBe(true);
});

it("does not merge sex-specific sides with different limits", () => {
  const referenceDate = new Date("2026-10-22T12:00:00-03:00");
  const milestones = buildToothMilestones({
    kidId: "kid",
    birthDate: "2012-07-01",
    gender: "female",
    events: [],
    referenceDate,
  });
  const molars = milestones.filter(
    (item) => item.arch === "upper" && item.toothType === "second_molar",
  );
  expect(molars.find((item) => item.side === "right")?.status).toBe("overdue");
  expect(molars.find((item) => item.side === "left")?.status).toBe("current");
  expect(
    buildToothPredictions("2012-07-01", [], "female", referenceDate).find(
      (item) => item.arch === "upper" && item.toothType === "second_molar",
    )?.sides,
  ).toEqual(["left"]);
});

it("projects legacy primary molars to the predecessor position without covering permanent molars", () => {
  const milestones = evaluate(undefined, [event({ toothType: "first_molar" })]);
  expect(
    milestones.find(
      (item) =>
        item.quadrant === "upper_right" &&
        item.toothType === "first_premolar" &&
        item.dentition === "primary",
    )?.status,
  ).toBe("recorded");
  expect(
    milestones.find(
      (item) =>
        item.quadrant === "upper_right" &&
        item.toothType === "first_molar" &&
        item.dentition === "permanent",
    )?.status,
  ).toBe("upcoming");
});

it.each([null, "", "invalid", "2025-02-30", "2030-01-01"])(
  "rejects unusable birth date %s",
  (birthDate) => {
    expect(
      buildToothMilestones({
        kidId: "kid",
        birthDate,
        events: [],
        referenceDate: new Date("2026-06-07T12:00:00Z"),
      }),
    ).toEqual([]);
  },
);

it("uses the local day of enrollment when separating old history", () => {
  const milestones = evaluate(undefined, [], "2026-06-07T01:00:00Z");
  expect(upperPrimary(milestones).historical).toBe(false);
});

it("does not keep third molars in the active eruption period beyond their reference range", () => {
  const milestones = buildToothMilestones({
    kidId: "kid",
    birthDate: "1980-01-01",
    events: [],
    gender: "male",
    referenceDate: new Date("2026-06-07T12:00:00Z"),
  });
  const thirdMolars = milestones.filter(
    (item) => item.toothType === "third_molar",
  );
  expect(thirdMolars).toHaveLength(4);
  expect(thirdMolars.every((item) => item.status === "outside_reference")).toBe(
    true,
  );
});

it.each(["eruption", "exfoliation"] as const)(
  "covers an undated %s without calendar marks on confirmation day",
  (eventType) => {
    const undated = event({
      recordKind: "undated",
      eventType,
      occurrenceDate: "",
      confirmedAt: "2026-06-07T12:00:00Z",
    });
    expect(upperPrimary(evaluate(undefined, [undated])).status).toBe("covered");
    const marks = buildPredictionCalendarMarks([], [undated]);
    expect(Object.values(marks).some((mark) => mark.registered)).toBe(false);
    expect(marks[""]).toBeUndefined();
    expect(marks["2026-06-07"]).toBeUndefined();
  },
);
