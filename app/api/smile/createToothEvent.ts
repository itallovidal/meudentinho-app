import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";
import { isApiError } from "@/types/predicates";

export async function createToothEvent(
  request: ToothEventRequestDTO,
  token?: string | null,
): Promise<ResponsePayload<ToothEvent>> {
  const response = await authFetch(`${ENV.BASE_API_URL}/tooth-events`, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
    },
  }, token ?? null);

  const payload = (await response.json()) as ResponsePayload<ToothEvent>;

  if (payload.status !== 201 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante o registro do evento",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
