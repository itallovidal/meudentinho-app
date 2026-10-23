/// <reference types="jest" />
import {
  buildHistoryReportHtml,
  filterEventsByPeriod,
  isPeriodValid,
  resolveDefaultHistoryStartDate,
} from "@/lib/historyReport";
import type { ToothEvent } from "@/types/teeth";

function makeEvent(overrides: Partial<ToothEvent> = {}): ToothEvent {
  return {
    id: "event-1",
    parentId: "parent-1",
    kidId: "kid-1",
    occurrenceDate: "2026-01-05",
    dentition: "primary",
    arch: "upper",
    side: "right",
    toothType: "central_incisor",
    eventType: "eruption",
    quadrant: "upper_right",
    createdAt: "2026-01-05T12:00:00Z",
    updatedAt: "2026-01-05T12:00:00Z",
    ...overrides,
  };
}

const PERIOD = { startDate: "2026-01-05", endDate: "2026-01-10" };

describe("isPeriodValid", () => {
  it("accepts a complete and ordered period", () => {
    expect(isPeriodValid(PERIOD)).toBe(true);
    expect(
      isPeriodValid({ startDate: "2026-01-05", endDate: "2026-01-05" }),
    ).toBe(true);
  });

  it("rejects empty or inverted periods", () => {
    expect(isPeriodValid({ startDate: "", endDate: "2026-01-10" })).toBe(false);
    expect(isPeriodValid({ startDate: "2026-01-10", endDate: "" })).toBe(false);
    expect(
      isPeriodValid({ startDate: "2026-01-10", endDate: "2026-01-05" }),
    ).toBe(false);
  });
});

describe("resolveDefaultHistoryStartDate", () => {
  const today = new Date(2026, 9, 21);

  it("starts five months before today by default", () => {
    expect(resolveDefaultHistoryStartDate(null, today)).toBe("2026-05-21");
  });

  it("does not go earlier than the kid birth date", () => {
    expect(resolveDefaultHistoryStartDate("2026-08-10", today)).toBe(
      "2026-08-10",
    );
  });

  it("keeps the five month window for older kids", () => {
    expect(resolveDefaultHistoryStartDate("2024-01-10", today)).toBe(
      "2026-05-21",
    );
  });

  it("clamps the day when the target month is shorter", () => {
    expect(resolveDefaultHistoryStartDate(null, new Date(2026, 6, 31))).toBe(
      "2026-02-28",
    );
  });

  it("ignores a future birth date", () => {
    expect(resolveDefaultHistoryStartDate("2027-01-01", today)).toBe(
      "2026-05-21",
    );
  });
});

describe("filterEventsByPeriod", () => {
  it("keeps events inside the period, including its boundaries", () => {
    const events = [
      makeEvent({ id: "before", occurrenceDate: "2026-01-04" }),
      makeEvent({ id: "start", occurrenceDate: "2026-01-05T00:00:00Z" }),
      makeEvent({ id: "end", occurrenceDate: "2026-01-10" }),
      makeEvent({ id: "after", occurrenceDate: "2026-01-11" }),
    ];

    expect(
      filterEventsByPeriod(events, PERIOD).map((event) => event.id),
    ).toEqual(["start", "end"]);
  });

  it("drops events without a valid occurrence date", () => {
    const events = [makeEvent({ occurrenceDate: "data-invalida" })];

    expect(filterEventsByPeriod(events, PERIOD)).toEqual([]);
  });

  it("returns nothing when the period is invalid", () => {
    const events = [makeEvent()];

    expect(
      filterEventsByPeriod(events, {
        startDate: "2026-02-01",
        endDate: "2026-01-01",
      }),
    ).toEqual([]);
  });
});

