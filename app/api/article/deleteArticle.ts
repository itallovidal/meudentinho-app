import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";

export async function deleteArticle(
  id: string,
  authToken: string,
): Promise<ResponsePayload<{ message: string }>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/articles/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    authToken,
  );

  const payload = await parseResponse<{ message: string }>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a exclusão do artigo",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
