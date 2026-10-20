import { isApiError } from "@/types/predicates";

export function errorMessage(error: unknown, fallback: string): string {
  if (isApiError(error) && error.message) {
    return error.message;
  }
  return fallback;
}
