import { readSessionStorage, writeSessionStorage } from "@/lib/sessionStorage";
import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
} from "@/lib/secureStorage";
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from "@/lib/asyncStorage";

jest.mock("@/lib/secureStorage", () => ({
  getSecureItem: jest.fn(),
  setSecureItem: jest.fn(),
  removeSecureItem: jest.fn(),
}));
jest.mock("@/lib/asyncStorage", () => ({
  getLocalStorageItem: jest.fn(),
  setLocalStorageItem: jest.fn(),
  removeLocalStorageItem: jest.fn(),
}));

const session = {
  user: { name: "Ana", email: "a@b.com", isAdmin: false },
  authToken: "access",
  refreshToken: "refresh",
  userId: "u1",
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getSecureItem).mockResolvedValue(null);
  jest.mocked(getLocalStorageItem).mockResolvedValue(null);
});

it("stores the token pair in one encrypted record and never falls back to plaintext", async () => {
  jest
    .mocked(setSecureItem)
    .mockRejectedValue(new Error("Keychain unavailable"));
  await expect(
    writeSessionStorage({ session, pendingRevocations: [] }),
  ).rejects.toMatchObject({ code: "SESSION_STORAGE_ERROR" });
  expect(setSecureItem).toHaveBeenCalledTimes(1);
  expect(setLocalStorageItem).not.toHaveBeenCalled();
  expect(removeLocalStorageItem).not.toHaveBeenCalled();
});

it("migrates legacy tokens only after securely writing the new session", async () => {
  const legacy: Record<string, string> = {
    user: JSON.stringify(session.user),
    token: JSON.stringify(session.authToken),
    refreshToken: JSON.stringify(session.refreshToken),
    userId: JSON.stringify(session.userId),
  };
  jest
    .mocked(getLocalStorageItem)
    .mockImplementation(async (key) => legacy[key] ?? null);
  await expect(readSessionStorage()).resolves.toEqual({
    session,
    pendingRevocations: [],
  });
  expect(setSecureItem).toHaveBeenCalledWith(
    "authSession",
    JSON.stringify({ session, pendingRevocations: [] }),
  );
  expect(removeSecureItem).toHaveBeenCalledWith("refreshToken");
  expect(jest.mocked(setSecureItem).mock.invocationCallOrder[0]).toBeLessThan(
    jest.mocked(removeLocalStorageItem).mock.invocationCallOrder[0],
  );
});

it("preserves legacy data if secure migration fails", async () => {
  const legacy: Record<string, string> = {
    user: JSON.stringify(session.user),
    token: JSON.stringify(session.authToken),
    refreshToken: JSON.stringify(session.refreshToken),
    userId: JSON.stringify(session.userId),
  };
  jest
    .mocked(getLocalStorageItem)
    .mockImplementation(async (key) => legacy[key] ?? null);
  jest
    .mocked(setSecureItem)
    .mockRejectedValue(new Error("Keychain unavailable"));
  await expect(readSessionStorage()).rejects.toMatchObject({
    code: "SESSION_STORAGE_ERROR",
  });
  expect(removeLocalStorageItem).not.toHaveBeenCalled();
});

it("does not restore an old token pair after an interrupted rotation", async () => {
  jest
    .mocked(getSecureItem)
    .mockResolvedValue(JSON.stringify({ session, pendingRevocations: [] }));
  jest
    .mocked(getLocalStorageItem)
    .mockImplementation(async (key) =>
      key === "sessionInvalidated" ? "true" : null,
    );
  await expect(readSessionStorage()).resolves.toEqual({
    session: null,
    pendingRevocations: ["refresh"],
  });
  expect(setSecureItem).toHaveBeenCalledWith(
    "authSession",
    JSON.stringify({ session: null, pendingRevocations: ["refresh"] }),
  );
});

it("does not read plaintext tokens when the secure store cannot be read", async () => {
  jest.mocked(getSecureItem).mockRejectedValue(new Error("Device locked"));
  await expect(readSessionStorage()).rejects.toMatchObject({
    code: "SESSION_STORAGE_ERROR",
  });
  expect(getLocalStorageItem).not.toHaveBeenCalled();
});
