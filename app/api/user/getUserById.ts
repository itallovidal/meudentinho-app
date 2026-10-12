import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload, BasicUser } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export async function getUserById(
  token: string,
  userId: string,
): Promise<ResponsePayload<BasicUser>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = (await response.json()) as ResponsePayload<BasicUser>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ao buscar dados do usuário",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
