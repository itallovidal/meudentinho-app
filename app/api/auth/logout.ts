import { ENV } from "@/lib/env";

export async function logout(refreshToken: string): Promise<void> {
  try {
    await fetch(`${ENV.BASE_API_URL}/auth/logout`, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return;
  }
}
