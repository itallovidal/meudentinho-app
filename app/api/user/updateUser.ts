import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload, User } from "@/types/domain";
import { UserUpdateRequest } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function updateUser(
  userUpdate: UserUpdateRequest,
): Promise<ResponsePayload<User>> {
  const response = await fetch(`${ENV.BASE_API_URL}/auth/login`, {
    method: "PUT",
    body: JSON.stringify(userUpdate),
  });

  const payload = (await response.json()) as ResponsePayload<User>;

  console.log("Update response payload:", payload);

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Update failed with error:", payload.error);
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
