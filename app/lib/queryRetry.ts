import { ApiError } from "@/types/domain";

const NO_RETRY_CODES = ["INVALID_CREDENTIALS", "KID_NOT_LINKED_TO_PARENT"];

export function retryQuery(failureCount: number, error: unknown): boolean {
  if (
    error instanceof ApiError &&
    NO_RETRY_CODES.includes(error.code as string)
  ) {
    return false;
  }
  return failureCount < 3;
}
