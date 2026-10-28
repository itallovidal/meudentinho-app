import { UserContext } from "@/contexts/UserContext";
import { Login } from "@/pages/profile/login";
import { Signup } from "@/pages/profile/signup";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({ ScrollView: "ScrollView", View: "View" }));
jest.mock("@/components/wrapper", () => ({ Wrapper: "Wrapper" }));
jest.mock("@/components/header", () => ({ Header: "Header" }));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/ui/button", () => ({ Button: "Button" }));
jest.mock("@/components/card", () => ({ Card: "Card" }));
jest.mock("@/components/forms/loginForm", () => ({ LoginForm: "LoginForm" }));
jest.mock("@/components/forms/profileForm", () => ({
  ProfileForm: "ProfileForm",
}));
jest.mock("@/contexts/UserContext", () => ({
  UserContext: jest.requireActual("react").createContext(null),
}));
jest.mock("@/api/auth/login", () => ({ login: jest.fn() }));
jest.mock("@/api/auth/signup", () => ({ signup: jest.fn() }));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("phosphor-react-native", () => ({
  ArrowsClockwiseIcon: "Icon",
  BookOpenIcon: "Icon",
  FileIcon: "Icon",
  ToothIcon: "Icon",
}));
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { fromTab: "Smile", returnTo: "/app/sorriso" } }),
  useLinkTo: () => mockLinkTo,
  useFocusEffect: (effect: () => void) =>
    jest.requireActual("react").useEffect(effect, [effect]),
}));

const { act, create } = jest.requireActual("react-test-renderer");
const mockNavigation = {
  reset: jest.fn(),
  getParent: jest.fn(),
};
const mockLinkTo = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

it.each([Login, Signup])(
  "clears the profile auth screen before returning to Smile from %p",
  async (Screen) => {
    let profileRoute = "Login";
    let activeTab = "Profile";
    mockNavigation.reset.mockImplementation((state) => {
      profileRoute = state.routes[0].name;
    });
    mockLinkTo.mockImplementation((path) => {
      expect(path).toBe("/app/sorriso");
      expect(profileRoute).toBe("Index");
      activeTab = "Smile";
    });
    const session = {
      hydrated: true,
      user: { name: "Responsável" },
      authToken: "token",
      sessionExpired: false,
    } as React.ContextType<typeof UserContext>;
    let renderer: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(
        <UserContext.Provider value={session}>
          <Screen />
        </UserContext.Provider>,
      );
    });
    expect(activeTab).toBe("Smile");
    expect(mockLinkTo).toHaveBeenCalledTimes(1);
    expect(profileRoute).toBe("Index");
    await act(async () => renderer.unmount());
  },
);
