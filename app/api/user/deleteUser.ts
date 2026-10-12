import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export async function deleteUser(
  userId: string,
  token: string,
): Promise<ResponsePayload<void>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = (await response.json()) as ResponsePayload<void>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a exclusão do usuário",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
