import { refreshSession } from "./refresh";
import { usesCookieSession } from "./transport";
import { ApiError } from "@/types/domain";
import type { ResponsePayload } from "@/types/domain";
import type { UserAuthResponseDTO } from "@/types/dtos/user";
import { isApiError } from "@/types/predicates";

export async function confirmCookieSession(
  payload: ResponsePayload<UserAuthResponseDTO>,
  failureMessage = "Não foi possível manter a sessão neste navegador. Verifique se os cookies estão permitidos e tente novamente.",
): Promise<ResponsePayload<UserAuthResponseDTO>> {
  if (!usesCookieSession) return payload;
  try {
    const refreshed = await refreshSession();
    if (
      !refreshed.data?.token ||
      refreshed.data.userId !== payload.data.userId
    ) {
      throw new ApiError(failureMessage, "SESSION_COOKIE_UNAVAILABLE", 401);
    }
    return { ...payload, data: refreshed.data };
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      throw new ApiError(failureMessage, "SESSION_COOKIE_UNAVAILABLE", 401);
    }
    throw error;
  }
}
