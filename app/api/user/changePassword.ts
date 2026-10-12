import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload, User } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export async function changePassword(
  userId: string,
  token: string,
  passwords: { currentPassword: string; newPassword: string },
): Promise<ResponsePayload<User>> {
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

  const payload = (await response.json()) as ResponsePayload<User>;

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
