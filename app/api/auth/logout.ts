import { ENV } from "@/lib/env";

const LOGOUT_ATTEMPTS = 3;

export async function logout(refreshToken: string): Promise<boolean> {
  if (!refreshToken) {
    return true;
  }
  for (let attempt = 0; attempt < LOGOUT_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${ENV.BASE_API_URL}/auth/logout`, {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}
