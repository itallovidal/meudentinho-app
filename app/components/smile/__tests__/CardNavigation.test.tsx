import { PredictionsCard } from "@/components/smile/PredictionsCard";
import { RecentEventsList } from "@/components/smile/RecentEventsList";
import { buildToothPredictions } from "@/lib/toothPredictions";
import type { ToothEvent } from "@/types/teeth";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({ View: "View", Pressable: "Pressable" }));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Pressable", () => "Pressable", {
  virtual: true,
});
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/ui/separator", () => ({ Separator: "Separator" }));
jest.mock("@/components/ui/skeleton", () => ({ Skeleton: "Skeleton" }));
jest.mock("@/components/wrapper", () => ({ Wrapper: "Wrapper" }));
jest.mock("@/components/smile/ToothEventCard", () => ({
  ToothEventCard: "ToothEventCard",
}));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("phosphor-react-native", () => ({
  ArrowRightIcon: "ArrowRightIcon",
  CalendarBlankIcon: "CalendarBlankIcon",
  ClockIcon: "ClockIcon",
  ClockCounterClockwiseIcon: "ClockCounterClockwiseIcon",
  ClockCountdownIcon: "ClockCountdownIcon",
  TimerIcon: "TimerIcon",
}));

const { act, create } = jest.requireActual("react-test-renderer");
let renderer: ReturnType<typeof create>;
const referenceDate = new Date("2026-10-27T12:00:00-03:00");
const items = buildToothPredictions(
  "2025-04-27",
  [],
  "male",
  referenceDate,
).slice(0, 3);
const reviewCounts = { active: 0, historical: 0, snoozed: 0 };
const record: ToothEvent = {
  id: "record",
  parentId: "parent",
  kidId: "kid",
  arch: "upper",
  quadrant: "upper_right",
  side: "right",
  toothType: "central_incisor",
  dentition: "primary",
  eventType: "eruption",
  occurrenceDate: "2026-01-01",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(async () => {
  await act(async () => renderer.unmount());
});

it("opens predictions from the card surface", async () => {
  const onPress = jest.fn();
  await act(async () => {
    renderer = create(
      <PredictionsCard
        items={items}
        referenceDate={referenceDate}
        reviewCounts={reviewCounts}
        onPress={onPress}
      />,
    );
  });
  await act(async () =>
    renderer.root.findByProps({ testID: "tooth-predictions" }).props.onPress(),
  );
  expect(onPress).toHaveBeenCalledTimes(1);
});

it("keeps the predictions arrow accessible without triggering navigation twice", async () => {
  const onPress = jest.fn();
  const stopPropagation = jest.fn();
  await act(async () => {
    renderer = create(
      <PredictionsCard
        items={items}
        referenceDate={referenceDate}
        reviewCounts={reviewCounts}
        onPress={onPress}
      />,
    );
  });
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: "Ver todas as previsões" })
      .props.onPress({ stopPropagation }),
  );
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(stopPropagation).toHaveBeenCalledTimes(1);
});

it("retries a failed review without navigating away", async () => {
  const onPress = jest.fn();
  const onRetry = jest.fn();
  const stopPropagation = jest.fn();
  await act(async () => {
    renderer = create(
      <PredictionsCard
        items={items}
        referenceDate={referenceDate}
        reviewCounts={null}
        reviewError="Falha ao carregar"
        onPress={onPress}
        onRetry={onRetry}
      />,
    );
  });
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: "Atualizar revisão dos registros" })
      .props.onPress({ stopPropagation }),
  );
  expect(stopPropagation).toHaveBeenCalledTimes(1);
  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(onPress).not.toHaveBeenCalled();
});

it("opens history from the recent-records card and makes preview items non-interactive", async () => {
  const onHistoryPress = jest.fn();
  await act(async () => {
    renderer = create(
      <RecentEventsList items={[record]} onHistoryPress={onHistoryPress} />,
    );
  });
  await act(async () =>
    renderer.root.findByProps({ testID: "recent-events" }).props.onPress(),
  );
  expect(onHistoryPress).toHaveBeenCalledTimes(1);
  expect(
    renderer.root.findByType("ToothEventCard").props.onPress,
  ).toBeUndefined();
  expect(
    renderer.root
      .findByProps({ pointerEvents: "none" })
      .findByType("ToothEventCard").props.event,
  ).toBe(record);
});

it("keeps the history shortcut accessible and prevents a duplicate navigation", async () => {
  const onHistoryPress = jest.fn();
  const stopPropagation = jest.fn();
  await act(async () => {
    renderer = create(
      <RecentEventsList items={[record]} onHistoryPress={onHistoryPress} />,
    );
  });
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: "Ver histórico completo" })
      .props.onPress({ stopPropagation }),
  );
  expect(onHistoryPress).toHaveBeenCalledTimes(1);
  expect(stopPropagation).toHaveBeenCalledTimes(1);
});
