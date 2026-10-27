import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";

export async function createToothEvent(
  request: ToothEventRequestDTO,
  token?: string | null,
): Promise<ResponsePayload<ToothEvent>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/tooth-events`,
    {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
      },
    },
    token ?? null,
  );

  const payload = await parseResponse<ToothEvent>(response);

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante o registro do evento",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
