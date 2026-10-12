import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";
import { isApiError } from "@/types/predicates";

export async function updateToothEvent(
  eventId: string,
  token: string,
  request: ToothEventRequestDTO,
): Promise<ResponsePayload<ToothEvent>> {
  const response = await fetch(`${ENV.BASE_API_URL}/tooth-events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(request),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

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
