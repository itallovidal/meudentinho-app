import { ApiError } from "./domain";

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error &&
    typeof (error as ApiError).message === "string" &&
    typeof (error as ApiError).code === "string"
  );
}
