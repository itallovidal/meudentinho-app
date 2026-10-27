import { ApiError } from "@/types/domain";

export const REQUEST_TIMEOUT_MS = 15_000;

export const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";

export const TIMEOUT_ERROR_MESSAGE =
  "O servidor demorou muito para responder. Tente novamente.";

export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) {
      throw new ApiError(TIMEOUT_ERROR_MESSAGE, "TIMEOUT", undefined, error);
    }
    throw new ApiError(NETWORK_ERROR_MESSAGE, "NETWORK_ERROR", undefined, error);
  } finally {
    clearTimeout(timer);
  }
}
