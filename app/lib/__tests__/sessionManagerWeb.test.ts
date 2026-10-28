import { createSessionManager } from "@/lib/sessionManager.web";
import { refreshSession } from "@/api/auth/refresh";
import { logout } from "@/api/auth/logout";
import { ApiError } from "@/types/domain";

jest.mock("@/api/auth/refresh", () => ({ refreshSession: jest.fn() }));
jest.mock("@/api/auth/logout", () => ({ logout: jest.fn() }));
jest.mock("@/lib/sessionStorage", () => ({
  readSessionStorage: jest.fn(async () => ({
    session: null,
    pendingRevocations: [],
  })),
}));

const data = {
  token: "access",
  userId: "user",
  name: "Ana",
  email: "ana@example.com",
  isAdmin: false,
};
const session = {
  authToken: "old",
  refreshToken: null,
  userId: "user",
  user: { name: "Ana", email: "ana@example.com", isAdmin: false },
};
let manager: ReturnType<typeof createSessionManager>;
let onChange: jest.Mock;
let onClearCache: jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  onChange = jest.fn();
  onClearCache = jest.fn(async () => {});
  manager = createSessionManager({ onChange, onClearCache });
  jest.mocked(refreshSession).mockResolvedValue({ status: 200, data });
  jest.mocked(logout).mockResolvedValue(true);
});

it("restores full identity from the cookie without persisting refresh", async () => {
  await manager.restore();
  expect(refreshSession).toHaveBeenCalledWith();
  expect(manager.getSession()).toEqual({ ...session, authToken: "access" });
});

it("starts anonymously when the server rejects the cookie", async () => {
  jest
    .mocked(refreshSession)
    .mockRejectedValue(new ApiError("expired", "INVALID_CREDENTIALS", 401));
  await manager.restore();
  expect(manager.getSession()).toBeNull();
  expect(onChange).toHaveBeenCalledWith(null, false);
});

it("keeps transient restore errors distinct from session expiration and allows retry", async () => {
  jest
    .mocked(refreshSession)
    .mockRejectedValueOnce(new ApiError("offline", "NETWORK_ERROR"));
  await expect(manager.restore()).rejects.toMatchObject({
    code: "NETWORK_ERROR",
  });
  expect(onChange).not.toHaveBeenCalled();
  await manager.restore();
  expect(manager.getSession()?.authToken).toBe("access");
});

it("renews a memory-only session and rejects stale updates after logout", async () => {
  await manager.update(session);
  await manager.refresh("new", null, { name: "Novo" }, "old");
  expect(manager.getSession()?.authToken).toBe("new");
  await manager.signOut();
  expect(logout).toHaveBeenCalledWith("");
  expect(manager.getSession()).toBeNull();
  await expect(
    manager.refresh("late", null, undefined, "new"),
  ).rejects.toMatchObject({ code: "SESSION_CHANGED" });
});

it("does not claim a successful logout if server revocation fails", async () => {
  await manager.update(session);
  jest.mocked(logout).mockResolvedValue(false);
  await expect(manager.signOut()).rejects.toMatchObject({
    code: "LOGOUT_FAILED",
  });
  expect(manager.getSession()).toEqual(session);
});

it("does not publish an old bootstrap response after a new login", async () => {
  let finish!: (value: Awaited<ReturnType<typeof refreshSession>>) => void;
  jest.mocked(refreshSession).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const restoring = manager.restore();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const updating = manager.update(session);
  finish({ status: 200, data });
  await Promise.all([restoring, updating]);
  expect(manager.getSession()).toEqual(session);
});

it("clears memory and revokes the cookie on forced session expiration", async () => {
  await manager.update(session);
  await manager.expire();
  expect(logout).toHaveBeenCalledWith("");
  expect(manager.getSession()).toBeNull();
  expect(onChange).toHaveBeenLastCalledWith(null, true);
});
