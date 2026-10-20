import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";

export async function patchKid(
  kidId: string,
  token: string | null | undefined,
  kidData: Partial<KidRequestDTO>,
): Promise<ResponsePayload<KidResponseDTO>> {
  const payloadToSend: Partial<KidRequestDTO> = {
    ...kidData,
    ...(kidData.birthDate
      ? { birthDate: new Date(kidData.birthDate).toISOString() }
      : {}),
  };

  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/kids/${kidId}`,
    {
      method: "PATCH",
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
      "Erro inesperado ocorreu durante a atualização parcial do dependente",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
