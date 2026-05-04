import { z } from "zod";

const envSchema = z.object({
  BASE_API_URL: z.url(),
  ENVIRONMENT: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsedEnv = envSchema.safeParse({
  BASE_API_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  ENVIRONMENT: process.env.EXPO_ENVIRONMENT,
});

if (!parsedEnv.success) {
  const errors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment variables: ${errors}`);
}

export const ENV = parsedEnv.data;
