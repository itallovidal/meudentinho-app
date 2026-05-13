import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import { LoginDTO, UserAuthResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function loginUser(
  loginDTO: LoginDTO,
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  const response = await fetch(`${ENV.BASE_API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(loginDTO),
  });

  const payload =
    (await response.json()) as ResponsePayload<UserAuthResponseDTO>;

  console.log("Login response payload:", payload);

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Login failed with error:", payload.error);
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
