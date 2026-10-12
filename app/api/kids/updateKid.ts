import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function updateKid(
  kidId: string,
  token: string,
  kidData: KidRequestDTO,
): Promise<ResponsePayload<KidResponseDTO>> {
  const payloadToSend: KidRequestDTO = {
    ...kidData,
    birthDate: new Date(kidData.birthDate).toISOString(),
  };

  const response = await fetch(
    `${ENV.BASE_API_URL}/users/kids/${kidId}`,
    {
      method: "PUT",
      body: JSON.stringify(payloadToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const payload = (await response.json()) as ResponsePayload<KidResponseDTO>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a atualização do dependente",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
