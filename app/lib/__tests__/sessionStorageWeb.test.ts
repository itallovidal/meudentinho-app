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

it("starts anonymously without persisting credentials", async () => {
  await expect(readSessionStorage()).resolves.toEqual({
    session: null,
    pendingRevocations: [],
  });
  expect(storage.setItem).not.toHaveBeenCalled();
});

it("restores the token pair and pending revocations after a reload", async () => {
  const state = { session, pendingRevocations: ["previous-refresh"] };
  await writeSessionStorage(state);
  await expect(readSessionStorage()).resolves.toEqual(state);
  expect(values.get(sessionKey)).toBe(JSON.stringify(state));
});

it("does not restore a token pair after an interrupted refresh", async () => {
  await writeSessionStorage({
    session,
    pendingRevocations: ["previous-refresh"],
  });
  await markSessionInvalidated();
  await expect(readSessionStorage()).resolves.toEqual({
    session: null,
    pendingRevocations: ["previous-refresh", "refresh"],
  });
  await expect(readSessionStorage()).resolves.toMatchObject({ session: null });
});

it.each([
  "{invalid",
  "null",
  '{"session":null}',
  '{"session":{},"pendingRevocations":[]}',
])("clears a corrupt record and reports the failure: %s", async (raw) => {
  values.set(sessionKey, raw);
  await expect(readSessionStorage()).rejects.toMatchObject({
    code: "SESSION_STORAGE_ERROR",
  });
  expect(values.has(sessionKey)).toBe(false);
  await expect(readSessionStorage()).resolves.toMatchObject({ session: null });
});

it("reports blocked browser storage instead of pretending to save a login", async () => {
  jest.mocked(storage.setItem).mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  await expect(
    writeSessionStorage({ session, pendingRevocations: [] }),
  ).rejects.toMatchObject({ code: "SESSION_STORAGE_ERROR" });
  expect(values.has(sessionKey)).toBe(false);
});

it("does not restore a session from another tab's storage", async () => {
  await writeSessionStorage({ session, pendingRevocations: [] });
  values = new Map();
  await expect(readSessionStorage()).resolves.toMatchObject({ session: null });
});
