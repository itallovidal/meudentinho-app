import { ENV } from "@/lib/env";
import { ApiError, ResponsePayload } from "@/types/domain";
import { ArticlePreviewDTO } from "@/types/dtos/article";

export async function searchArticles(
  query: string,
): Promise<ResponsePayload<ArticlePreviewDTO[]>> {
  console.log(`Searching articles with query: "${query}"...`);
  const response = await fetch(
    `${ENV.BASE_API_URL}/articles/search?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const payload = (await response.json()) as ResponsePayload<
    ArticlePreviewDTO[]
  >;

  if (payload.status !== 200) {
    console.log("Failed to search articles with error:", payload.error);
    throw new ApiError(
      payload.error?.message ||
        "Erro inesperado ocorreu durante a busca de artigos",
      payload.error?.code || "INTERNAL_SERVER_ERROR",
    );
  }

  return payload;
}
