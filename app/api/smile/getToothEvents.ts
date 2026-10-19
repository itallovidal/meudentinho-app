import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { ApiError, MetaApiPayload, ResponsePayload } from "@/types/domain";
import type { ToothEvent } from "@/types/teeth";
import { isApiError } from "@/types/predicates";

export interface ToothEventsPageParams {
  page: number;
  perPage?: number;
}

export async function getToothEventsByKid(
  kidId: string,
  token?: string | null,
  params?: ToothEventsPageParams,
): Promise<ResponsePayload<ToothEvent[]>> {
  const query = params
    ? `?page=${params.page}${params.perPage ? `&per_page=${params.perPage}` : ""}`
    : "";

  const response = await authFetch(
    `${ENV.BASE_API_URL}/tooth-events/kid/${kidId}${query}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token ?? null,
  );

  const payload = (await response.json()) as ResponsePayload<ToothEvent[]>;
  assertSuccessfulPayload(payload);

  return {
    ...payload,
    data: payload.data ?? [],
    meta: normalizeMeta(payload.meta),
  };
}

export async function getAllToothEventsByKid(
  kidId: string,
  token: string,
): Promise<ToothEvent[]> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/tooth-events/kid/${kidId}/odontogram`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = (await response.json()) as ResponsePayload<{
    events?: ToothEvent[];
  }>;
  assertSuccessfulPayload(payload);

  return payload.data?.events ?? [];
}

function assertSuccessfulPayload<T>(payload: ResponsePayload<T>) {
  if (payload.status !== 200 && isApiError(payload.error)) {
    throw new ApiError(payload.error.message, payload.error.code);
  }

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção dos eventos",
      "INTERNAL_SERVER_ERROR",
    );
  }
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
