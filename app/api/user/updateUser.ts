import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload, User } from "@/types/domain";
import { UserUpdateRequest } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function updateUser(
  userId: string,
  token: string,
  userUpdate: UserUpdateRequest,
): Promise<ResponsePayload<User>> {
  const response = await fetch(
    `${ENV.BASE_API_URL}/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(userUpdate),
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
      "Erro inesperado ocorreu durante o update do usuário",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
