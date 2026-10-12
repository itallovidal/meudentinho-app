import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { KidResponseDTO, KidRequestDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function createKid(
  kidDTO: KidRequestDTO,
  token: string,
): Promise<ResponsePayload<KidResponseDTO>> {
  const payloadToSend: KidRequestDTO = {
    ...kidDTO,
    birthDate: new Date(kidDTO.birthDate).toISOString(),
  };

  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/kids`,
    {
      method: "POST",
      body: JSON.stringify(payloadToSend),
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = (await response.json()) as ResponsePayload<KidResponseDTO>;

  if (payload.status !== 201 && isApiError(payload.error)) {
    console.log("Kid failed with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a criação da criança",
      "INTERNAL_SERVER_ERROR",
    );
  }

  console.log("Kid response status:", response.status);

  return payload;
}
