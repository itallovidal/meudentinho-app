import { ApiError, ResponsePayload } from "@/types/domain";
import { isApiError } from "@/types/predicates";
import { ENV } from "@/lib/env";
import { ArticlePreviewDTO } from "@/types/dtos/article";

export async function getAllArticlePreview(): Promise<
  ResponsePayload<ArticlePreviewDTO[]>
> {
  console.log("Fetching /articles/preview...");
  const response = await fetch(`${ENV.BASE_API_URL}/articles/preview`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json()) as ResponsePayload<
    ArticlePreviewDTO[]
  >;

  if (payload.status !== 200 && isApiError(payload.error)) {
    console.log("Failed to fetch articles with error:", payload.error);
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção dos artigos",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
