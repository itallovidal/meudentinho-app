import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { ArticleCategoryDTO } from "@/types/dtos/article";

export async function createCategory(
  name: string,
  authToken: string,
): Promise<ResponsePayload<ArticleCategoryDTO>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/articles/categories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    },
    authToken,
  );

  const payload = await parseResponse<ArticleCategoryDTO>(response);

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a criação da categoria",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
