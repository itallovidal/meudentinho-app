import { errorMessage } from "@/lib/errorMessage";
import { isApiError } from "@/types/predicates";

export const KID_NOT_LINKED_MESSAGE =
  "Este dependente não está mais vinculado à sua conta.";

export function toothEventErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isApiError(error) && error.code === "KID_NOT_LINKED_TO_PARENT") {
    return KID_NOT_LINKED_MESSAGE;
  }
  if (isApiError(error) && error.code === "TOOTH_EVENT_OUT_OF_ORDER") {
    return (
      error.message ||
      "A data não pode ser anterior ou posterior às datas das outras etapas deste dente."
    );
  }
  return errorMessage(error, fallback);
}
