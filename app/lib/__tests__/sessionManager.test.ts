import { logout } from "@/api/auth/logout";
import { createSessionManager } from "@/lib/sessionManager.native";
import {
  markSessionInvalidated,
  readSessionStorage,
  writeSessionStorage,
} from "@/lib/sessionStorage";
import type { StoredSession } from "@/lib/sessionStorage";
import { ApiError } from "@/types/domain";

jest.mock("@/api/auth/logout", () => ({ logout: jest.fn() }));
jest.mock("@/lib/sessionStorage", () => ({
  markSessionInvalidated: jest.fn(),
  readSessionStorage: jest.fn(),
  writeSessionStorage: jest.fn(),
}));

const readMock = jest.mocked(readSessionStorage);
const writeMock = jest.mocked(writeSessionStorage);
const logoutMock = jest.mocked(logout);

const initial: StoredSession = {
  authToken: "access0",
  refreshToken: "refresh0",
  userId: "user1",
  user: { name: "Ana", email: "ana@example.com", isAdmin: false },
};

async function setup() {
  const onChange = jest.fn();
  const onClearCache = jest.fn(async () => undefined);
  const manager = createSessionManager({ onChange, onClearCache });
  await manager.restore();
  onChange.mockClear();
  return { manager, onChange, onClearCache };
}

beforeEach(() => {
  jest.resetAllMocks();
  readMock.mockResolvedValue({ session: initial, pendingRevocations: [] });
  writeMock.mockResolvedValue(undefined);
  logoutMock.mockResolvedValue(true);
});

it("serializes consecutive rotations and publishes only persisted tokens", async () => {
  const { manager, onChange } = await setup();
  let release!: () => void;
  const writing = new Promise<void>((resolve) => {
    release = resolve;
  });
  writeMock.mockReturnValueOnce(writing);
  const first = manager.refresh("access1", "refresh1", undefined, "refresh0");
  const second = manager.refresh("access2", "refresh2", undefined, "refresh1");
  for (let tick = 0; tick < 5; tick += 1) {
    await Promise.resolve();
  }
  expect(writeMock).toHaveBeenCalledTimes(1);
  expect(manager.getSession()?.refreshToken).toBe("refresh0");
  expect(onChange).not.toHaveBeenCalled();
  release();
  await Promise.all([first, second]);
  expect(
    writeMock.mock.calls.map(([state]) => state.session?.refreshToken),
  ).toEqual(["refresh1", "refresh2"]);
  expect(manager.getSession()?.refreshToken).toBe("refresh2");
});

it("does not resurrect a session when a delayed refresh arrives after logout", async () => {
  const { manager } = await setup();
  await manager.signOut();
  await expect(
    manager.refresh("access1", "refresh1", undefined, "refresh0"),
  ).rejects.toMatchObject({ code: "SESSION_CHANGED" });
  expect(manager.getSession()).toBeNull();
  expect(logoutMock).toHaveBeenCalledWith("refresh0");
  expect(logoutMock).toHaveBeenCalledWith("refresh1");
});

it("retains a manual session and reports an unsuccessful server logout", async () => {
  const { manager, onClearCache } = await setup();
  logoutMock.mockResolvedValue(false);
  await expect(manager.signOut()).rejects.toMatchObject({
    code: "LOGOUT_FAILED",
  });
  expect(manager.getSession()).toEqual(initial);
  expect(onClearCache).not.toHaveBeenCalled();
  expect(writeMock).not.toHaveBeenCalled();
});

it("persists a failed expiry revocation and retries it after restarting", async () => {
  const { manager, onClearCache } = await setup();
  logoutMock.mockResolvedValue(false);
  await expect(manager.expire("refresh0")).rejects.toMatchObject({
    code: "LOGOUT_FAILED",
  });
  expect(manager.getSession()).toBeNull();
  expect(onClearCache).toHaveBeenCalledTimes(1);
  expect(writeMock).toHaveBeenLastCalledWith({
    session: null,
    pendingRevocations: ["refresh0"],
  });
  readMock.mockResolvedValue({
    session: null,
    pendingRevocations: ["refresh0"],
  });
  logoutMock.mockResolvedValue(true);
  const restarted = await setup();
  await restarted.manager.retryPendingRevocations();
  expect(restarted.manager.getSession()).toBeNull();
  expect(writeMock).toHaveBeenLastCalledWith({
    session: null,
    pendingRevocations: [],
  });
});

it("rejects login persistence errors without publishing an unpersisted session", async () => {
  const { manager, onChange } = await setup();
  writeMock.mockRejectedValue(
    new ApiError("Storage failed", "SESSION_STORAGE_ERROR"),
  );
  await expect(
    manager.update({
      ...initial,
      authToken: "new",
      refreshToken: "new-refresh",
      userId: "other",
    }),
  ).rejects.toMatchObject({ code: "SESSION_STORAGE_ERROR" });
  expect(manager.getSession()).toEqual(initial);
  expect(onChange).not.toHaveBeenCalled();
  expect(logoutMock).toHaveBeenCalledWith("new-refresh");
});

it("invalidates the old pair when persisting a rotated pair fails", async () => {
  const { manager } = await setup();
  writeMock.mockRejectedValue(
    new ApiError("Storage failed", "SESSION_STORAGE_ERROR"),
  );
  await expect(
    manager.refresh("access1", "refresh1", undefined, "refresh0"),
  ).rejects.toMatchObject({ code: "SESSION_STORAGE_ERROR" });
  expect(markSessionInvalidated).toHaveBeenCalledTimes(1);
  expect(manager.getSession()).toBeNull();
  expect(logoutMock).toHaveBeenCalledWith("refresh0");
  expect(logoutMock).toHaveBeenCalledWith("refresh1");
});

it("does not expire a different session after account switching", async () => {
  const { manager } = await setup();
  const other = {
    ...initial,
    userId: "other",
    authToken: "other",
    refreshToken: "other-refresh",
  };
  await manager.update(other);
  await manager.expire("refresh0");
  expect(manager.getSession()).toEqual(other);
  expect(logoutMock).not.toHaveBeenCalled();
});

it("keeps the persistence queue usable after an error", async () => {
  const { manager } = await setup();
  writeMock.mockRejectedValueOnce(
    new ApiError("Storage failed", "SESSION_STORAGE_ERROR"),
  );
  await expect(manager.updateProfile({ name: "New" })).rejects.toMatchObject({
    code: "SESSION_STORAGE_ERROR",
  });
  await manager.updateProfile({ name: "Saved" });
  expect(manager.getSession()?.user.name).toBe("Saved");
});
