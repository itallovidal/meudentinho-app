import { authRequestOptions, usesCookieSession } from "./transport";
import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

const LOGOUT_ATTEMPTS = 3;

export async function logout(refreshToken: string): Promise<boolean> {
  if (!refreshToken && !usesCookieSession) {
    return true;
  }
  for (let attempt = 0; attempt < LOGOUT_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        `${ENV.BASE_API_URL}/auth/logout`,
        {
          method: "POST",
          body: JSON.stringify(usesCookieSession ? {} : { refreshToken }),
          ...authRequestOptions(),
        },
      );
      if (response.ok) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}
