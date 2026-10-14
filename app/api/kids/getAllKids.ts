import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { KidResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function getAllKids(
  token?: string | null,
): Promise<ResponsePayload<KidResponseDTO[]>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/kids`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token ?? null,
  );

  const payload = (await response.json()) as ResponsePayload<KidResponseDTO[]>;

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
  
  console.log("Get kids response status:", response.status);

  return payload;
}
