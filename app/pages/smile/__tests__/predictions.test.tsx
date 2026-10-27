import { SmilePredictions } from "@/pages/smile/predictions";
import { useFocusEffect } from "@react-navigation/native";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({
  View: "View",
  Pressable: "Pressable",
  RefreshControl: "RefreshControl",
  ScrollView: "ScrollView",
}));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Pressable", () => "Pressable", {
  virtual: true,
});
jest.mock(
  "react-native-web/dist/exports/RefreshControl",
  () => "RefreshControl",
  { virtual: true },
);
jest.mock("react-native-web/dist/exports/ScrollView", () => "ScrollView", {
  virtual: true,
});
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({}),
  useRoute: () => ({ params: { kidId: "kid" } }),
  useFocusEffect: jest.fn(),
}));
jest.mock("@/contexts/UserContext", () => ({
  UserContext: jest
    .requireActual("react")
    .createContext({ authToken: "token", sessionExpired: false }),
}));
jest.mock("@/navigation/linking", () => ({ loginReturnPath: () => "/" }));
jest.mock("@/hooks/useKids", () => ({
  useKids: () => ({ kids: [mockKid], isLoading: false, refetch: jest.fn() }),
}));
jest.mock("@/hooks/useToothEvents", () => ({
  useToothEvents: () => ({
    events: [],
    hasCompleteData: true,
    isPending: false,
    refetch: jest.fn(),
  }),
}));
jest.mock("@/hooks/useToothPredictionAlerts", () => ({
  useToothPredictionAlerts: () => ({
    referenceDate: mockNow,
    active: [],
    ready: true,
    stale: false,
    snooze: { isPending: false },
    refetch: jest.fn(),
  }),
}));
jest.mock("@/hooks/useToothAlertActions", () => ({
  useToothAlertActions: () => ({ modalProps: {}, openRegistration: jest.fn() }),
}));
jest.mock("@/components/animatedHeight", () => ({
  AnimatedHeight: "AnimatedHeight",
}));
jest.mock("@/components/screenContent", () => ({
  ScreenContent: "ScreenContent",
}));
jest.mock("@/components/smile/teeth/ToothTypeSVG", () => ({
  ToothTypeSVG: "ToothTypeSVG",
}));
jest.mock("@/components/smile/ToothEventModal", () => ({
  ToothEventModal: "ToothEventModal",
}));
jest.mock("@/components/smile/ToothAlertsPanel", () => ({
  ToothAlertsPanel: "ToothAlertsPanel",
}));
jest.mock("@/components/header", () => ({ Header: "Header" }));
jest.mock("@/components/errorState", () => ({ ErrorState: "ErrorState" }));
jest.mock("@/components/queryWarningBanner", () => ({
  QueryWarningBanner: "QueryWarningBanner",
}));
jest.mock("@/components/sessionGate", () => ({ SessionGate: "SessionGate" }));
jest.mock("@/components/sessionNotice", () => ({
  SessionNotice: "SessionNotice",
}));
jest.mock("@/skeletons/components/skeletonText", () => ({
  SkeletonText: "SkeletonText",
}));
jest.mock("@/components/smile/DentalProgressChart", () => ({
  __esModule: true,
  default: "DentalProgressChart",
}));
jest.mock("@/components/smile/DentalCalendar", () => ({
  DentalCalendar: "DentalCalendar",
}));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/wrapper", () => ({ Wrapper: "Wrapper" }));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("phosphor-react-native", () => ({ CaretDownIcon: "CaretDownIcon" }));

const { act, create } = jest.requireActual("react-test-renderer");
const mockNow = new Date("2026-10-27T12:00:00-03:00");
const mockKid = {
  id: "kid",
  name: "Ana",
  birthDate: "2025-04-27",
  gender: "female",
};
let renderer: ReturnType<typeof create>;

function cards() {
  return renderer.root
    .findAllByType("Pressable")
    .filter(
      (node: { props: { accessibilityState?: { selected?: boolean } } }) =>
        node.props.accessibilityState?.selected !== undefined,
    );
}

beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.useFakeTimers();
  jest.setSystemTime(mockNow);
  jest.clearAllMocks();
  await act(async () => {
    renderer = create(<SmilePredictions />);
  });
});

afterEach(async () => {
  await act(async () => renderer.unmount());
  jest.useRealTimers();
});

it("opens on the current date without selecting a prediction", () => {
  expect(cards()).toHaveLength(2);
  expect(
    cards().every(
      (node: ReturnType<typeof cards>[number]) =>
        node.props.accessibilityState.selected === false,
    ),
  ).toBe(true);
  expect(renderer.root.findByType("DentalCalendar").props.initialDate).toEqual(
    mockNow,
  );
  expect(
    renderer.root.findByType("DentalCalendar").props.focusRequest,
  ).toBeNull();
});

it("toggles the selected prediction off and returns the calendar to today", async () => {
  await act(async () => cards()[0].props.onPress());
  expect(cards()[0].props.accessibilityState.selected).toBe(true);
  expect(cards()[0].props.className).toContain("border-primary-400");
  expect(
    renderer.root.findByType("DentalCalendar").props.focusRequest.date,
  ).not.toEqual(mockNow);
  await act(async () => cards()[0].props.onPress());
  expect(
    cards().every(
      (node: ReturnType<typeof cards>[number]) =>
        node.props.accessibilityState.selected === false,
    ),
  ).toBe(true);
  expect(
    renderer.root.findByType("DentalCalendar").props.focusRequest.date,
  ).toEqual(mockNow);
});

it("switches selection directly to another prediction", async () => {
  await act(async () => cards()[0].props.onPress());
  await act(async () => cards()[1].props.onPress());
  expect(cards()[0].props.accessibilityState.selected).toBe(false);
  expect(cards()[1].props.accessibilityState.selected).toBe(true);
});

it("reveals the next two predictions inside the animated container", async () => {
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: "Ver mais marcos" })
      .props.onPress(),
  );
  expect(cards()).toHaveLength(4);
  expect(
    renderer.root.findByType("AnimatedHeight").findAllByType("Pressable"),
  ).toHaveLength(4);
  expect(
    cards().every(
      (node: ReturnType<typeof cards>[number]) =>
        node.props.accessibilityState.selected === false,
    ),
  ).toBe(true);
});

it("clears selection and expanded items when the screen opens again", async () => {
  await act(async () => cards()[0].props.onPress());
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: "Ver mais marcos" })
      .props.onPress(),
  );
  const onFocus = jest.mocked(useFocusEffect).mock.calls.at(-1)![0];
  await act(async () => {
    onFocus();
  });
  expect(cards()).toHaveLength(2);
  expect(
    cards().every(
      (node: ReturnType<typeof cards>[number]) =>
        node.props.accessibilityState.selected === false,
    ),
  ).toBe(true);
  expect(
    renderer.root.findByType("DentalCalendar").props.focusRequest.date,
  ).toEqual(mockNow);
});
