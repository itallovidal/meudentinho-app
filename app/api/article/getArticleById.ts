import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, Article, ResponsePayload } from "@/types/domain";

export async function getArticleById(
  id: string,
): Promise<ResponsePayload<Article>> {
  const response = await fetchWithTimeout(
    `${ENV.BASE_API_URL}/articles/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const payload = await parseResponse<Article>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção do artigo",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
