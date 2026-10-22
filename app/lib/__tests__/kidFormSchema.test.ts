import { kidSchema } from "@/lib/schemas/kid";
import { brDateToIsoKey } from "@/lib/utils";
import { buildKidRequest } from "@/lib/privacyPolicy";
jest.mock("react-native", () => ({ Linking: {} }));
jest.mock("react-native-web/dist/exports/Linking", () => ({}), {
  virtual: true,
});
jest.mock("expo-crypto", () => ({ randomUUID: () => "request-id" }));
jest.mock("@/lib/env", () => ({
  ENV: { PRIVACY_POLICY_URL: "https://example.com" },
}));
const valid = {
  name: "Alice",
  birthDate: "2020-01-01",
  gender: "female" as const,
  accepted: true,
};
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-10-22T09:00:00-03:00"));
});
afterEach(() => {
  jest.useRealTimers();
});
it("accepts today before noon and rejects tomorrow", () => {
  expect(brDateToIsoKey("22/10/2026")).toBe("2026-10-22");
  expect(
    kidSchema.safeParse({ ...valid, birthDate: "2026-10-22" }).success,
  ).toBe(true);
  const tomorrow = kidSchema.safeParse({ ...valid, birthDate: "2026-10-23" });
  expect(tomorrow.success).toBe(false);
  if (!tomorrow.success)
    expect(tomorrow.error.issues[0].message).toBe(
      "A data não pode ser futura.",
    );
});
it.each([undefined, "0", "", "19", "37", "invalid"])(
  "rejects premature weeks %s when checked",
  (weeks) => {
    const result = kidSchema.safeParse({
      ...valid,
      isPremature: true,
      prematureWeeks: weeks,
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.error.issues.some((issue) => issue.path[0] === "prematureWeeks"),
      ).toBe(true);
  },
);
it.each(["20", "30", "36"])("accepts gestational weeks %s", (weeks) => {
  expect(
    kidSchema.safeParse({ ...valid, isPremature: true, prematureWeeks: weeks })
      .success,
  ).toBe(true);
});
it("omits form-only fields and serializes non-prematurity as zero", async () => {
  const request = await buildKidRequest({
    ...valid,
    isPremature: false,
    prematureWeeks: "30",
  });
  expect(request.prematureWeeks).toBe("0");
  expect(request).not.toHaveProperty("isPremature");
  expect(request).not.toHaveProperty("accepted");
  expect(request.birthDate).toBe("2020-01-01");
  expect(
    (
      await buildKidRequest({
        ...valid,
        isPremature: true,
        prematureWeeks: "30",
      })
    ).prematureWeeks,
  ).toBe("30");
});
