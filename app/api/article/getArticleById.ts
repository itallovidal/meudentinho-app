import { ENV } from "@/lib/env";
import { ApiError, Article, ResponsePayload } from "@/types/domain";
import { isApiError } from "@/types/predicates";

export async function getArticleById(
  id: string,
): Promise<ResponsePayload<Article>> {
  console.log(`Fetching /articles/${id}...`);
  const response = await fetch(`${ENV.BASE_API_URL}/articles/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json()) as ResponsePayload<Article>;

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Failed to fetch article with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção do artigo",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
