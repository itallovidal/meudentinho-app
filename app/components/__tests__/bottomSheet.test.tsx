import { BottomSheet } from "@/components/ui/bottomSheet";
import { withSpring } from "react-native-reanimated";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({
  Modal: "Modal",
  Platform: { OS: "android" },
  Pressable: "Pressable",
  View: "View",
  StyleSheet: { absoluteFill: {} },
  useWindowDimensions: () => ({ height: 800 }),
}));
jest.mock("react-native-web/dist/exports/Modal", () => "Modal", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Pressable", () => "Pressable", {
  virtual: true,
});
jest.mock(
  "react-native-web/dist/exports/useWindowDimensions",
  () => () => ({
    height: 800,
  }),
  { virtual: true },
);
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
}));
jest.mock("@rn-primitives/portal", () => ({ PortalHost: "PortalHost" }));
jest.mock("phosphor-react-native", () => ({ XIcon: "XIcon" }));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("react-native-reanimated", () => ({
  __esModule: true,
  default: { View: "AnimatedView", ScrollView: "AnimatedScrollView" },
  runOnJS: (callback: unknown) => callback,
  useSharedValue: (value: number) => {
    const React = jest.requireActual("react");
    return React.useRef({ value }).current;
  },
  useAnimatedStyle: (callback: () => unknown) => callback(),
  useAnimatedScrollHandler: (callback: unknown) => callback,
  withSpring: jest.fn((value: number) => value),
  withTiming: (
    value: number,
    _config: unknown,
    callback?: (finished: boolean) => void,
  ) => {
    callback?.(true);
    return value;
  },
}));
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: "GestureHandlerRootView",
  GestureDetector: "GestureDetector",
  Gesture: {
    Pan: () => {
      const gesture = {
        start: () => {},
        update: (_event: unknown) => {},
        end: (_event: unknown) => {},
        finalize: (_event: unknown, _success: boolean) => {},
        activeOffsetY: jest.fn().mockReturnThis(),
        failOffsetY: jest.fn().mockReturnThis(),
        onStart(callback: () => void) {
          gesture.start = callback;
          return gesture;
        },
        onUpdate(callback: (event: unknown) => void) {
          gesture.update = callback;
          return gesture;
        },
        onEnd(callback: (event: unknown) => void) {
          gesture.end = callback;
          return gesture;
        },
        onFinalize(callback: (event: unknown, success: boolean) => void) {
          gesture.finalize = callback;
          return gesture;
        },
      };
      return gesture;
    },
    Native: () => ({}),
    Simultaneous: (...gestures: unknown[]) => ({ gestures }),
  },
}));

const { act, create } = jest.requireActual("react-test-renderer");
let renderer: ReturnType<typeof create>;
let onClose: jest.Mock;

beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  onClose = jest.fn();
  await act(async () => {
    renderer = create(
      <BottomSheet visible onClose={onClose} header="Título">
        Conteúdo
      </BottomSheet>,
    );
  });
});

afterEach(async () => {
  await act(async () => renderer.unmount());
});

function contentGesture() {
  return renderer.root.findAllByType("GestureDetector")[1].props.gesture
    .gestures[0];
}

function scrollTo(y: number) {
  renderer.root.findByType("AnimatedScrollView").props.onScroll({
    contentOffset: { y },
  });
}

it.each([
  [150, 100],
  [30, 800],
])(
  "dismisses from content with distance %s and velocity %s",
  async (distance, velocity) => {
    const gesture = contentGesture();
    await act(async () => {
      gesture.start();
      gesture.update({ translationY: distance });
      gesture.end({ translationY: distance, velocityY: velocity });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  },
);

it("returns to position after a short drag", async () => {
  const gesture = contentGesture();
  await act(async () => {
    gesture.start();
    gesture.update({ translationY: 30 });
    gesture.end({ translationY: 30, velocityY: 100 });
  });
  expect(onClose).not.toHaveBeenCalled();
  expect(withSpring).toHaveBeenCalledWith(0);
});

it("allows content to scroll back to the top before dismissing", async () => {
  const gesture = contentGesture();
  await act(async () => {
    scrollTo(200);
    gesture.start();
    gesture.update({ translationY: 150 });
    gesture.end({ translationY: 150, velocityY: 800 });
  });
  expect(onClose).not.toHaveBeenCalled();
  await act(async () => {
    scrollTo(0);
    gesture.start();
    gesture.update({ translationY: 150 });
    gesture.end({ translationY: 150, velocityY: 100 });
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("keeps the handle dismissible while content is scrolled", async () => {
  const gesture =
    renderer.root.findAllByType("GestureDetector")[0].props.gesture;
  await act(async () => {
    scrollTo(200);
    gesture.start();
    gesture.update({ translationY: 150 });
    gesture.end({ translationY: 150, velocityY: 100 });
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("returns to position when the content gesture is cancelled", async () => {
  const gesture = contentGesture();
  await act(async () => {
    gesture.start();
    gesture.update({ translationY: 80 });
    gesture.finalize({}, false);
  });
  expect(onClose).not.toHaveBeenCalled();
  expect(withSpring).toHaveBeenCalledWith(0);
});
