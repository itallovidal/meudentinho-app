/// <reference types="jest" />
import {
  ageInMonths,
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

  it("never reports a newborn as zero months", () => {
    expect(formatAgeMonthsFromBirthDate("2026-10-17")).toBe("1 mês");
    expect(formatAgeMonthsFromBirthDate("2026-10-10")).toBe("1 mês");
  });

  it("returns null for invalid input", () => {
    expect(formatAgeMonthsFromBirthDate("")).toBeNull();
    expect(formatAgeMonthsFromBirthDate("not-a-date")).toBeNull();
  });
});
