import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { ToothEvent } from "@/types/teeth";
import { isApiError } from "@/types/predicates";

export async function getToothEventsByKid(
  kidId: string,
  token?: string | null,
): Promise<ResponsePayload<ToothEvent[]>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/tooth-events/kid/${kidId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token ?? null,
  );

  const payload = (await response.json()) as ResponsePayload<ToothEvent[]>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção dos eventos",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return { ...payload, data: payload.data ?? [] };
}
