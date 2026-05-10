import { ENV } from "@/lib/env";
import { ResponsePayload, User } from "@/types/domain";
import { SignupDTO } from "@/types/dtos";

export async function signUpUser(
  signUpDTO: SignupDTO,
): Promise<ResponsePayload<User>> {
  const response = await fetch(`${ENV.BASE_API_URL}/user/signup`, {
    method: "POST",
    body: JSON.stringify(signUpDTO),
  });

  if (response.status !== 201) {
    throw new Error("Failed to sign up user");
  }

  const data = await response.json();

  return data;
}
