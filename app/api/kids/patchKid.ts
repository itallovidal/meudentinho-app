import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

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

  const payload = (await response.json()) as ResponsePayload<KidResponseDTO>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a atualização parcial do dependente",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
