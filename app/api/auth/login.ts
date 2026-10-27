import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { LoginRequest, UserAuthResponseDTO } from "@/types/dtos/user";

export async function login(
  request: LoginRequest,
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  const response = await fetchWithTimeout(`${ENV.BASE_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const payload = await parseResponse<UserAuthResponseDTO>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante o login",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
