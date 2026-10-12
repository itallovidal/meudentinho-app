import { ENV } from "@/lib/env";
import { ApiError, Article, ResponsePayload } from "@/types/domain";

export async function searchArticles(
  query: string,
): Promise<ResponsePayload<Article[]>> {
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

  const payload = (await response.json()) as ResponsePayload<Article[]>;

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
