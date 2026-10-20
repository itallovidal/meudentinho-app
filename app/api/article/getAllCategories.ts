import { ENV } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";

export async function getAllCategories(): Promise<
  ResponsePayload<[{ name: string; id: string }]>
> {
  const response = await fetchWithTimeout(
    `${ENV.BASE_API_URL}/articles/categories`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const payload = await parseResponse<
    [{ name: string; id: string }]
  >(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a obtenção das categorias",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
