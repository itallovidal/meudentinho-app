import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { UserAuthResponseDTO } from "@/types/dtos/user";

export async function refreshSession(
  refreshToken: string,
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  const response = await fetchWithTimeout(`${ENV.BASE_API_URL}/auth/refresh`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await parseResponse<UserAuthResponseDTO>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a renovação da sessão",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
