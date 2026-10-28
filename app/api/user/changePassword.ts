import { authRequestOptions } from "@/api/auth/transport";
import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { UserAuthResponseDTO } from "@/types/dtos/user";

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
      ...authRequestOptions(),
    },
    token,
  );

  const payload = await parseResponse<UserAuthResponseDTO>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a troca da senha",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
