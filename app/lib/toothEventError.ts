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
  return errorMessage(error, fallback);
}
