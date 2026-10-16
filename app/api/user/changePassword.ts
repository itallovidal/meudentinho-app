import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { UserAuthResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function changePassword(
  userId: string,
  token: string,
  passwords: { currentPassword: string; newPassword: string },
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/${userId}/password`,
    {
      method: "PATCH",
      body: JSON.stringify(passwords),
      headers: {
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = (await response.json()) as ResponsePayload<UserAuthResponseDTO>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a troca da senha",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
