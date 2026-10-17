import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export async function revokeKidConsent(
  kidId: string,
  token?: string | null,
): Promise<ResponsePayload<void>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/users/kids/${kidId}/consent/revoke`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token ?? null,
  );

  const payload = (await response.json()) as ResponsePayload<void>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a revogação do consentimento",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
