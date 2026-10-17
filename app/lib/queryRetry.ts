import { ApiError } from "@/types/domain";

const NO_RETRY_CODES = [
  "INVALID_CREDENTIALS",
  "USER_NOT_FOUND",
  "KID_NOT_LINKED_TO_PARENT",
  "KID_NOT_FOUND",
  "ARTICLES_NOT_FOUND",
  "TOOTH_EVENTS_NOT_FOUND",
];

export function retryQuery(failureCount: number, error: unknown): boolean {
  if (
    error instanceof ApiError &&
    NO_RETRY_CODES.includes(error.code as string)
  ) {
    return false;
  }
  return failureCount < 3;
}
