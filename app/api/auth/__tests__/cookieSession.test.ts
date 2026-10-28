import { changePassword } from "@/api/user/changePassword";
import { login } from "@/api/auth/login";
import { signup } from "@/api/auth/signup";
import { refreshSession } from "@/api/auth/refresh";
import { logout } from "@/api/auth/logout";
import { authFetch, configureAuthFetch } from "@/lib/authFetch";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

jest.mock("react-native", () => ({ Platform: { OS: "web" } }));
jest.mock("@/lib/env", () => ({
  ENV: { BASE_API_URL: "https://api.example.com" },
}));
jest.mock("@/lib/fetchWithTimeout", () => ({ fetchWithTimeout: jest.fn() }));
const request = jest.mocked(fetchWithTimeout);
function response(status = 200) {
  return {
    status,
    ok: status < 400,
    json: async () => ({
      status,
      data: {
        token: "new",
        userId: "user",
        name: "Ana",
        email: "ana@example.com",
        isAdmin: false,
      },
    }),
  } as Response;
}
beforeEach(() => {
  jest.clearAllMocks();
  request.mockResolvedValue(response());
});
afterEach(() => configureAuthFetch(null));

it("uses credentialed cookie transport for login and signup", async () => {
  await login({ email: "ana@example.com", password: "password" });
  request.mockResolvedValueOnce(response(201));
  await signup({
    name: "Ana",
    email: "ana@example.com",
    password: "password",
    passwordConfirmation: "password",
    accepted: true,
    acceptedPolicyVersion: "1",
    acceptedAt: "2026-10-28",
    isLegalGuardian: true,
    guardianBirthDate: "1990-01-01",
  });
  for (const [, options] of request.mock.calls) {
    expect(options).toMatchObject({
      credentials: "include",
      headers: { "X-Auth-Transport": "cookie" },
    });
  }
});

it("never sends refresh credentials in JSON on web refresh or logout", async () => {
  await refreshSession("must-not-leak");
  await logout("must-not-leak");
  for (const [, options] of request.mock.calls) {
    expect(options).toMatchObject({ body: "{}", credentials: "include" });
  }
});

it("refreshes an authenticated session with a null refresh token and retries with Bearer", async () => {
  let token = "old";
  const expired = jest.fn();
  configureAuthFetch({
    getSession: () => ({ authToken: token, refreshToken: null, generation: 1 }),
    onSessionRefreshed: async (next, refresh, _info, expected) => {
      expect(refresh).toBeNull();
      expect(expected).toBe("old");
      token = next;
    },
    onSessionExpired: expired,
  });
  request.mockResolvedValueOnce(response(401));
  await authFetch("https://api.example.com/users/user");
  expect(request).toHaveBeenCalledTimes(3);
  expect(request.mock.calls[1][1]).toMatchObject({
    body: "{}",
    credentials: "include",
  });
  expect(request.mock.calls[2][1]).toMatchObject({
    headers: { Authorization: "Bearer new" },
  });
  expect(expired).not.toHaveBeenCalled();
});

it("updates the cookie when changing password without sending it as business auth", async () => {
  await changePassword("user", "access", {
    currentPassword: "old-password",
    newPassword: "new-password",
  });
  expect(request).toHaveBeenCalledWith(
    "https://api.example.com/users/user/password",
    expect.objectContaining({
      credentials: "include",
      headers: expect.objectContaining({
        Authorization: "Bearer access",
        "X-Auth-Transport": "cookie",
      }),
    }),
  );
});

it("only completes login after the browser sends the new cookie back", async () => {
  request.mockResolvedValueOnce({
    ...response(),
    json: async () => ({
      status: 200,
      data: { token: "login-token", userId: "user" },
    }),
  } as Response);
  const payload = await login({
    email: "ana@example.com",
    password: "password",
  });
  expect(payload.data.token).toBe("new");
  expect(request.mock.calls.map(([url]) => url)).toEqual([
    "https://api.example.com/auth/login",
    "https://api.example.com/auth/refresh",
  ]);
});

it("rejects an apparently successful login when the browser drops the refresh cookie", async () => {
  request.mockResolvedValueOnce(response()).mockResolvedValueOnce({
    status: 401,
    ok: false,
    json: async () => ({
      status: 401,
      error: { code: "INVALID_CREDENTIALS", message: "Sem cookie" },
    }),
  } as Response);
  await expect(
    login({ email: "ana@example.com", password: "password" }),
  ).rejects.toMatchObject({ code: "SESSION_COOKIE_UNAVAILABLE" });
});

it("explains that signup succeeded when cookies could not establish the session", async () => {
  request.mockResolvedValueOnce(response(201)).mockResolvedValueOnce({
    status: 401,
    ok: false,
    json: async () => ({
      status: 401,
      error: { code: "INVALID_CREDENTIALS", message: "Sem cookie" },
    }),
  } as Response);
  await expect(
    signup({
      name: "Ana",
      email: "ana@example.com",
      password: "password",
      passwordConfirmation: "password",
      accepted: true,
      acceptedPolicyVersion: "1",
      acceptedAt: "2026-10-28",
      isLegalGuardian: true,
      guardianBirthDate: "1990-01-01",
    }),
  ).rejects.toMatchObject({
    code: "SESSION_COOKIE_UNAVAILABLE",
    message: expect.stringContaining("A conta foi criada"),
  });
});

it("does not publish another account when an existing cookie was not replaced", async () => {
  request.mockResolvedValueOnce({
    ...response(),
    json: async () => ({
      status: 200,
      data: { token: "login-token", userId: "another-user" },
    }),
  } as Response);
  await expect(
    login({ email: "other@example.com", password: "password" }),
  ).rejects.toMatchObject({ code: "SESSION_COOKIE_UNAVAILABLE" });
});
