import { z } from "zod";

export interface EnvValues {
  BASE_API_URL: string;
  PRIVACY_POLICY_URL: string;
  LOCAL_STORAGE_KEY_PREFIX: string;
}

export interface EnvBuildResult {
  env: EnvValues;
  issues: string[];
}

const DEFAULT_STORAGE_PREFIX = "@janelinha";

const FALLBACK_ENV: EnvValues = {
  BASE_API_URL: "",
  PRIVACY_POLICY_URL: "",
  LOCAL_STORAGE_KEY_PREFIX: DEFAULT_STORAGE_PREFIX,
};

const ENV_VAR_NAMES: Record<keyof EnvValues, string> = {
  BASE_API_URL: "EXPO_PUBLIC_API_BASE_URL",
  PRIVACY_POLICY_URL: "EXPO_PUBLIC_PRIVACY_POLICY_URL",
  LOCAL_STORAGE_KEY_PREFIX: "EXPO_PUBLIC_LOCAL_STORAGE_KEY",
};

const urlSchema = z.url({ error: "URL inválida" });

function normalizeTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

const httpsUrl = urlSchema
  .refine((value) => new URL(value).protocol === "https:", {
    error: "precisa começar com https://",
  })
  .transform(normalizeTrailingSlash);

const devUrl = urlSchema
  .refine((value) => /^https?:$/.test(new URL(value).protocol), {
    error: "precisa começar com http:// ou https://",
  })
  .transform(normalizeTrailingSlash);

function envSchema(requireHttps: boolean) {
  return z.object({
    BASE_API_URL: requireHttps ? httpsUrl : devUrl,
    PRIVACY_POLICY_URL: httpsUrl,
    LOCAL_STORAGE_KEY_PREFIX: z
      .string({ error: "variável ausente" })
      .min(1)
      .default(DEFAULT_STORAGE_PREFIX),
  });
}

export function buildEnv(
  rawEnv: Record<string, string | undefined>,
  options: { requireHttps: boolean },
): EnvBuildResult {
  const parsed = envSchema(options.requireHttps).safeParse({
    BASE_API_URL: rawEnv.EXPO_PUBLIC_API_BASE_URL,
    PRIVACY_POLICY_URL: rawEnv.EXPO_PUBLIC_PRIVACY_POLICY_URL,
    LOCAL_STORAGE_KEY_PREFIX: rawEnv.EXPO_PUBLIC_LOCAL_STORAGE_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => {
      const field = String(issue.path[0] ?? "");
      const name = ENV_VAR_NAMES[field as keyof EnvValues] ?? field;
      return `${name}: ${issue.message}`;
    });

    return { env: FALLBACK_ENV, issues };
  }

  return { env: parsed.data, issues: [] };
}

const envResult = buildEnv(process.env, { requireHttps: !__DEV__ });

export const ENV = envResult.env;
export const envIssues = envResult.issues;
