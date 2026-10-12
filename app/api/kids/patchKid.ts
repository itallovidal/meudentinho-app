import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function patchKid(
  kidId: string,
  token: string,
  kidData: Partial<KidRequestDTO>,
): Promise<ResponsePayload<KidResponseDTO>> {
  const payloadToSend: Partial<KidRequestDTO> = {
    ...kidData,
    ...(kidData.birthDate
      ? { birthDate: new Date(kidData.birthDate).toISOString() }
      : {}),
  };

  const response = await fetch(
    `${ENV.BASE_API_URL}/users/kids/${kidId}`,
    {
      method: "PATCH",
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
      "Erro inesperado ocorreu durante a atualização parcial do filho",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
