type PwaWorkerEvent = {
  waitUntil: (task: Promise<unknown>) => void;
};

type PwaFetchEvent = PwaWorkerEvent & {
  request: Request;
  respondWith: (response: Promise<Response>) => void;
};

const pwaWorker = globalThis as unknown as {
  location: Location;
  clients: { claim: () => Promise<void> };
  skipWaiting: () => Promise<void>;
  addEventListener: {
    (
      type: "install" | "activate",
      listener: (event: PwaWorkerEvent) => void,
    ): void;
    (type: "fetch", listener: (event: PwaFetchEvent) => void): void;
    (type: "message", listener: (event: MessageEvent) => void): void;
  };
};

const pwaCacheName = "janelinha-shell-__CACHE_VERSION__";
const pwaPrecacheUrls: string[] = JSON.parse("__PRECACHE_URLS__");
const pwaStaticPaths = new Set(pwaPrecacheUrls);

pwaWorker.addEventListener("install", function cacheApplication(event) {
  event.waitUntil(
    (async function precache() {
      const cache = await caches.open(pwaCacheName);
      try {
        await cache.addAll(
          pwaPrecacheUrls.map((url) => new Request(url, { cache: "reload" })),
        );
      } catch (error) {
        await caches.delete(pwaCacheName);
        throw error;
      }
    })(),
  );
});

pwaWorker.addEventListener("activate", function activateApplication(event) {
  event.waitUntil(
    (async function removePreviousVersions() {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) => key.startsWith("janelinha-shell-") && key !== pwaCacheName,
          )
          .map((key) => caches.delete(key)),
      );
      await pwaWorker.clients.claim();
    })(),
  );
});

pwaWorker.addEventListener("message", function applyRequestedUpdate(event) {
  if (event.data?.type === "SKIP_WAITING") {
    void pwaWorker.skipWaiting();
  }
});

pwaWorker.addEventListener("fetch", function serveApplication(event) {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== pwaWorker.location.origin ||
    request.headers.has("Authorization")
  ) {
    return;
  }

  if (
    request.mode === "navigate" &&
    (url.pathname === "/app" || url.pathname.startsWith("/app/"))
  ) {
    event.respondWith(
      (async function openApplication() {
        try {
          const response = await fetch(request);
          if (response.ok || response.status < 500) {
            return response;
          }
          throw new Error("Application unavailable");
        } catch {
          const cache = await caches.open(pwaCacheName);
          const shell = await cache.match("/app-shell.html");
          if (shell) {
            return shell;
          }
          return new Response(
            "Sem conexão. Reconecte-se para abrir o Janelinha.",
            {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            },
          );
        }
      })(),
    );
    return;
  }

  if (pwaStaticPaths.has(url.pathname) && !url.search) {
    event.respondWith(
      (async function readStaticFile() {
        const cache = await caches.open(pwaCacheName);
        return (await cache.match(request)) ?? fetch(request);
      })(),
    );
  }
});
