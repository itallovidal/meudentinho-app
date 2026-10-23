import { toothEventSchema } from "@/lib/schemas/toothEvent";
import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, MetaApiPayload, ResponsePayload } from "@/types/domain";
import type { ToothEvent } from "@/types/teeth";

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

  const payload = await parseResponse<ToothEvent[]>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção dos eventos",
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

  const payload = await parseResponse<{
    events?: ToothEvent[];
  }>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção dos eventos",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  const events = payload.data?.events;
  if (
    !Array.isArray(events) ||
    events.some(
      (event) =>
        !toothEventSchema.safeParse(event).success || event.kidId !== kidId,
    )
  ) {
    throw new ApiError(
      "Não foi possível validar os registros dentários. Atualize os dados para continuar.",
      "RESPONSE_PARSE_ERROR",
    );
  }
  return events;
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
