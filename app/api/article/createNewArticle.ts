import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError } from "@/types/domain";
import type { ArticleRequestDTO } from "@/types/dtos/article";

export async function createNewArticle(
  articleRequestDTO: ArticleRequestDTO,
  authToken: string,
) {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/articles`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(articleRequestDTO),
    },
    authToken,
  );

  const payload = await parseResponse<unknown>(response);

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a criação do artigo",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }
}
