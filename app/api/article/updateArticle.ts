import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, Article, ResponsePayload } from "@/types/domain";
import type { ArticleRequestDTO } from "@/types/dtos/article";

export async function updateArticle(
  id: string,
  articleRequestDTO: ArticleRequestDTO,
  authToken: string,
): Promise<ResponsePayload<Article>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/articles/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(articleRequestDTO),
    },
    authToken,
  );

  const payload = await parseResponse<Article>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a atualização do artigo",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
