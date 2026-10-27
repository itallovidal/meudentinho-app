import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload, User } from "@/types/domain";

export async function patchUser(
  userId: string,
  token: string,
  userPatch: Partial<{ name: string; email: string; password: string }>,
  currentPassword?: string | null,
): Promise<ResponsePayload<User>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        currentPassword
          ? { ...userPatch, currentPassword }
          : userPatch,
      ),
      headers: {
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = await parseResponse<User>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a atualização do usuário",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
