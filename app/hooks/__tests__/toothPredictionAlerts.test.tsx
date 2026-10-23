import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserContext, type UserContextProps } from "@/contexts/UserContext";
import { useToothPredictionAlerts } from "@/hooks/useToothPredictionAlerts";
import { getToothAlertSnoozes } from "@/api/smile/getToothAlertSnoozes";
import { toothEventsQueryKey } from "@/lib/queryKeys";
import { ApiError } from "@/types/domain";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("@/contexts/UserContext", () => ({
  UserContext: jest.requireActual("react").createContext(null),
}));
jest.mock("@/hooks/useCurrentDate", () => ({
  useCurrentDate: () => new Date("2026-06-07T12:00:00-03:00"),
}));
jest.mock("@/api/smile/getToothAlertSnoozes", () => ({
  getToothAlertSnoozes: jest.fn(),
}));
jest.mock("@/api/smile/snoozeToothAlert", () => ({
  snoozeToothAlert: jest.fn(),
}));
const { act, create } = jest.requireActual("react-test-renderer");
const request = jest.mocked(getToothAlertSnoozes);
const kid = {
  id: "kid",
  birthDate: "2025-01-31",
  createdAt: "2025-02-01T12:00:00Z",
};
let result: ReturnType<typeof useToothPredictionAlerts>;
function Harness({ ready = true }: { ready?: boolean }) {
  const value = useToothPredictionAlerts({
    kid,
    events: [],
    eventsReady: ready,
    eventsStale: false,
  });
  useEffect(() => {
    result = value;
  }, [value]);
  return null;
}
function screen(cache: QueryClient, ready = true, account = "account") {
  return (
    <UserContext.Provider
      value={{ userId: account, authToken: "token" } as UserContextProps}
    >
      <QueryClientProvider client={cache}>
        <Harness ready={ready} />
      </QueryClientProvider>
    </UserContext.Provider>
  );
}
beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
function client() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

it("does not interpret loading events or missing preferences as confirmed empty history", async () => {
  const cache = client();
  request.mockReturnValue(new Promise(() => {}));
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(screen(cache, false));
  });
  expect(result.ready).toBe(false);
  expect(result.active).toEqual([]);
  cache.setQueryData(
    [...toothEventsQueryKey("account", kid.id), "alert-preferences"],
    [],
  );
  await act(async () => {
    renderer.update(screen(cache, false));
  });
  expect(result.ready).toBe(false);
  await act(async () => {
    renderer.update(screen(cache, true));
  });
  expect(result.ready).toBe(true);
  expect(result.active.length).toBeGreaterThan(0);
  await act(async () => {
    renderer.unmount();
    cache.clear();
  });
});

it("does not reuse another account's snoozes", async () => {
  const cache = client();
  request.mockReturnValue(new Promise(() => {}));
  cache.setQueryData(
    [...toothEventsQueryKey("account", kid.id), "alert-preferences"],
    [],
  );
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(screen(cache));
  });
  expect(result.ready).toBe(true);
  await act(async () => {
    renderer.update(screen(cache, true, "other-account"));
  });
  expect(result.ready).toBe(false);
  await act(async () => {
    renderer.unmount();
    cache.clear();
  });
});

it("keeps preference failures visible and does not activate warnings from unknown preferences", async () => {
  const cache = client();
  request.mockRejectedValue(
    new ApiError("Vínculo removido.", "KID_NOT_LINKED_TO_PARENT", 403),
  );
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(screen(cache));
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(result.ready).toBe(false);
  expect(result.error).toMatchObject({ message: "Vínculo removido." });
  await act(async () => {
    renderer.unmount();
    cache.clear();
  });
});
