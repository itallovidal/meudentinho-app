import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload, User } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export async function patchUser(
  userId: string,
  token: string,
  userPatch: Partial<{ name: string; email: string; password: string }>,
): Promise<ResponsePayload<User>> {
  const response = await fetch(
    `${ENV.BASE_API_URL}/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(userPatch),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const payload = (await response.json()) as ResponsePayload<User>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a atualização do usuário",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
