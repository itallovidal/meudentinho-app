import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { LoginRequest, UserAuthResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function login(
  request: LoginRequest,
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  const response = await fetch(`${ENV.BASE_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  let payload: ResponsePayload<UserAuthResponseDTO> | null = null;
  try {
    payload = (await response.json()) as ResponsePayload<UserAuthResponseDTO>;
  } catch {
    throw new ApiError(
      "Erro inesperado ocorreu durante o login",
      "INTERNAL_SERVER_ERROR",
    );
  }

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante o login",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
