import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";

export async function updateKid(
  kidId: string,
  token: string | null | undefined,
  kidData: KidRequestDTO,
): Promise<ResponsePayload<KidResponseDTO>> {
  const payloadToSend: KidRequestDTO = {
    ...kidData,
    birthDate: new Date(kidData.birthDate).toISOString(),
  };

  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/kids/${kidId}`,
    {
      method: "PUT",
      body: JSON.stringify(payloadToSend),
      headers: {
        "Content-Type": "application/json",
      },
    },
    token ?? null,
  );

  const payload = await parseResponse<KidResponseDTO>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a atualização do dependente",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
