import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export async function deleteKid(
  kidId: string,
  token: string,
): Promise<ResponsePayload<void>> {
  const response = await fetch(
    `${ENV.BASE_API_URL}/users/kids/${kidId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const payload = (await response.json()) as ResponsePayload<void>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a exclusão do dependente",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
