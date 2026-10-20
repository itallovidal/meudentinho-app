import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { KidResponseDTO, KidRequestDTO } from "@/types/dtos/user";

export async function createKid(
  kidDTO: KidRequestDTO,
  token?: string | null,
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
    token ?? null,
  );

  const payload = await parseResponse<KidResponseDTO>(response);

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a criação da criança",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
