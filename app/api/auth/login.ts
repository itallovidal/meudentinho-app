import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import { LoginRequest, UserAuthResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function login(
  request: LoginRequest,
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  const response = await fetch(`${ENV.BASE_API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(request),
  });

  const payload =
    (await response.json()) as ResponsePayload<UserAuthResponseDTO>;

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
