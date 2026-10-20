import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";

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

  const payload = await parseResponse<void>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a revogação do consentimento",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
