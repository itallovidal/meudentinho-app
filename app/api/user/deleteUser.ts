import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";

export async function deleteUser(
  userId: string,
  token: string,
  currentPassword: string,
): Promise<ResponsePayload<void>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/${userId}`,
    {
      method: "DELETE",
      body: JSON.stringify({ currentPassword }),
      headers: {
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = await parseResponse<void>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a exclusão do usuário",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
