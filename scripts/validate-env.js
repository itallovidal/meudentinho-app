const fs = require("fs");
const path = require("path");

const REQUIRED_VARS = [
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_PRIVACY_POLICY_URL",
];

function isRelease(argv) {
  if (argv.includes("--dev")) {
    return false;
  }

  return argv.includes("--release") || process.env.NODE_ENV === "production";
}

function getMode(argv) {
  if (isRelease(argv)) {
    return "production";
  }

  if (argv.includes("--dev")) {
    return "development";
  }

  const nodeEnv = process.env.NODE_ENV;

  return nodeEnv || "development";
}

function parseEnvFile(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = /^(?:export\s+)?([\w.-]+)\s*=\s?(.*)$/.exec(line);
    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function loadEnvFiles(projectRoot, mode) {
  const filesByPriority = [
    `.env.${mode}.local`,
    mode !== "test" && ".env.local",
    `.env.${mode}`,
    ".env",
  ].filter(Boolean);

  const fromFiles = {};
  const loadedFiles = [];

  for (const file of [...filesByPriority].reverse()) {
    const filePath = path.join(projectRoot, file);
    let content = null;
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    loadedFiles.push(file);
    Object.assign(fromFiles, parseEnvFile(content));
  }

  loadedFiles.reverse();

  return { env: { ...fromFiles, ...process.env }, loadedFiles };
}

function validateEnv(env, options) {
  const requireHttps = Boolean(options && options.isRelease);
  const problems = [];

  for (const name of REQUIRED_VARS) {
    if (!env[name] || !env[name].trim()) {
      problems.push(`${name}: variável ausente`);
    }
  }

  const apiUrl = env.EXPO_PUBLIC_API_BASE_URL;
  if (apiUrl) {
    let parsed = null;
    try {
      parsed = new URL(apiUrl);
    } catch {
      problems.push("EXPO_PUBLIC_API_BASE_URL: URL inválida");
    }

    if (parsed) {
      if (requireHttps && parsed.protocol !== "https:") {
        problems.push(
          `EXPO_PUBLIC_API_BASE_URL: release exige https:// (recebido ${apiUrl})`,
        );
      }

      if (!requireHttps && !/^https?:$/.test(parsed.protocol)) {
        problems.push(
          `EXPO_PUBLIC_API_BASE_URL: precisa começar com http:// ou https:// (recebido ${apiUrl})`,
        );
      }
    }
  }

  const privacyUrl = env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
  if (privacyUrl) {
    let parsed = null;
    try {
      parsed = new URL(privacyUrl);
    } catch {
      problems.push("EXPO_PUBLIC_PRIVACY_POLICY_URL: URL inválida");
    }

    if (parsed && parsed.protocol !== "https:") {
      problems.push(
        `EXPO_PUBLIC_PRIVACY_POLICY_URL: precisa começar com https:// (recebido ${privacyUrl})`,
      );
    }
  }

  const storageKey = env.EXPO_PUBLIC_LOCAL_STORAGE_KEY;
  if (storageKey !== undefined && !storageKey.trim()) {
    problems.push("EXPO_PUBLIC_LOCAL_STORAGE_KEY: valor vazio");
  }

  return problems;
}

function main() {
  const argv = process.argv.slice(2);
  const release = isRelease(argv);
  const mode = getMode(argv);
  const projectRoot = path.resolve(__dirname, "..");
  const loaded = loadEnvFiles(projectRoot, mode);
  const problems = validateEnv(loaded.env, { isRelease: release });

  if (loaded.loadedFiles.length > 0) {
    console.log(`Arquivos de ambiente: ${loaded.loadedFiles.join(", ")}`);
  }

  if (problems.length > 0) {
    console.error(`Variáveis de ambiente inválidas para ${mode}:`);
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    console.error('Veja ".env.example" para o formato esperado.');
    process.exit(1);
  }

  console.log(`Variáveis de ambiente válidas para ${mode}.`);
}

if (require.main === module) {
  main();
}

module.exports = { validateEnv };
