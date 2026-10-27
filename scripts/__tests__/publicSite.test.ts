import { spawn, execFile } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { once } from "node:events";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { promisify } from "node:util";

const projectRoot = process.cwd();
const runFile = promisify(execFile);
let fixtureRoot: string;
let preview: ChildProcess | undefined;
let previewUrl: string;

function readResponse(path: string, method = "GET") {
  return new Promise<{
    status: number | undefined;
    headers: Record<string, string | string[] | undefined>;
    body: string;
  }>(function sendRequest(resolveResponse, reject) {
    const req = request(
      `${previewUrl}${path}`,
      { method },
      function receive(response) {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () =>
          resolveResponse({
            status: response.statusCode,
            headers: response.headers,
            body,
          }),
        );
        response.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end();
  });
}

beforeAll(async () => {
  fixtureRoot = await mkdtemp(resolve(tmpdir(), "janelinha-public-site-"));
  await Promise.all(
    ["dist", "assets", "web/public-site"].map((dir) =>
      mkdir(resolve(fixtureRoot, dir), { recursive: true }),
    ),
  );
  await Promise.all([
    cp(resolve(projectRoot, "web/pwa"), resolve(fixtureRoot, "web/pwa"), {
      recursive: true,
    }),
    mkdir(resolve(fixtureRoot, "dist/_expo"), { recursive: true }).then(() =>
      writeFile(
        resolve(fixtureRoot, "dist/_expo/app.js"),
        "window.app = true;",
      ),
    ),
    ...["index.html", "404.html", "politica-de-privacidade.html"].map((file) =>
      copyFile(
        resolve(projectRoot, "web/public-site", file),
        resolve(fixtureRoot, "web/public-site", file),
      ),
    ),
    writeFile(
      resolve(fixtureRoot, "dist/index.html"),
      '<html><head></head><body><script src="/_expo/app.js"></script></body></html>',
    ),
    writeFile(resolve(fixtureRoot, "dist/site.css"), "body { margin: 0; }"),
    writeFile(resolve(fixtureRoot, "assets/new-icon.png"), "icon"),
    writeFile(resolve(fixtureRoot, "assets/tooth.png"), "tooth"),
  ]);
  await runFile(
    process.execPath,
    [resolve(projectRoot, "scripts/finalize-web.mts")],
    {
      cwd: fixtureRoot,
    },
  );
  preview = spawn(
    process.execPath,
    [resolve(projectRoot, "scripts/preview-web.mts")],
    {
      cwd: fixtureRoot,
      env: { ...process.env, WEB_PREVIEW_PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  await new Promise<void>(function waitForPreview(done, reject) {
    let output = "";
    preview!.on("error", reject);
    preview!.on("exit", (code) =>
      reject(new Error(`Preview exited: ${code}\n${output}`)),
    );
    preview!.stderr!.on("data", (chunk) => (output += chunk));
    preview!.stdout!.on("data", function readAddress(chunk) {
      output += chunk;
      const match = output.match(/http:\/\/localhost:\d+/);
      if (match) {
        previewUrl = match[0].replace("localhost", "127.0.0.1");
        done();
      }
    });
  });
}, 15000);

afterAll(async () => {
  if (preview && preview.exitCode === null && preview.signalCode === null) {
    const exited = once(preview, "exit");
    preview.kill();
    await exited;
  }
  if (fixtureRoot) {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

it("serves the exported public policy without loading the application", async () => {
  const response = await readResponse(
    "/politica-de-privacidade?origem=cadastro",
  );
  const source = await readFile(
    resolve(projectRoot, "web/public-site/politica-de-privacidade.html"),
    "utf8",
  );

  expect(response.status).toBe(200);
  expect(response.headers["content-type"]).toContain("text/html");
  expect(response.body).toBe(source);
  expect(response.body).not.toContain("/_expo/");
  expect(response.body).not.toContain("<script");
});

it("keeps the policy version aligned with the app acceptance version", async () => {
  const [policy, module] = await Promise.all([
    readFile(resolve(fixtureRoot, "dist/politica-de-privacidade.html"), "utf8"),
    readFile(resolve(projectRoot, "app/lib/privacyPolicy.ts"), "utf8"),
  ]);
  const version = module.match(/PRIVACY_POLICY_VERSION = "([^"]+)"/)?.[1];

  expect(version).toBeDefined();
  expect(policy).toContain(
    `name="privacy-policy-version" content="${version}"`,
  );
});

it.each(["/politica-de-privacidade.html", "/politica-de-privacidade/"])(
  "redirects the policy alias without dropping its query: %s",
  async (path) => {
    const response = await readResponse(`${path}?origem=perfil`);

    expect(response.status).toBe(308);
    expect(response.headers.location).toBe(
      "/politica-de-privacidade?origem=perfil",
    );
  },
);

it("supports HEAD without returning a body", async () => {
  const response = await readResponse("/politica-de-privacidade", "HEAD");

  expect(response.status).toBe(200);
  expect(response.headers["content-type"]).toContain("text/html");
  expect(Number(response.headers["content-length"])).toBeGreaterThan(0);
  expect(response.body).toBe("");
});

it("returns 404 for unknown public paths", async () => {
  const response = await readResponse("/politica-de-privacidade/inexistente");

  expect(response.status).toBe(404);
  expect(response.body).not.toContain("/_expo/");
});

it("preserves the landing, deep app URLs and stylesheet", async () => {
  const [landing, app, css] = await Promise.all([
    readResponse("/"),
    readResponse("/app/perfil"),
    readResponse("/site.css"),
  ]);

  expect(landing.status).toBe(200);
  expect(landing.body).toContain('href="/politica-de-privacidade"');
  expect(app.status).toBe(200);
  expect(app.body).toContain("/_expo/");
  expect(css.status).toBe(200);
  expect(css.headers["content-type"]).toContain("text/css");
});

it("makes both entry points installable and serves the PWA files", async () => {
  const [landing, app, manifestResponse, worker, registration, icon] =
    await Promise.all([
      readResponse("/"),
      readResponse("/app/sorriso"),
      readResponse("/manifest.webmanifest"),
      readResponse("/sw.js"),
      readResponse("/pwa/register.js"),
      readResponse("/pwa/icons/icon-192.png", "HEAD"),
    ]);
  for (const response of [landing, app]) {
    expect(response.body).toContain(
      'rel="manifest" href="/manifest.webmanifest"',
    );
    expect(response.body).toContain('src="/pwa/register.js"');
    expect(response.body).toContain('rel="apple-touch-icon"');
  }
  const manifest = JSON.parse(manifestResponse.body);
  expect(manifestResponse.headers["content-type"]).toContain(
    "application/manifest+json",
  );
  expect(manifest).toMatchObject({
    id: "/app",
    start_url: "/app",
    scope: "/app",
    display: "standalone",
  });
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "any" }),
    ]),
  );
  expect(icon.status).toBe(200);
  expect(icon.headers["content-type"]).toBe("image/png");
  expect(worker.status).toBe(200);
  expect(worker.body).toContain("/_expo/app.js");
  expect(worker.body).not.toContain("__CACHE_VERSION__");
  expect(worker.body).not.toContain("__PRECACHE_URLS__");
  expect(registration.status).toBe(200);
  expect(registration.body).toContain('register("/sw.js"');
});
