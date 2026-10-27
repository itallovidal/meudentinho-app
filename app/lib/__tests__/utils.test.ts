/// <reference types="jest" />
import {
  ageInMonths,
  calendarAgeInMonths,
  formatAgeFromBirthDate,
  brDateToIsoKey,
  formatAgeMonthsFromBirthDate,
  localDateKeyToISO,
  parseLocalDate,
  toLocalDateKey,
} from "@/lib/utils";

describe("parseLocalDate", () => {
  it("builds a local date without shifting the day", () => {
    const date = parseLocalDate("2026-10-17");

    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(9);
    expect(date?.getDate()).toBe(17);
  });

  it("accepts values carrying a time part", () => {
    const date = parseLocalDate("2026-01-05T14:30:00Z");

    expect(date?.getDate()).toBe(5);
    expect(date?.getMonth()).toBe(0);
  });

  it("rejects malformed and impossible dates", () => {
    expect(parseLocalDate("")).toBeNull();
    expect(parseLocalDate("2026-13-01")).toBeNull();
    expect(parseLocalDate("2026-02-30")).toBeNull();
    expect(parseLocalDate("17/10/2026")).toBeNull();
    expect(parseLocalDate("2026-02")).toBeNull();
  });
});

describe("toLocalDateKey", () => {
  it("formats a date as yyyy-mm-dd", () => {
    expect(toLocalDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("localDateKeyToISO", () => {
  it("keeps midday so the day does not drift", () => {
    expect(localDateKeyToISO("2026-10-17")).toBe("2026-10-17T15:00:00.000Z");
  });

  it("returns null for an invalid key", () => {
    expect(localDateKeyToISO("17/10/2026")).toBeNull();
  });
});

describe("brDateToIsoKey", () => {
  it("converts dd/mm/yyyy into the iso key", () => {
    expect(brDateToIsoKey("17/10/2026")).toBe("2026-10-17");
  });

  it("rejects malformed input and impossible dates", () => {
    expect(brDateToIsoKey("17-10-2026")).toBeNull();
    expect(brDateToIsoKey("31/02/2020")).toBeNull();
    expect(brDateToIsoKey("17/10/1899")).toBeNull();
    expect(brDateToIsoKey("17/10/2999")).toBeNull();
  });
});

describe("ageInMonths", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-17T12:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("measures whole months since birth", () => {
    expect(ageInMonths("2025-10-17")).toBeCloseTo(12, 1);
    expect(ageInMonths("2026-07-17")).toBeCloseTo(3, 1);
  });

  it("is near zero on the birth day", () => {
    expect(ageInMonths("2026-10-17")).toBeLessThan(0.05);
  });

  it("returns null for invalid input", () => {
    expect(ageInMonths("")).toBeNull();
    expect(ageInMonths("not-a-date")).toBeNull();
  });
});

describe("formatAgeMonthsFromBirthDate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-17T12:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("labels the age in months", () => {
    expect(formatAgeMonthsFromBirthDate("2026-09-17")).toBe("1 mês");
    expect(formatAgeMonthsFromBirthDate("2026-07-17")).toBe("3 meses");
  });

  it("describes newborns as less than one month", () => {
    expect(formatAgeMonthsFromBirthDate("2026-10-17")).toBe("menos de 1 mês");
    expect(formatAgeMonthsFromBirthDate("2026-10-10")).toBe("menos de 1 mês");
  });

  it("returns null for invalid input", () => {
    expect(formatAgeMonthsFromBirthDate("")).toBeNull();
    expect(formatAgeMonthsFromBirthDate("not-a-date")).toBeNull();
  });
});

describe("calendar age display", () => {
  it.each([
    ["2026-10-27", 0, "menos de 1 mês"],
    ["2026-09-27", 1, "1 mês"],
    ["2025-11-27", 11, "11 meses"],
    ["2025-10-27", 12, "1 ano"],
    ["2025-09-27", 13, "1 ano e 1 mês"],
    ["2025-04-27", 18, "1 ano e 6 meses"],
    ["2024-11-27", 23, "1 ano e 11 meses"],
    ["2024-10-27", 24, "2 anos"],
  ])("formats %s at midnight", (birth, months, label) => {
    const reference = new Date("2026-10-27T00:00:00-03:00");
    expect(calendarAgeInMonths(birth, reference)).toBe(months);
    expect(formatAgeFromBirthDate(birth, reference)).toBe(label);
  });

  it.each([
    ["2025-01-01", "2025-12-31", 11],
    ["2025-01-01", "2026-01-01", 12],
    ["2025-01-31", "2025-02-27", 0],
    ["2025-01-31", "2025-02-28", 1],
    ["2024-01-31", "2024-02-29", 1],
    ["2024-02-29", "2025-02-27", 11],
    ["2024-02-29", "2025-02-28", 12],
    ["2024-02-29", "2028-02-28", 47],
    ["2024-02-29", "2028-02-29", 48],
    ["2025-01-31", "2025-03-30", 1],
    ["2025-01-31", "2025-03-31", 2],
  ])("uses calendar boundaries for %s on %s", (birth, today, months) => {
    expect(
      calendarAgeInMonths(birth, new Date(`${today}T00:00:00-03:00`)),
    ).toBe(months);
  });

  it.each(["", "invalid", "2026-02-30", "2027-01-01"])(
    "rejects invalid or future birth %s",
    (birth) => {
      const reference = new Date("2026-10-27T12:00:00-03:00");
      expect(calendarAgeInMonths(birth, reference)).toBeNull();
      expect(formatAgeFromBirthDate(birth, reference)).toBe("");
      expect(formatAgeMonthsFromBirthDate(birth, reference)).toBeNull();
    },
  );

  it("rejects an invalid reference date", () => {
    expect(calendarAgeInMonths("2025-01-01", new Date(NaN))).toBeNull();
  });
});
