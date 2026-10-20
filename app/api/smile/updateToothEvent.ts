import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";

export async function updateToothEvent(
  eventId: string,
  token: string | null | undefined,
  request: ToothEventRequestDTO,
): Promise<ResponsePayload<ToothEvent>> {
  const httpResponse = await authFetch(
    `${ENV.BASE_API_URL}/tooth-events/${encodeURIComponent(eventId)}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
      },
    },
    token ?? null,
  );

  const payload = await parseResponse<ToothEvent>(httpResponse);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a atualização do evento",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
