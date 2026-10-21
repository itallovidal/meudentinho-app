/// <reference types="jest" />
import { refreshSession } from "@/api/auth/refresh";
import { authFetch, configureAuthFetch } from "@/lib/authFetch";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

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
    );
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });
});
