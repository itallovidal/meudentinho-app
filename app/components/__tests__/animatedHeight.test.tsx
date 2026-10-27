import { AnimatedHeight } from "@/components/animatedHeight";
import { CollapsibleSection } from "@/components/collapsibleSection";
import { withTiming } from "react-native-reanimated";

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
jest.mock("react-native-reanimated", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: { View: "AnimatedView" },
    useSharedValue: (value: number) => React.useRef({ value }).current,
    useAnimatedStyle: (style: () => unknown) => style(),
    withTiming: jest.fn((value: number) => value),
  };
});
jest.mock("phosphor-react-native", () => ({
  CaretDownIcon: "CaretDownIcon",
  CaretUpIcon: "CaretUpIcon",
}));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));

const { act, create } = jest.requireActual("react-test-renderer");
let renderer: ReturnType<typeof create>;

function measure(height: number) {
  const content = renderer.root
    .findAllByType("View")
    .find((node: { props: { onLayout?: unknown } }) => !!node.props.onLayout);
  content.props.onLayout({ nativeEvent: { layout: { height } } });
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
});

afterEach(async () => {
  await act(async () => renderer.unmount());
});

it("animates content growth and shrinkage using the legend timing", async () => {
  await act(async () => {
    renderer = create(<AnimatedHeight>Items</AnimatedHeight>);
  });
  await act(async () => measure(200));
  jest.mocked(withTiming).mockClear();
  await act(async () => measure(450));
  expect(withTiming).toHaveBeenCalledWith(450, { duration: 250 });
  await act(async () => measure(150));
  expect(withTiming).toHaveBeenCalledWith(150, { duration: 250 });
});

it("keeps the legend collapsed and inaccessible until expanded", async () => {
  await act(async () => {
    renderer = create(
      <CollapsibleSection title="Legendas">Legend</CollapsibleSection>,
    );
  });
  await act(async () => measure(240));
  expect(renderer.root.findByType("AnimatedView").props.pointerEvents).toBe(
    "none",
  );
  expect(
    renderer.root.findByType("AnimatedView").props.accessibilityElementsHidden,
  ).toBe(true);
  await act(async () => renderer.root.findByType("Pressable").props.onPress());
  expect(withTiming).toHaveBeenCalledWith(240, { duration: 250 });
  expect(renderer.root.findByType("AnimatedView").props.pointerEvents).toBe(
    "auto",
  );
  expect(
    renderer.root.findByType("Pressable").props.accessibilityState.expanded,
  ).toBe(true);
  await act(async () => renderer.root.findByType("Pressable").props.onPress());
  expect(withTiming).toHaveBeenCalledWith(0, { duration: 250 });
});
