import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { ArticleCategoryDTO } from "@/types/dtos/article";

export async function getAllCategories(): Promise<
  ResponsePayload<ArticleCategoryDTO[]>
> {
  const response = await fetchWithTimeout(
    `${ENV.BASE_API_URL}/articles/categories`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const payload = await parseResponse<ArticleCategoryDTO[]>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção das categorias",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
