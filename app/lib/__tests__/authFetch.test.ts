/// <reference types="jest" />
import { refreshSession } from "@/api/auth/refresh";
import { authFetch, configureAuthFetch } from "@/lib/authFetch";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { retryQuery } from "@/lib/queryRetry";
import { ApiError } from "@/types/domain";

jest.mock("@/lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

jest.mock("@/api/auth/refresh", () => ({
  refreshSession: jest.fn(),
}));

const fetchMock = fetchWithTimeout as jest.MockedFunction<
  typeof fetchWithTimeout
>;
const refreshMock = refreshSession as jest.MockedFunction<
  typeof refreshSession
>;

function unauthorizedResponse(): Response {
  return {
    status: 401,
    json: async () => ({
      status: 401,
      error: {
        message: "Sessão expirada.",
        code: "INVALID_CREDENTIALS",
      },
    }),
  } as unknown as Response;
}

describe("authFetch session expiry", () => {
  afterEach(() => {
    configureAuthFetch(null);
    jest.clearAllMocks();
  });

  it("does not expire an anonymous request", async () => {
    const onSessionExpired = jest.fn();
    fetchMock.mockResolvedValue(unauthorizedResponse());
    configureAuthFetch({
      getSession: () => ({ authToken: null, refreshToken: null }),
      onSessionRefreshed: jest.fn(),
      onSessionExpired,
    });

    await expect(authFetch("/users/kids")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("expires a request that had a session but no refresh token", async () => {
    const onSessionExpired = jest.fn();
    fetchMock.mockResolvedValue(unauthorizedResponse());
    configureAuthFetch({
      getSession: () => ({ authToken: "access-token", refreshToken: null }),
      onSessionRefreshed: jest.fn(),
      onSessionExpired,
    });

    await expect(authFetch("/users/kids")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("expires when the retry after a refresh is still unauthorized", async () => {
    let session = {
      authToken: "old-token",
      refreshToken: "refresh-token",
    };
    const onSessionExpired = jest.fn();
    const onSessionRefreshed = jest.fn(async () => {
      session = { authToken: "new-token", refreshToken: "new-refresh" };
    });
    fetchMock.mockResolvedValue(unauthorizedResponse());
    refreshMock.mockResolvedValue({
      status: 200,
      data: {
        name: "Ana",
        token: "new-token",
        refreshToken: "new-refresh",
        userId: "user-1",
        isAdmin: false,
      },
    });
    configureAuthFetch({
      getSession: () => session,
      onSessionRefreshed,
      onSessionExpired,
    });

    await expect(authFetch("/users/kids")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    expect(refreshMock).toHaveBeenCalledWith("refresh-token");
    expect(onSessionRefreshed).toHaveBeenCalledWith(
      "new-token",
      "new-refresh",
      { name: "Ana", isAdmin: false, userId: "user-1" },
      "refresh-token",
    );
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });
});

describe("authFetch refresh coordination", () => {
  afterEach(() => {
    configureAuthFetch(null);
    jest.resetAllMocks();
  });

  it("discards an old account's response after the session changes", async () => {
    let session = { authToken: "old", refreshToken: "r0", generation: 0 };
    let complete!: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        complete = resolve;
      }),
    );
    configureAuthFetch({
      getSession: () => session,
      onSessionRefreshed: jest.fn(),
      onSessionExpired: jest.fn(),
    });
    const request = authFetch("/one");
    session = {
      authToken: "another",
      refreshToken: "another-refresh",
      generation: 1,
    };
    complete({ status: 200 } as Response);
    await expect(request).rejects.toMatchObject({ code: "SESSION_CHANGED" });
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("shares one refresh and waits for persistence before retrying requests", async () => {
    let session = { authToken: "old", refreshToken: "r0" };
    let releasePersistence!: () => void;
    const persistence = new Promise<void>((resolve) => {
      releasePersistence = resolve;
    });
    const onSessionRefreshed = jest.fn(async () => {
      await persistence;
      session = { authToken: "new", refreshToken: "r1" };
    });
    fetchMock.mockImplementation(async (_input, init) => {
      const token = (init?.headers as Record<string, string>).Authorization;
      return token === "Bearer old"
        ? unauthorizedResponse()
        : ({ status: 200 } as Response);
    });
    refreshMock.mockResolvedValue({
      status: 200,
      data: {
        token: "new",
        refreshToken: "r1",
        name: "Ana",
        userId: "u1",
        isAdmin: false,
      },
    });
    configureAuthFetch({
      getSession: () => session,
      onSessionRefreshed,
      onSessionExpired: jest.fn(),
    });
    const first = authFetch("/one");
    const second = authFetch("/two");
    for (let tick = 0; tick < 10; tick += 1) {
      await Promise.resolve();
    }
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    releasePersistence();
    await expect(Promise.all([first, second])).resolves.toEqual([
      { status: 200 },
      { status: 200 },
    ]);
    expect(onSessionRefreshed).toHaveBeenCalledTimes(1);
  });

  it("does not turn a transient refresh error into session expiry or an automatic query retry", async () => {
    const onSessionExpired = jest.fn();
    fetchMock.mockResolvedValue(unauthorizedResponse());
    refreshMock.mockRejectedValue(new TypeError("Network request failed"));
    configureAuthFetch({
      getSession: () => ({ authToken: "old", refreshToken: "r0" }),
      onSessionRefreshed: jest.fn(),
      onSessionExpired,
    });
    const failure = await authFetch("/one").catch((error: unknown) => error);
    expect(failure).toMatchObject({ code: "SESSION_REFRESH_FAILED" });
    expect(retryQuery(0, failure)).toBe(false);
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("does not expire a new account because an old refresh was rejected", async () => {
    let session = { authToken: "old", refreshToken: "r0", generation: 0 };
    let rejectRefresh!: (error: Error) => void;
    const refresh = new Promise<never>((_resolve, reject) => {
      rejectRefresh = reject;
    });
    refreshMock.mockReturnValue(refresh);
    fetchMock.mockResolvedValue(unauthorizedResponse());
    const onSessionExpired = jest.fn();
    configureAuthFetch({
      getSession: () => session,
      onSessionRefreshed: jest.fn(),
      onSessionExpired,
    });
    const request = authFetch("/one");
    for (let tick = 0; tick < 10; tick += 1) {
      await Promise.resolve();
    }
    session = {
      authToken: "another",
      refreshToken: "another-refresh",
      generation: 1,
    };
    rejectRefresh(new ApiError("Expired", "INVALID_CREDENTIALS", 401));
    await expect(request).rejects.toMatchObject({ code: "SESSION_CHANGED" });
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});
