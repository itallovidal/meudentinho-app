import {
  buildToothPredictions,
  formatPredictionWindow,
} from "@/lib/toothPredictions";
import {
  buildToothMilestones,
  partitionToothAlerts,
} from "@/lib/toothMilestones";

function upperIncisor(reference: string) {
  return buildToothPredictions(
    "2018-09-01",
    [],
    "male",
    new Date(reference),
  ).find(
    (item) =>
      item.toothType === "central_incisor" &&
      item.arch === "upper" &&
      item.dentition === "permanent",
  );
}

it.each([
  ["2026-09-01T23:59:59-03:00", "current"],
  ["2026-09-02T00:00:00-03:00", "tolerance"],
  ["2027-03-01T23:59:59-03:00", "tolerance"],
  ["2027-03-02T00:00:00-03:00", undefined],
])("presents the permanent range and limit on %s", (reference, status) => {
  expect(upperIncisor(reference)?.status).toBe(status);
});

it("does not advance review alerts into the tolerance period", () => {
  const referenceDate = new Date("2026-09-02T00:00:00-03:00");
  const milestones = buildToothMilestones({
    kidId: "kid",
    birthDate: "2018-09-01",
    events: [],
    gender: "male",
    referenceDate,
  });
  const milestone = milestones.find(
    (item) =>
      item.quadrant === "upper_right" &&
      item.toothType === "central_incisor" &&
      item.dentition === "permanent",
  )!;
  expect(milestone.status).toBe("current");
  expect(milestone.inTolerance).toBe(true);
  expect(partitionToothAlerts([milestone], [], referenceDate).active).toEqual(
    [],
  );
  const after = new Date("2027-03-02T00:00:00-03:00");
  const overdue = buildToothMilestones({
    kidId: "kid",
    birthDate: "2018-09-01",
    events: [],
    gender: "male",
    referenceDate: after,
  }).find((item) => item.id === milestone.id)!;
  expect(partitionToothAlerts([overdue], [], after).active).toEqual([overdue]);
});

it("orders current, tolerance and upcoming predictions before the card slice", () => {
  const items = buildToothPredictions(
    "2018-09-01",
    [],
    "male",
    new Date("2026-10-27T12:00:00-03:00"),
  );
  const statuses = items.map((item) => item.status);
  expect(new Set(statuses)).toEqual(
    new Set(["current", "tolerance", "upcoming"]),
  );
  expect(statuses.lastIndexOf("current")).toBeLessThan(
    statuses.indexOf("tolerance"),
  );
  expect(statuses.lastIndexOf("tolerance")).toBeLessThan(
    statuses.indexOf("upcoming"),
  );
  const limits = items
    .filter((item) => item.status === "tolerance")
    .map((item) => item.limitDate);
  expect(limits).toEqual([...limits].sort());
  expect(
    items.slice(0, 3).filter((item) => item.status === "current"),
  ).toHaveLength(
    Math.min(3, items.filter((item) => item.status === "current").length),
  );
});

it("keeps deciduous windows current through their final limit day", () => {
  const items = buildToothPredictions(
    "2025-01-31",
    [],
    "male",
    new Date("2026-06-06T23:59:59-03:00"),
  );
  const primary = items.find(
    (item) =>
      item.arch === "upper" &&
      item.toothType === "central_incisor" &&
      item.dentition === "primary",
  )!;
  expect(primary.status).toBe("current");
  expect(primary.windowEnd).toBe(primary.limitDate);
});

it("distinguishes both dentitions and names primary premolar predecessors", () => {
  const items = buildToothPredictions(
    "2025-01-31",
    [],
    "male",
    new Date("2025-11-30T12:00:00-03:00"),
  );
  expect(
    items.find(
      (item) =>
        item.arch === "upper" &&
        item.toothType === "central_incisor" &&
        item.dentition === "primary",
    )?.title,
  ).toBe("Incisivo Central Superior (de leite)");
  expect(
    items.find(
      (item) =>
        item.arch === "upper" &&
        item.toothType === "central_incisor" &&
        item.dentition === "permanent",
    )?.title,
  ).toBe("Incisivo Central Superior (permanente)");
  expect(
    items.find(
      (item) =>
        item.arch === "upper" &&
        item.toothType === "first_premolar" &&
        item.dentition === "primary",
    )?.title,
  ).toBe("Primeiro Molar Superior (de leite)");
});

it.each([
  ["2027-10-05", "2027-10-05", "5 de outubro de 2027"],
  ["2027-10-05", "2027-10-07", "5 a 7 de outubro de 2027"],
  ["2025-09-28", "2025-10-03", "28 de setembro a 3 de outubro de 2025"],
  ["2026-12-28", "2027-01-03", "28 de dezembro de 2026 a 3 de janeiro de 2027"],
])("includes a non-current year for %s to %s", (start, end, expected) => {
  expect(
    formatPredictionWindow(start, end, new Date("2026-10-27T00:00:00-03:00")),
  ).toBe(expected);
});

it("uses the supplied reference year across New Year's midnight", () => {
  expect(
    formatPredictionWindow(
      "2027-01-01",
      "2027-01-02",
      new Date("2026-12-31T23:59:59-03:00"),
    ),
  ).toBe("1 a 2 de janeiro de 2027");
  expect(
    formatPredictionWindow(
      "2027-01-01",
      "2027-01-02",
      new Date("2027-01-01T00:00:00-03:00"),
    ),
  ).toBe("1 a 2 de janeiro");
});
