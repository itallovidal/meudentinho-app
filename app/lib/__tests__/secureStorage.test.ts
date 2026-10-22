import * as SecureStore from "expo-secure-store";
import { ENV } from "@/lib/env";
import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
} from "@/lib/secureStorage";
import { readSessionStorage, writeSessionStorage } from "@/lib/sessionStorage";

jest.mock("@/lib/env", () => ({
  ENV: { LOCAL_STORAGE_KEY_PREFIX: "@janelinha" },
}));
jest.mock("@/lib/asyncStorage", () => ({
  getLocalStorageItem: jest.fn(async () => null),
  setLocalStorageItem: jest.fn(async () => undefined),
  removeLocalStorageItem: jest.fn(async () => undefined),
}));
jest.mock("expo-secure-store/build/ExpoSecureStore", () => ({
  __esModule: true,
  default: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 4,
    getValueWithKeyAsync: jest.fn(),
    setValueWithKeyAsync: jest.fn(),
    deleteValueWithKeyAsync: jest.fn(),
  },
}));
jest.mock("expo-secure-store", () => ({
  ...jest.requireActual<typeof import("expo-secure-store")>(
    "expo-secure-store",
  ),
}));

const nativeSecureStore = jest.requireMock(
  "expo-secure-store/build/ExpoSecureStore",
).default as {
  getValueWithKeyAsync: jest.Mock;
  setValueWithKeyAsync: jest.Mock;
  deleteValueWithKeyAsync: jest.Mock;
};

const stored = new Map<string, string>();

beforeEach(() => {
  jest.clearAllMocks();
  stored.clear();
  ENV.LOCAL_STORAGE_KEY_PREFIX = "@janelinha";
  nativeSecureStore.getValueWithKeyAsync.mockImplementation(
    async (key: string) => stored.get(key) ?? null,
  );
  nativeSecureStore.setValueWithKeyAsync.mockImplementation(
    async (value: string, key: string) => {
      stored.set(key, value);
    },
  );
  nativeSecureStore.deleteValueWithKeyAsync.mockImplementation(
    async (key: string) => {
      stored.delete(key);
    },
  );
});

it("confirms that the real SecureStore validator rejects the old default key", async () => {
  await expect(
    SecureStore.setItemAsync("@janelinha_authSession", "session"),
  ).rejects.toThrow("Invalid key");
  expect(nativeSecureStore.setValueWithKeyAsync).not.toHaveBeenCalled();
});

it("writes, reads and removes the default session using valid secure keys", async () => {
  await setSecureItem("authSession", "session");
  await expect(getSecureItem("authSession")).resolves.toBe("session");
  expect(nativeSecureStore.setValueWithKeyAsync).toHaveBeenCalledWith(
    "session",
    expect.stringMatching(/^[\w.-]+$/),
    { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
  );
  await removeSecureItem("authSession");
  await expect(getSecureItem("authSession")).resolves.toBeNull();
});

it("persists and restores a login through the real SecureStore validator", async () => {
  const state = {
    session: {
      user: { name: "Ana", email: "ana@example.com", isAdmin: false },
      authToken: "access",
      refreshToken: "refresh",
      userId: "user1",
    },
    pendingRevocations: [],
  };
  await expect(writeSessionStorage(state)).resolves.toBeUndefined();
  await expect(readSessionStorage()).resolves.toEqual(state);
});

it("keeps prefixes with special characters isolated from similar valid prefixes", async () => {
  ENV.LOCAL_STORAGE_KEY_PREFIX = "a@b";
  await setSecureItem("token", "first");
  ENV.LOCAL_STORAGE_KEY_PREFIX = "a_b";
  await setSecureItem("token", "second");
  await expect(getSecureItem("token")).resolves.toBe("second");
  ENV.LOCAL_STORAGE_KEY_PREFIX = "a@b";
  await expect(getSecureItem("token")).resolves.toBe("first");
});

it("migrates existing secure entries with valid legacy prefixes", async () => {
  ENV.LOCAL_STORAGE_KEY_PREFIX = "janelinha";
  stored.set("janelinha_token", "previous");
  await expect(getSecureItem("token")).resolves.toBe("previous");
  expect(stored.has("janelinha_token")).toBe(false);
  expect([...stored.values()]).toEqual(["previous"]);
});

it("preserves the original secure entry if migration cannot be written", async () => {
  ENV.LOCAL_STORAGE_KEY_PREFIX = "janelinha";
  stored.set("janelinha_token", "previous");
  nativeSecureStore.setValueWithKeyAsync.mockRejectedValueOnce(
    new Error("Keychain unavailable"),
  );
  await expect(getSecureItem("token")).rejects.toThrow("Keychain unavailable");
  expect(stored.get("janelinha_token")).toBe("previous");
});

it("accepts Unicode prefixes without changing the AsyncStorage namespace", async () => {
  ENV.LOCAL_STORAGE_KEY_PREFIX = "@família/🦷";
  await setSecureItem("refreshToken", "refresh");
  await expect(getSecureItem("refreshToken")).resolves.toBe("refresh");
  expect(ENV.LOCAL_STORAGE_KEY_PREFIX).toBe("@família/🦷");
});
