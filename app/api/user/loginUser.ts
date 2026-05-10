import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload, User } from "@/types/domain";
import { LoginDTO } from "@/types/dtos";
import { isApiError } from "@/types/predicates";

export async function loginUser(
  loginDTO: LoginDTO,
): Promise<ResponsePayload<User>> {
  const response = await fetch(`${ENV.BASE_API_URL}/user/login`, {
    method: "POST",
    body: JSON.stringify(loginDTO),
  });

  const payload = await response.json();

  console.log("Login response payload:", payload);

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Login failed with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "An unexpected error occurred during login",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
