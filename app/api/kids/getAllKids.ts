import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { KidResponseDTO } from "@/types/dtos/user";

export async function getAllKids(
  token?: string | null,
): Promise<ResponsePayload<KidResponseDTO[]>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/kids`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token ?? null,
  );

  const payload = await parseResponse<KidResponseDTO[]>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção das crianças",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
