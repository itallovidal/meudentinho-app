import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, MetaApiPayload, ResponsePayload } from "@/types/domain";
import type { ArticlePreviewDTO } from "@/types/dtos/article";

export interface ArticlePreviewPageParams {
  page?: number;
  perPage?: number;
  category?: string;
}

export async function getAllArticlePreview(
  params: ArticlePreviewPageParams = {},
): Promise<ResponsePayload<ArticlePreviewDTO[]>> {
  const query: string[] = [];

  if (params.page) {
    query.push(`page=${params.page}`);
  }
  if (params.perPage) {
    query.push(`per_page=${params.perPage}`);
  }
  if (params.category) {
    query.push(`category=${encodeURIComponent(params.category)}`);
  }

  const queryString = query.join("&");
  const url = `${ENV.BASE_API_URL}/articles/preview${queryString ? `?${queryString}` : ""}`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await parseResponse<ArticlePreviewDTO[]>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção dos artigos",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return {
    ...payload,
    data: payload.data ?? [],
    meta: normalizeMeta(payload.meta),
  };
}

function normalizeMeta(
  meta: Partial<MetaApiPayload> | undefined,
): MetaApiPayload | undefined {
  if (!meta) {
    return undefined;
  }

  return {
    page: meta.page ?? 1,
    per_page: meta.per_page ?? 0,
    total: meta.total ?? 0,
    total_pages: meta.total_pages ?? 0,
  };
}
