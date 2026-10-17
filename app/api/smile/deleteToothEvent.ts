import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export async function deleteToothEvent(
  eventId: string,
  token: string,
): Promise<ResponsePayload<{ message: string }>> {
  const response = await authFetch(`${ENV.BASE_API_URL}/tooth-events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  }, token);

  const payload = (await response.json()) as ResponsePayload<{ message: string }>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a exclusão do evento",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
