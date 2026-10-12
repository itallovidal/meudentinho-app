import { ApiError, ResponsePayload } from "@/types/domain";
import { isApiError } from "@/types/predicates";
import { ENV } from "@/lib/env";

export async function getAllCategories(): Promise<
  ResponsePayload<[{ name: string; id: string }]>
> {
  console.log("Fetching /articles/categories...");

  const response = await fetch(`${ENV.BASE_API_URL}/articles/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json()) as ResponsePayload<
    [{ name: string; id: string }]
  >;

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Failed to fetch categories with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção das categorias",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
