import { getAllToothEventsByKid } from "@/api/smile/getToothEvents";
import { authFetch } from "@/lib/authFetch";

jest.mock("@/lib/env", () => ({ ENV: { BASE_API_URL: "https://api.test" } }));
jest.mock("@/lib/authFetch", () => ({ authFetch: jest.fn() }));
const request = jest.mocked(authFetch);
const event = {
  id: "event",
  parentId: "parent",
  kidId: "kid",
  arch: "upper",
  side: "right",
  quadrant: "upper_right",
  toothType: "central_incisor",
  dentition: "primary",
  eventType: "eruption",
  occurrenceDate: "2026-01-01T12:00:00Z",
  createdAt: "2026-01-01T12:00:00Z",
  updatedAt: "2026-01-01T12:00:00Z",
};
function reply(data: unknown) {
  request.mockResolvedValue({
    status: 200,
    json: async () => ({ status: 200, data }),
  } as Response);
}

it("accepts only a confirmed empty array as empty history", async () => {
  reply({ events: [] });
  await expect(getAllToothEventsByKid("kid", "token")).resolves.toEqual([]);
});
it.each([
  {},
  null,
  { events: null },
  { events: [null] },
  { events: [{ ...event, kidId: "other" }] },
  { events: [{ ...event, quadrant: "lower_left" }] },
  { events: [{ ...event, toothType: "unknown" }] },
  { events: [{ ...event, occurrenceDate: "" }] },
  {
    events: [
      {
        ...event,
        recordKind: "presence",
        occurrenceDate: "",
        confirmedAt: undefined,
      },
    ],
  },
])("rejects incomplete or malformed history %j", async (data) => {
  reply(data);
  await expect(getAllToothEventsByKid("kid", "token")).rejects.toMatchObject({
    code: "RESPONSE_PARSE_ERROR",
  });
});
it("keeps legacy dated and explicit undated records distinct", async () => {
  const presence = {
    ...event,
    occurrenceDate: "",
    recordKind: "presence",
    confirmedAt: "2026-01-02T12:00:00Z",
  };
  reply({ events: [event, presence] });
  await expect(getAllToothEventsByKid("kid", "token")).resolves.toEqual([
    event,
    presence,
  ]);
});

it.each(["eruption", "exfoliation"])(
  "reads an undated %s without assigning the confirmation date to it",
  async (eventType) => {
    const undated = {
      ...event,
      eventType,
      recordKind: "undated",
      occurrenceDate: "",
      confirmedAt: "2026-01-02T12:00:00Z",
    };
    reply({ events: [undated] });
    await expect(getAllToothEventsByKid("kid", "token")).resolves.toEqual([
      undated,
    ]);
  },
);

it.each([
  {
    recordKind: "undated",
    occurrenceDate: event.occurrenceDate,
    confirmedAt: event.createdAt,
  },
  { recordKind: "undated", occurrenceDate: "", confirmedAt: undefined },
  {
    recordKind: "presence",
    eventType: "exfoliation",
    occurrenceDate: "",
    confirmedAt: event.createdAt,
  },
])("rejects inconsistent unknown dates %j", async (fields) => {
  reply({ events: [{ ...event, ...fields }] });
  await expect(getAllToothEventsByKid("kid", "token")).rejects.toMatchObject({
    code: "RESPONSE_PARSE_ERROR",
  });
});
