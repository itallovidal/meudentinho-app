import { Linking, Platform } from "react-native";
import { ENV } from "@/lib/env";
import { getPrivacyPolicyUrl, openPrivacyPolicy } from "@/lib/privacyPolicy";

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
  Linking: { canOpenURL: jest.fn(), openURL: jest.fn() },
}));
jest.mock("react-native-web/dist/exports/Linking", () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));
jest.mock("react-native-web/dist/exports/Platform", () => ({ OS: "ios" }));
jest.mock("expo-crypto", () => ({ randomUUID: jest.fn() }));
jest.mock("@/lib/env", () => ({
  ENV: {
    PRIVACY_POLICY_URL: "https://janelinha.example/politica-de-privacidade",
  },
}));

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
  ENV.PRIVACY_POLICY_URL = "https://janelinha.example/politica-de-privacidade";
  jest.mocked(Linking.canOpenURL).mockResolvedValue(true);
  jest.mocked(Linking.openURL).mockResolvedValue(undefined);
});

afterEach(() => {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

it.each(["http://localhost:4173", "https://preview.janelinha.example"])(
  "opens the policy on the current web origin: %s",
  async (origin) => {
    Object.defineProperty(Platform, "OS", { value: "web" });
    Object.defineProperty(globalThis, "window", {
      value: { location: { origin } },
      configurable: true,
    });

    expect(getPrivacyPolicyUrl()).toBe(`${origin}/politica-de-privacidade`);
    expect(await openPrivacyPolicy()).toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith(
      `${origin}/politica-de-privacidade`,
    );
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
  },
);

it("uses the configured HTTPS policy on native platforms", async () => {
  expect(getPrivacyPolicyUrl()).toBe(ENV.PRIVACY_POLICY_URL);
  expect(await openPrivacyPolicy()).toBe(true);
  expect(Linking.canOpenURL).toHaveBeenCalledWith(ENV.PRIVACY_POLICY_URL);
});

it("rejects HTTP on native platforms", async () => {
  ENV.PRIVACY_POLICY_URL = "http://localhost:4173/politica-de-privacidade";

  expect(await openPrivacyPolicy()).toBe(false);
  expect(Linking.openURL).not.toHaveBeenCalled();
});

it("reports an unsupported destination without trying to open it", async () => {
  jest.mocked(Linking.canOpenURL).mockResolvedValue(false);

  expect(await openPrivacyPolicy()).toBe(false);
  expect(Linking.openURL).not.toHaveBeenCalled();
});

it("reports failures to open the browser", async () => {
  jest
    .mocked(Linking.openURL)
    .mockRejectedValue(new Error("Browser unavailable"));

  expect(await openPrivacyPolicy()).toBe(false);
});
