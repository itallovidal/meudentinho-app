import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError } from "@/types/domain";
import type { ToothAlertSnooze } from "@/lib/toothMilestones";

export async function snoozeToothAlert(
  id: string,
  token: string,
): Promise<ToothAlertSnooze> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/tooth-events/${encodeURIComponent(id)}/snooze`,
    { method: "POST" },
    token,
  );
  const payload = await parseResponse<ToothAlertSnooze>(response);
  if (
    payload.status !== 200 ||
    payload.data?.id !== id ||
    typeof payload.data.snoozedUntil !== "string" ||
    !Number.isFinite(new Date(payload.data.snoozedUntil).getTime())
  ) {
    throw new ApiError(
      "Não foi possível validar o adiamento do aviso.",
      "RESPONSE_PARSE_ERROR",
    );
  }
  return payload.data;
}
