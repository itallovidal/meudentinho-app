import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { ArticleRequestDTO } from "@/types/dtos/article";
import { isApiError } from "@/types/predicates";

export async function createNewArticle(
  articleRequestDTO: ArticleRequestDTO,
  authToken: string,
) {
  const response = await authFetch(`${ENV.BASE_API_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(articleRequestDTO),
  }, authToken);

  const payload = (await response.json()) as ResponsePayload<{}>;

  if (payload.status !== 201 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 201) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a criação do artigo",
      "INTERNAL_SERVER_ERROR",
    );
  }
}
