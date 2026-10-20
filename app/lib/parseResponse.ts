import { ApiError, ResponsePayload } from "@/types/domain";
import { isApiError } from "@/types/predicates";

const INVALID_RESPONSE_MESSAGE =
  "Resposta inválida do servidor. Tente novamente.";

export async function parseResponse<T>(
  response: Response,
): Promise<ResponsePayload<T>> {
  let parsed: unknown;

  try {
    parsed = await response.json();
  } catch {
    throw new ApiError(
      INVALID_RESPONSE_MESSAGE,
      "RESPONSE_PARSE_ERROR",
      response.status,
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as ResponsePayload<T>).status !== "number"
  ) {
    throw new ApiError(
      INVALID_RESPONSE_MESSAGE,
      "RESPONSE_PARSE_ERROR",
      response.status,
    );
  }

  const payload = parsed as ResponsePayload<T>;

  if (isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code, payload.status);
  }

  return payload;
}
