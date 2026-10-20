import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";
import type { ArticlePreviewDTO } from "@/types/dtos/article";

export async function getAllArticlePreview(): Promise<
  ResponsePayload<ArticlePreviewDTO[]>
> {
  const response = await fetchWithTimeout(
    `${ENV.BASE_API_URL}/articles/preview`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const payload = await parseResponse<ArticlePreviewDTO[]>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção dos artigos",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
