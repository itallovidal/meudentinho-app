import { isApiError } from "@/types/predicates";

const NO_RETRY_CODES = [
  "INVALID_CREDENTIALS",
  "USER_NOT_FOUND",
  "KID_NOT_LINKED_TO_PARENT",
  "KID_NOT_FOUND",
  "ARTICLES_NOT_FOUND",
  "TOOTH_EVENTS_NOT_FOUND",
  "TIMEOUT",
  "SESSION_REFRESH_FAILED",
  "SESSION_STORAGE_ERROR",
  "SESSION_CHANGED",
  "LOGOUT_FAILED",
];

export function retryQuery(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && NO_RETRY_CODES.includes(error.code)) {
    return false;
  }
  return failureCount < 3;
}
