import { ENV } from "@/lib/env";
import { authFetch } from "@/lib/authFetch";
import { parseResponse } from "@/lib/parseResponse";
import { ApiError, ResponsePayload } from "@/types/domain";

export async function deleteToothEvent(
  eventId: string,
  token: string,
): Promise<ResponsePayload<{ message: string }>> {
  const response = await authFetch(
    `${ENV.BASE_API_URL}/tooth-events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    token,
  );

  const payload = await parseResponse<{ message: string }>(response);

  if (payload.status !== 200) {
    throw new ApiError(
      "Erro inesperado ocorreu durante a exclusão do evento",
      "INTERNAL_SERVER_ERROR",
      payload.status,
    );
  }

  return payload;
}
