import { confirmCookieSession } from "./confirmCookieSession";
import { authRequestOptions } from "./transport";
import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { SignupRequest, UserAuthResponseDTO } from "@/types/dtos/user";

export async function signup(
  SignupRequest: SignupRequest,
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  const response = await fetchWithTimeout(`${ENV.BASE_API_URL}/auth/signup`, {
    method: "POST",
    ...authRequestOptions(),
    body: JSON.stringify(SignupRequest),
  });

  const payload = await parseResponse<UserAuthResponseDTO>(response);

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante o registro",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return confirmCookieSession(
    payload,
    "A conta foi criada, mas não foi possível manter a sessão neste navegador. Verifique se os cookies estão permitidos e entre pela tela de login.",
  );
}
