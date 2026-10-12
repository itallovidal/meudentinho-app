import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { KidResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";


export async function getKidById(
  kidId: string,
  token: string,
): Promise<ResponsePayload<KidResponseDTO>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/kids/${kidId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = (await response.json()) as ResponsePayload<KidResponseDTO>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ao buscar dados do dependente",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
