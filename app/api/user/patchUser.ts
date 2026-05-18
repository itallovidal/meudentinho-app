import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload, User } from "@/types/domain";
import { UserUpdateRequest } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function patchUser(
  userUpdate: UserUpdateRequest,
): Promise<ResponsePayload<User>> {
  const response = await fetch(`${ENV.BASE_API_URL}/auth/login`, {
    method: "PATCH",
    body: JSON.stringify(userUpdate),
  });

  const payload = (await response.json()) as ResponsePayload<User>;

  console.log("Patch response payload:", payload);

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Patch failed with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante o patch do usuário",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
