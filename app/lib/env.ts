import { z } from "zod";

const envSchema = z.object({
  BASE_API_URL: z.url(),
  ENVIRONMENT: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOCAL_STORAGE_KEY_PREFIX: z.string().default("@meudentinho"),
});

const parsedEnv = envSchema.safeParse({
  BASE_API_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  ENVIRONMENT: process.env.EXPO_ENVIRONMENT,
  LOCAL_STORAGE_KEY_PREFIX: process.env.EXPO_PUBLIC_LOCAL_STORAGE_KEY,
});

if (!parsedEnv.success) {
  const errors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment variables: ${errors}`);
}

export const ENV = parsedEnv.data;
