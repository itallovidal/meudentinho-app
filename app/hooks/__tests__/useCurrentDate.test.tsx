import { useEffect } from "react";
import { useCurrentDate } from "@/hooks/useCurrentDate";

jest.mock("react-native", () => ({
  AppState: { addEventListener: jest.fn() },
}));
jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock(
  "react-native-web/dist/exports/AppState",
  () => jest.requireMock("react-native").AppState,
  { virtual: true },
);
const { act, create } = jest.requireActual("react-test-renderer");
const { AppState } = jest.requireMock("react-native");
let onActive: (state: string) => void;
const remove = jest.fn();
let current: Date;
function Harness({ expiration }: { expiration?: string }) {
  const value = useCurrentDate(expiration);
  useEffect(() => {
    current = value;
  }, [value]);
  return null;
}
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-06-06T23:59:00-03:00"));
  AppState.addEventListener.mockImplementation(
    (_name: string, listener: (state: string) => void) => {
      onActive = listener;
      return { remove };
    },
  );
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(() => {
  jest.useRealTimers();
});

it("recalculates at local midnight and removes its timer and listener", async () => {
  const schedule = jest.spyOn(globalThis, "setTimeout");
  const cancel = jest.spyOn(globalThis, "clearTimeout");
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(<Harness />);
  });
  expect(current.getDate()).toBe(6);
  await act(async () => {
    jest.advanceTimersByTime(60_001);
  });
  expect(current.getDate()).toBe(7);
  const deadlineIndex = schedule.mock.calls.findLastIndex(
    ([, delay]) => typeof delay === "number" && delay > 60_000,
  );
  const deadlineTimer = schedule.mock.results[deadlineIndex].value;
  await act(async () => {
    renderer.unmount();
  });
  expect(remove).toHaveBeenCalled();
  expect(cancel).toHaveBeenCalledWith(deadlineTimer);
  schedule.mockRestore();
  cancel.mockRestore();
});

it("recalculates when the snooze expires in the middle of the day", async () => {
  jest.setSystemTime(new Date("2026-06-07T11:59:00-03:00"));
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(<Harness expiration="2026-06-07T12:00:00-03:00" />);
  });
  await act(async () => {
    jest.advanceTimersByTime(60_001);
  });
  expect(current.getHours()).toBe(12);
  await act(async () => {
    renderer.unmount();
  });
});

it("updates the reference after returning from background days later", async () => {
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(<Harness />);
  });
  jest.setSystemTime(new Date("2026-06-14T10:00:00-03:00"));
  await act(async () => {
    onActive("active");
  });
  expect(current.getDate()).toBe(14);
  await act(async () => {
    renderer.unmount();
  });
});
