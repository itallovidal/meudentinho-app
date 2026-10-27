import { AccessibilityInfo, Animated } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { SKELETON_ANIMATION } from "@/lib/themeColors";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock(
  "react-native-web/dist/exports/Animated",
  () => ({
    View: "AnimatedView",
    Value: class MockValue {
      value: number;
      constructor(value: number) {
        this.value = value;
      }
      setValue(value: number) {
        this.value = value;
      }
    },
    timing: jest.fn(),
    sequence: jest.fn(),
    loop: jest.fn(),
  }),
  { virtual: true },
);
jest.mock(
  "react-native-web/dist/exports/AccessibilityInfo",
  () => ({
    isReduceMotionEnabled: jest.fn(),
    addEventListener: jest.fn(),
  }),
  { virtual: true },
);
jest.mock("react-native", () => ({
  Animated: jest.requireMock("react-native-web/dist/exports/Animated"),
  AccessibilityInfo: jest.requireMock(
    "react-native-web/dist/exports/AccessibilityInfo",
  ),
  Platform: { OS: "web" },
  View: "View",
}));

const { act, create } = jest.requireActual("react-test-renderer");
const loop = jest.mocked(Animated.loop);
const preference = jest.mocked(AccessibilityInfo.isReduceMotionEnabled);
const subscribe = jest.mocked(AccessibilityInfo.addEventListener);
const pulse = { start: jest.fn(), stop: jest.fn() };
const remove = jest.fn();
let renderer: ReturnType<typeof create>;

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  preference.mockResolvedValue(false);
  loop.mockReturnValue(pulse as unknown as Animated.CompositeAnimation);
  subscribe.mockReturnValue({ remove });
});
afterEach(() => act(() => renderer.unmount()));

it("keeps the pulse visible and reacts to reduced-motion changes", async () => {
  await act(async () => {
    renderer = create(<Skeleton />);
  });
  expect(
    jest
      .mocked(Animated.timing)
      .mock.calls.map(([, options]) => options.toValue),
  ).toEqual([SKELETON_ANIMATION.maxOpacity, SKELETON_ANIMATION.minOpacity]);
  expect(pulse.start).toHaveBeenCalledTimes(1);
  const update = subscribe.mock.calls[0][1];
  act(() => {
    update(true);
  });
  expect(pulse.stop).toHaveBeenCalledTimes(1);
  expect(
    renderer.root.findByType("AnimatedView").props.style.at(-1).opacity.value,
  ).toBe(1);
  act(() => {
    update(false);
  });
  expect(pulse.start).toHaveBeenCalledTimes(2);
});

it("uses a static visible skeleton when reduced motion is enabled", async () => {
  preference.mockResolvedValue(true);
  await act(async () => {
    renderer = create(<Skeleton />);
  });
  expect(loop).not.toHaveBeenCalled();
  expect(
    renderer.root.findByType("AnimatedView").props.style.at(-1).opacity.value,
  ).toBe(1);
});

it("cleans up the animation and motion subscription when unmounted", async () => {
  await act(async () => {
    renderer = create(<Skeleton />);
  });
  act(() => renderer.unmount());
  expect(pulse.stop).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledTimes(1);
});