describe("buildHistoryReportHtml", () => {
  it("renders the report header, period and event rows", () => {
    const html = buildHistoryReportHtml({
      kidName: "Ana Lima",
      kidBirthDate: "2020-03-12",
      kidGender: "female",
      kidPrematureWeeks: "32",
      events: [
        makeEvent({
          id: "newer",
          occurrenceDate: "2026-01-10",
          eventType: "exfoliation",
          dentition: "primary",
          toothType: "central_incisor",
        }),
        makeEvent({
          id: "older",
          occurrenceDate: "2026-01-05",
          arch: "lower",
          side: "left",
          toothType: "canine",
          note: "Consulta de rotina",
        }),
      ],
      period: PERIOD,
      generatedAt: new Date(2026, 9, 21, 14, 30),
    });

    expect(html).toContain("Ana Lima");
    expect(html).toContain("12/03/2020");
    expect(html).toContain("<strong>Sexo:</strong> Feminino");
    expect(html).toContain("<strong>Prematuridade:</strong> 32 semanas");
    expect(html).toContain("05/01/2026 a 10/01/2026");
    expect(html).toContain("2 registros no período selecionado");
    expect(html).toContain("Incisivo Central");
    expect(html).toContain("Canino");
    expect(html).toContain("Superior • Direito");
    expect(html).toContain("Inferior • Esquerdo");
    expect(html).toContain("Esfoliação");
    expect(html).toContain("Erupção");
    expect(html).toContain("Consulta de rotina");
    expect(html.indexOf("05/01/2026")).toBeLessThan(
      html.lastIndexOf("10/01/2026"),
    );
  });

  it("shows male and non-premature information", () => {
    const html = buildHistoryReportHtml({
      kidName: "Lucas Lima",
      kidBirthDate: null,
      kidGender: "male",
      kidPrematureWeeks: "0",
      events: [],
      period: PERIOD,
    });

    expect(html).toContain("<strong>Sexo:</strong> Masculino");
    expect(html).toContain("<strong>Prematuridade:</strong> Não");
  });

  it("escapes user provided content", () => {
    const html = buildHistoryReportHtml({
      kidName: "<Ana & Lima>",
      kidBirthDate: null,
      kidGender: "male",
      events: [makeEvent({ note: '<script>alert("x")</script>' })],
      period: PERIOD,
    });

    expect(html).toContain("&lt;Ana &amp; Lima&gt;");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).not.toContain('<script>alert("x")</script>');
  });

  it("shows a placeholder when the period has no events", () => {
    const html = buildHistoryReportHtml({
      kidName: "Ana Lima",
      kidBirthDate: null,
      kidGender: "female",
      events: [],
      period: PERIOD,
    });

    expect(html).toContain("Nenhum registro encontrado neste período.");
    expect(html).toContain("0 registros no período selecionado");
    expect(html).toContain("<strong>Prematuridade:</strong> Não");
  });

  it("uses a dash when the event has no note", () => {
    const html = buildHistoryReportHtml({
      kidName: "Ana Lima",
      kidBirthDate: null,
      kidGender: "male",
      events: [makeEvent()],
      period: PERIOD,
    });

    expect(html).toContain("<td>—</td>");
  });
});

it("includes unknown births by confirmation date and labels them distinctly", () => {
  const presence = makeEvent({
    recordKind: "presence",
    occurrenceDate: "",
    confirmedAt: "2026-01-07T12:00:00Z",
  });
  expect(filterEventsByPeriod([presence], PERIOD)).toEqual([presence]);
  const html = buildHistoryReportHtml({
    kidName: "Alice",
    kidBirthDate: "2024-01-01",
    kidGender: "female",
    events: [presence],
    period: PERIOD,
  });
  expect(html).toContain("Nascimento sem data informada");
  expect(html).toContain("esse dia não representa a data do acontecimento");
});

it("reports an undated loss as a loss without fabricating an occurrence date", () => {
  const loss = makeEvent({
    recordKind: "undated",
    eventType: "exfoliation",
    occurrenceDate: "",
    confirmedAt: "2026-01-07T12:00:00Z",
  });
  expect(filterEventsByPeriod([loss], PERIOD)).toEqual([loss]);
  const html = buildHistoryReportHtml({
    kidName: "Alice",
    kidBirthDate: "2024-01-01",
    kidGender: "female",
    events: [loss],
    period: PERIOD,
  });
  expect(html).toContain("Queda sem data informada");
  expect(html).not.toContain("Nascimento sem data informada");
  expect(html).toContain("esse dia não representa a data do acontecimento");
});
