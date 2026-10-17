import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";
import { isApiError } from "@/types/predicates";

export async function updateToothEvent(
  eventId: string,
  token: string | null | undefined,
  request: ToothEventRequestDTO,
): Promise<ResponsePayload<ToothEvent>> {
  const response = await authFetch(`${ENV.BASE_API_URL}/tooth-events/${encodeURIComponent(eventId)}`, {
    method: "PUT",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
    },
  }, token ?? null);

  const payload = (await response.json()) as ResponsePayload<ToothEvent>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a atualização do evento",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
