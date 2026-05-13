import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import { KidResponseDTO, KidRequestDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function getAllKids(userId: string, token: string): Promise<ResponsePayload<KidResponseDTO[]>> {
  const response = await fetch(`${ENV.BASE_API_URL}/users/${userId}/kids`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json()) as ResponsePayload<KidResponseDTO[]>;

  console.log("Get kids response payload:", payload);

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Get kids failed with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção das crianças",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}

export async function createKid(
  kidDTO: KidRequestDTO,
  userId: string,
  token: string
): Promise<ResponsePayload<KidResponseDTO>> {
  const response = await fetch(`${ENV.BASE_API_URL}/users/${userId}/kids`, {
    method: "POST",
    body: JSON.stringify(kidDTO),
      headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json()) as ResponsePayload<KidResponseDTO>;

  console.log("Kid response payload:", payload);

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Kid failed with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a criação da criança",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
