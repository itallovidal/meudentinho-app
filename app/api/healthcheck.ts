import { ENV } from "@/lib/env";

export type HealthcheckResponse = {
  status: string;
  message: string;
};

export async function fetchHealthcheck(): Promise<HealthcheckResponse> {
  const response = await fetch(`${ENV.BASE_API_URL}/healthcheck`);

  console.log("fetchHealthcheck response:", response);

  if (!response.ok) {
    throw new Error(`Healthcheck failed with status ${response.status}`);
  }

  return (await response.json()) as HealthcheckResponse;
}
