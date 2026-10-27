/// <reference types="jest" />
import { ENV, buildEnv, envIssues } from "@/lib/env";

const HTTPS_PRIVACY = "https://exemplo.com/politica";

function rawEnv(baseApiUrl?: string) {
  return {
    EXPO_PUBLIC_API_BASE_URL: baseApiUrl,
    EXPO_PUBLIC_PRIVACY_POLICY_URL: HTTPS_PRIVACY,
  };
}

describe("buildEnv", () => {
  it("reports missing variables without throwing", () => {
    const result = buildEnv({}, { requireHttps: false });

    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]).toContain("EXPO_PUBLIC_API_BASE_URL");
    expect(result.issues[1]).toContain("EXPO_PUBLIC_PRIVACY_POLICY_URL");
    expect(result.env.BASE_API_URL).toBe("");
  });

  it("accepts http only outside release", () => {
    const dev = buildEnv(rawEnv("http://192.168.0.20:8080"), {
      requireHttps: false,
    });
    const release = buildEnv(rawEnv("http://192.168.0.20:8080"), {
      requireHttps: true,
    });

    expect(dev.issues).toEqual([]);
    expect(dev.env.BASE_API_URL).toBe("http://192.168.0.20:8080");
    expect(release.issues[0]).toContain("https://");
  });

  it("accepts https in both modes and strips the trailing slash", () => {
    const result = buildEnv(rawEnv("https://api.janelinha.com/"), {
      requireHttps: true,
    });

    expect(result.issues).toEqual([]);
    expect(result.env.BASE_API_URL).toBe("https://api.janelinha.com");
    expect(result.env.PRIVACY_POLICY_URL).toBe(HTTPS_PRIVACY);
  });

  it("rejects schemes other than http and https", () => {
    for (const url of ["ftp://host", "mailto:contato@exemplo.com"]) {
      const result = buildEnv(rawEnv(url), { requireHttps: false });

      expect(result.issues).not.toEqual([]);
    }
  });

  it("rejects a privacy policy url that is not https", () => {
    const result = buildEnv(
      {
        EXPO_PUBLIC_API_BASE_URL: "https://api.janelinha.com",
        EXPO_PUBLIC_PRIVACY_POLICY_URL: "http://exemplo.com/politica",
      },
      { requireHttps: false },
    );

    expect(result.issues[0]).toContain("EXPO_PUBLIC_PRIVACY_POLICY_URL");
    expect(result.issues[0]).toContain("https://");
  });

  it("falls back to the default storage prefix", () => {
    const result = buildEnv(rawEnv("https://api.janelinha.com"), {
      requireHttps: true,
    });

    expect(result.env.LOCAL_STORAGE_KEY_PREFIX).toBe("@janelinha");
  });

  it("keeps a provided storage prefix", () => {
    const result = buildEnv(
      {
        EXPO_PUBLIC_API_BASE_URL: "https://api.janelinha.com",
        EXPO_PUBLIC_PRIVACY_POLICY_URL: HTTPS_PRIVACY,
        EXPO_PUBLIC_LOCAL_STORAGE_KEY: "@custom",
      },
      { requireHttps: true },
    );

    expect(result.env.LOCAL_STORAGE_KEY_PREFIX).toBe("@custom");
  });
});

describe("env module", () => {
  it("resolves without throwing on import", () => {
    expect(Array.isArray(envIssues)).toBe(true);
    expect(typeof ENV.BASE_API_URL).toBe("string");
    expect(ENV.LOCAL_STORAGE_KEY_PREFIX).toBe("@janelinha");
  });
});
