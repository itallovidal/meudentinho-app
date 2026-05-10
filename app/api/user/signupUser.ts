import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload, User } from "@/types/domain";
import { SignupDTO, UserAuthResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function signupUser(
  signUpDTO: SignupDTO,
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  const response = await fetch(`${ENV.BASE_API_URL}/user/signup`, {
    method: "POST",
    body: JSON.stringify(signUpDTO),
  });

  const payload =
    (await response.json()) as ResponsePayload<UserAuthResponseDTO>;

  console.log("Signup response payload:", payload);

  if (payload.status !== 201 && isApiError(payload.error)) {
    console.log("Signup failed with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante o registro",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
