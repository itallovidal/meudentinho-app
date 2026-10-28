import {
  markSessionInvalidated,
  readSessionStorage,
  writeSessionStorage,
} from "@/lib/sessionStorage.web";

jest.mock("@/lib/env", () => ({
  ENV: { LOCAL_STORAGE_KEY_PREFIX: "@web-test" },
}));

const session = {
  user: { name: "Ana", email: "ana@example.com", isAdmin: false },
  authToken: "access",
  refreshToken: "refresh",
  userId: "user-1",
};
const sessionKey = "@web-test_authSession";
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let values: Map<string, string>;
let storage: Pick<Storage, "getItem" | "setItem" | "removeItem">;

beforeEach(() => {
  values = new Map();
  storage = {
    getItem: jest.fn((key) => values.get(key) ?? null),
    setItem: jest.fn((key, value) => values.set(key, value)),
    removeItem: jest.fn((key) => values.delete(key)),
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { sessionStorage: storage },
  });
});

afterEach(() => {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

it("removes legacy credentials instead of restoring the old token pair", async () => {
  values.set(
    sessionKey,
    JSON.stringify({ session, pendingRevocations: ["old-refresh"] }),
  );
  values.set("@web-test_sessionInvalidated", "true");
  values.set("unrelated", "preference");
  await expect(readSessionStorage()).resolves.toEqual({
    session: null,
    pendingRevocations: [],
  });
  expect(values.has(sessionKey)).toBe(false);
  expect(values.has("@web-test_sessionInvalidated")).toBe(false);
  expect(values.get("unrelated")).toBe("preference");
});

it("never persists credentials or revocation tokens", async () => {
  await writeSessionStorage({
    session,
    pendingRevocations: ["previous-refresh"],
  });
  await markSessionInvalidated();
  expect(storage.setItem).not.toHaveBeenCalled();
  await expect(readSessionStorage()).resolves.toEqual({
    session: null,
    pendingRevocations: [],
  });
});

it("discards corrupt legacy storage without trying to parse it", async () => {
  values.set(sessionKey, "{invalid");
  await expect(readSessionStorage()).resolves.toMatchObject({ session: null });
  expect(values.has(sessionKey)).toBe(false);
});

it("reports a failure to remove legacy credentials", async () => {
  jest.mocked(storage.removeItem).mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  await expect(readSessionStorage()).rejects.toMatchObject({
    code: "SESSION_STORAGE_ERROR",
  });
});
