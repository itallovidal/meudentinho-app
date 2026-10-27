import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError } from "@/types/domain";
import type { ToothAlertSnooze } from "@/lib/toothMilestones";

export async function getToothAlertSnoozes(
  kidId: string,
  token: string,
): Promise<ToothAlertSnooze[]> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/tooth-events/kid/${encodeURIComponent(kidId)}/alert-preferences`,
    { method: "GET" },
    token,
  );
  const payload = await parseResponse<ToothAlertSnooze[]>(response);
  if (
    payload.status !== 200 ||
    !Array.isArray(payload.data) ||
    payload.data.some(
      (item) =>
        !item ||
        typeof item.id !== "string" ||
        typeof item.snoozedUntil !== "string" ||
        !Number.isFinite(new Date(item.snoozedUntil).getTime()),
    )
  ) {
    throw new ApiError(
      "Não foi possível validar os adiamentos dos avisos.",
      "RESPONSE_PARSE_ERROR",
    );
  }
  return payload.data;
}
