import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import type { PwaController } from "@/types/pwa";

function compile(source: string) {
  return ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
    },
  }).outputText;
}

function workerHarness() {
  const handlers: Record<string, (event: any) => void> = {};
  const shell = new Response("offline app shell");
  const cache = {
    addAll: jest.fn().mockResolvedValue(undefined),
    match: jest.fn().mockResolvedValue(shell),
  };
  const caches = {
    open: jest.fn().mockResolvedValue(cache),
    keys: jest
      .fn()
      .mockResolvedValue([
        "janelinha-shell-old",
        "janelinha-shell-test",
        "other-application",
      ]),
    delete: jest.fn().mockResolvedValue(true),
  };
  const fetch = jest.fn().mockRejectedValue(new Error("offline"));
  const skipWaiting = jest.fn().mockResolvedValue(undefined);
  const claim = jest.fn().mockResolvedValue(undefined);
  const source = readFileSync(resolve("web/pwa/service-worker.ts"), "utf8")
    .replace("__CACHE_VERSION__", "test")
    .replace(
      'JSON.parse("__PRECACHE_URLS__")',
      JSON.stringify(["/app-shell.html", "/_expo/app.js"]),
    );
  runInNewContext(compile(source), {
    URL,
    Request,
    Response,
    Set,
    caches,
    fetch,
    location: { origin: "https://janelinha.example" },
    clients: { claim },
    skipWaiting,
    addEventListener: (type: string, handler: (event: any) => void) => {
      handlers[type] = handler;
    },
  });
  function request(
    path: string,
    mode = "cors",
    method = "GET",
    headers = new Headers(),
  ) {
    const respondWith = jest.fn();
    handlers.fetch({
      request: {
        url: new URL(path, "https://janelinha.example").href,
        mode,
        method,
        headers,
      },
      respondWith,
    });
    return respondWith;
  }
  return { handlers, cache, caches, fetch, skipWaiting, claim, shell, request };
}

it("opens deep app URLs offline without replacing public pages or API requests", async () => {
  const worker = workerHarness();
  const navigation = worker.request(
    "/app/sorriso/historico?kidId=one",
    "navigate",
  );
  expect(await navigation.mock.calls[0][0]).toBe(worker.shell);
  expect(worker.cache.match).toHaveBeenCalledWith("/app-shell.html");
  for (const path of ["/", "/politica-de-privacidade", "/not-found"]) {
    expect(worker.request(path, "navigate")).not.toHaveBeenCalled();
  }
  for (const path of [
    "/users/kids",
    "/auth/login",
    "https://api.example/users/kids",
  ]) {
    expect(worker.request(path)).not.toHaveBeenCalled();
  }
  expect(
    worker.request("/_expo/app.js", "cors", "POST"),
  ).not.toHaveBeenCalled();
  expect(
    worker.request(
      "/_expo/app.js",
      "cors",
      "GET",
      new Headers({ Authorization: "Bearer token" }),
    ),
  ).not.toHaveBeenCalled();
});

it("serves the online page and only uses the shell on network or server failure", async () => {
  const worker = workerHarness();
  const online = new Response("latest online app");
  worker.fetch.mockResolvedValueOnce(online);
  expect(await worker.request("/app", "navigate").mock.calls[0][0]).toBe(
    online,
  );
  const missing = new Response("not found", { status: 404 });
  worker.fetch.mockResolvedValueOnce(missing);
  expect(await worker.request("/app", "navigate").mock.calls[0][0]).toBe(
    missing,
  );
  worker.fetch.mockResolvedValueOnce(
    new Response("unavailable", { status: 503 }),
  );
  expect(await worker.request("/app", "navigate").mock.calls[0][0]).toBe(
    worker.shell,
  );
});

it("caches only release assets and waits for permission before activating an update", async () => {
  const worker = workerHarness();
  expect(await worker.request("/_expo/app.js").mock.calls[0][0]).toBe(
    worker.shell,
  );
  expect(worker.request("/assets/unlisted.png")).not.toHaveBeenCalled();
  const waitUntil = jest.fn();
  worker.handlers.activate({ waitUntil });
  await waitUntil.mock.calls[0][0];
  expect(worker.caches.delete).toHaveBeenCalledTimes(1);
  expect(worker.caches.delete).toHaveBeenCalledWith("janelinha-shell-old");
  expect(worker.claim).toHaveBeenCalled();
  expect(worker.skipWaiting).not.toHaveBeenCalled();
  worker.handlers.message({ data: { type: "SKIP_WAITING" } });
  expect(worker.skipWaiting).toHaveBeenCalledTimes(1);
});

async function registrationHarness(waiting: boolean, secure = true) {
  const handlers: Record<string, (event: any) => void> = {};
  const workerHandlers: Record<string, () => void> = {};
  const pendingWorker = { postMessage: jest.fn() };
  const registration = {
    waiting: waiting ? pendingWorker : null,
    installing: null,
    addEventListener: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const register = jest.fn().mockResolvedValue(registration);
  const reload = jest.fn();
  const browser = {
    isSecureContext: secure,
    matchMedia: () => ({ matches: false, addEventListener: jest.fn() }),
    addEventListener: (type: string, handler: (event: any) => void) => {
      handlers[type] = handler;
    },
    dispatchEvent: jest.fn(),
    location: { reload },
    janelinhaPwa: undefined as PwaController | undefined,
  };
  runInNewContext(
    compile(readFileSync(resolve("web/pwa/register.ts"), "utf8")),
    {
      window: browser,
      Event,
      document: { querySelector: () => null, addEventListener: jest.fn() },
      navigator: {
        userAgent: "Chrome",
        platform: "Linux",
        maxTouchPoints: 0,
        serviceWorker: {
          controller: {},
          register,
          addEventListener: (type: string, handler: () => void) => {
            workerHandlers[type] = handler;
          },
        },
      },
    },
  );
  await new Promise<void>((done) => setImmediate(done));
  return { browser, register, handlers, workerHandlers, pendingWorker, reload };
}

it("preserves forms until the user requests a waiting update", async () => {
  const { browser, register, workerHandlers, pendingWorker, reload } =
    await registrationHarness(true);
  expect(register).toHaveBeenCalledWith("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  expect(browser.janelinhaPwa!.getSnapshot().updateAvailable).toBe(true);
  workerHandlers.controllerchange();
  expect(reload).not.toHaveBeenCalled();
  expect(browser.janelinhaPwa!.update()).toBe(true);
  expect(pendingWorker.postMessage).toHaveBeenCalledWith({
    type: "SKIP_WAITING",
  });
  workerHandlers.controllerchange();
  expect(reload).toHaveBeenCalledTimes(1);
});

it("uses the browser installation prompt only once and hides installation after success", async () => {
  const { browser, handlers } = await registrationHarness(false);
  const event = {
    preventDefault: jest.fn(),
    prompt: jest.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome: "accepted" }),
  };
  handlers.beforeinstallprompt(event);
  expect(event.preventDefault).toHaveBeenCalled();
  expect(browser.janelinhaPwa!.getSnapshot().canInstall).toBe(true);
  await browser.janelinhaPwa!.install();
  await browser.janelinhaPwa!.install();
  expect(event.prompt).toHaveBeenCalledTimes(1);
  handlers.appinstalled({});
  expect(browser.janelinhaPwa!.getSnapshot()).toMatchObject({
    installed: true,
    canInstall: false,
  });
});

it("avoids registering a worker on an insecure origin", async () => {
  const { browser, register } = await registrationHarness(false, false);
  expect(register).not.toHaveBeenCalled();
  expect(browser.janelinhaPwa).toBeUndefined();
});
