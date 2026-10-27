import { TabBarButton, TabBarIcon } from "@/navigation/TabNavigator";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({ View: "View", Platform: { OS: "web" } }));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Platform", () => ({ OS: "web" }), {
  virtual: true,
});
jest.mock("@react-navigation/bottom-tabs", () => ({
  BottomTabBar: "BottomTabBar",
  createBottomTabNavigator: jest.fn(() => ({})),
}));
jest.mock("@react-navigation/elements", () => ({
  PlatformPressable: "PlatformPressable",
}));
jest.mock("@react-navigation/native", () => ({
  CommonActions: {},
  StackActions: {},
}));
jest.mock("@/navigation/HomeStack", () => ({ HomeStack: {} }));
jest.mock("@/navigation/ArticlesStack", () => ({ ArticlesStack: {} }));
jest.mock("@/navigation/SmileStack", () => ({ SmileStack: {} }));
jest.mock("@/navigation/ProfileStack", () => ({ ProfileStack: {} }));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("phosphor-react-native", () => ({
  HouseIcon: "HouseIcon",
  ToothIcon: "ToothIcon",
  BookOpenIcon: "BookOpenIcon",
  UserIcon: "UserIcon",
}));

const { act, create } = jest.requireActual("react-test-renderer");
let renderer: ReturnType<typeof create>;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(async () => {
  await act(async () => renderer.unmount());
});

it("does not shade or fade the tab while preserving press handlers", async () => {
  const onPress = jest.fn();
  const onPressIn = jest.fn();
  const onPressOut = jest.fn();
  await act(async () => {
    renderer = create(
      <TabBarButton
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        Início
      </TabBarButton>,
    );
  });
  const button = renderer.root.findByType("PlatformPressable");
  expect(button.props.android_ripple.color).toBe("transparent");
  expect(button.props.pressColor).toBe("transparent");
  expect(button.props.pressOpacity).toBe(1);
  expect(button.props.hoverEffect.color).toBe("transparent");
  await act(async () => {
    button.props.onPressIn();
    button.props.onPress();
    button.props.onPressOut();
  });
  expect(onPressIn).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onPressOut).toHaveBeenCalledTimes(1);
  expect(button.props.style.at(-1).backgroundColor).toBe("transparent");
});

it("keeps the active-tab icon indicator", async () => {
  await act(async () => {
    renderer = create(<TabBarIcon focused>Icon</TabBarIcon>);
  });
  expect(renderer.root.findByType("View").props.className).toContain(
    "bg-primary-100",
  );
});
