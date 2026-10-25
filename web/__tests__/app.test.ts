import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { TextDecoder, TextEncoder } from "node:util";

const failures: string[] = [];
const kid = {
  id: "kid-1",
  parentId: "user-1",
  name: "Criança de teste",
  birthDate: "2021-02-02",
  gender: "female",
  prematureWeeks: "0",
  createdAt: "2026-01-01T12:00:00Z",
  updatedAt: "2026-01-01T12:00:00Z",
};

const secondKid = { ...kid, id: "kid-2", name: "Segundo dependente" };

const articles = [
  {
    id: "article-highlight",
    title: "O cuidado com os primeiros dentinhos",
    imageCoverURL: "https://images.example.com/highlight.png",
    categories: ["Cuidados"],
    readingTime: 3,
  },
  {
    id: "article-card",
    title: "Como organizar a rotina de higiene bucal de toda a família",
    imageCoverURL: "https://images.example.com/card.png",
    categories: ["Cuidados"],
    readingTime: 4,
  },
];

const articleMarkdown = [
  "> Texto voltado para profissionais",
  "Conteúdo educativo de teste.",
  "## Cuidados diários",
  "- Primeiro cuidado\n- Segundo cuidado",
  "1. Primeira etapa\n2. Segunda etapa",
  "Texto com **destaque**, *ênfase* e [referência](https://example.com/referencia).",
  "| Coluna | Valor |\n| --- | --- |\n| Exemplo | Conteúdo |",
  "```text\nExemplo de código\n```",
  '<script data-testid="unsafe-markdown">window.markdownExecuted = true</script>',
  "Último parágrafo do artigo.",
].join("\n\n");

const toothEvents = ["central_incisor", "lateral_incisor", "canine"].map(
  (toothType, index) => ({
    id: `event-${index}`,
    parentId: "user-1",
    kidId: kid.id,
    occurrenceDate: `2026-10-${20 + index}`,
    dentition: "primary",
    arch: "lower",
    side: "right",
    quadrant: "lower_right",
    toothType,
    eventType: "eruption",
    createdAt: "2026-10-22T12:00:00Z",
    updatedAt: "2026-10-22T12:00:00Z",
  }),
);

async function waitFor(check: () => boolean) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (failures.length > 0) {
      throw new Error(failures.join("\n"));
    }
    if (check()) {
      return;
    }
    await new Promise((done) => setTimeout(done, 20));
  }
  throw new Error(
    `A interface não atingiu o estado esperado: ${document.body.textContent?.slice(0, 1500)}`,
  );
}

function refreshStyles() {
  document.head.appendChild(document.getElementById("exported-app-styles")!);
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function fillInput(placeholder: string, value: string) {
  const input = document.querySelector<HTMLInputElement>(
    `input[placeholder="${placeholder}"]`,
  );
  if (!input) {
    throw new Error(`Input não encontrado: ${placeholder}`);
  }
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

beforeAll(async () => {
  Object.assign(globalThis, { TextEncoder, TextDecoder });
  Object.defineProperties(document.documentElement, {
    clientWidth: { value: 374, configurable: true },
    clientHeight: { value: 812, configurable: true },
  });
  Object.assign(globalThis, {
    ResizeObserver: class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
  Object.defineProperty(window, "matchMedia", {
    value: jest.fn((query: string) => ({
      matches: query.includes("prefers-color-scheme: dark"),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
  window.addEventListener("error", (event) => failures.push(event.message));
  Object.assign(window, {
    fetch: jest.fn(async (input: string | URL | Request) => {
      const pathname = new URL(String(input)).pathname;
      const data = pathname.endsWith("/auth/login")
        ? {
            token: "test-access",
            refreshToken: "test-refresh",
            userId: "user-1",
            name: "Responsável de teste",
            email: "responsavel@example.com",
            isAdmin: true,
          }
        : pathname.endsWith("/users/kids")
          ? [kid, secondKid]
          : pathname.endsWith("/odontogram")
            ? {
                events: toothEvents.map((event) => ({
                  ...event,
                  kidId: pathname.includes("kid-2") ? secondKid.id : kid.id,
                })),
              }
            : pathname.endsWith("/articles/categories")
              ? [{ id: "category-1", name: "Cuidados" }]
              : pathname.endsWith("/articles/preview")
                ? articles
                : pathname.startsWith("/articles/")
                  ? {
                      ...articles.find((article) =>
                        pathname.endsWith(`/${article.id}`),
                      ),
                      summary: "Resumo de teste",
                      content: articleMarkdown,
                    }
                  : [];
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ status: 200, data }),
      } as Response;
    }),
  });
  document.body.innerHTML = '<div id="root"></div>';
  const stylesheetRoot = resolve("dist/_expo/static/css");
  const stylesheet = document.createElement("style");
  stylesheet.id = "exported-app-styles";
  stylesheet.textContent = readdirSync(stylesheetRoot)
    .filter((name) => name.endsWith(".css"))
    .map((name) => readFileSync(resolve(stylesheetRoot, name), "utf8"))
    .join("\n")
    .replaceAll("\\'", "\\27 ");
  document.head.appendChild(stylesheet);
  const bundleRoot = resolve("dist/_expo/static/js/web");
  const entry = readdirSync(bundleRoot).find((name) =>
    /^index-.*\.js$/.test(name),
  );
  if (!entry) {
    throw new Error("Execute npm run build:web antes de testar o bundle web.");
  }
  const script = document.createElement("script");
  script.textContent = readFileSync(resolve(bundleRoot, entry), "utf8");
  document.head.appendChild(script);
  await waitFor(
    () => document.body.textContent?.includes("Bem vindo de volta!") === true,
  );
});

it("opens the exported login URL without native storage or environment failures", () => {
  expect(window.location.pathname).toBe("/app/login");
  expect(new URLSearchParams(window.location.search).get("returnTo")).toBe(
    "/app/perfil/dependentes/kid-1/editar",
  );
  expect(document.querySelector('input[autocomplete="email"]')).not.toBeNull();
  expect(document.querySelector('input[type="password"]')).not.toBeNull();
  expect(failures).toEqual([]);
});

it("keeps the welcome illustration at its intended size on the web", async () => {
  navigate("/app");
  await waitFor(
    () =>
      document.querySelector(
        '[aria-label="Dente segurando uma escova de dentes"]',
      ) !== null,
  );
  const illustration = document.querySelector<HTMLElement>(
    '[aria-label="Dente segurando uma escova de dentes"]',
  )!;
  const size = {
    width: getComputedStyle(illustration).width,
    height: getComputedStyle(illustration).height,
  };
  navigate(
    "/app/login?returnTo=%2Fapp%2Fperfil%2Fdependentes%2Fkid-1%2Feditar",
  );
  await waitFor(
    () => document.querySelector('input[autocomplete="email"]') !== null,
  );
  expect(size).toEqual({ width: "128px", height: "128px" });
});

it("logs in through the shared API and persists the token pair for this tab", async () => {
  fillInput("Digite seu email", "responsavel@example.com");
  fillInput("Digite sua senha", "senha-de-teste");
  await waitFor(() => {
    const button = Array.from(
      document.querySelectorAll<HTMLElement>('[role="button"],button'),
    ).find((element) => element.textContent === "Entrar");
    if (!button || button.getAttribute("aria-disabled") === "true") {
      return false;
    }
    button.click();
    return true;
  });
  await waitFor(
    () => document.body.textContent?.includes("Salvar alterações") === true,
  );
  expect(window.location.pathname).toBe("/app/perfil/dependentes/kid-1/editar");
  const key = Object.keys(window.sessionStorage).find((name) =>
    name.endsWith("_authSession"),
  );
  expect(key).toBeDefined();
  const stored = JSON.parse(window.sessionStorage.getItem(key!) ?? "null");
  expect(stored.session).toMatchObject({
    authToken: "test-access",
    refreshToken: "test-refresh",
  });
  expect(window.localStorage.getItem(key!)).toBeNull();
});

it("resolves an edit URL by ID without a navigation object payload", async () => {
  navigate("/app/perfil");
  await waitFor(
    () => document.body.textContent?.includes("Gerenciar conta") === true,
  );
  navigate("/app/perfil/dependentes/kid-1/editar");
  await waitFor(
    () =>
      document.querySelector<HTMLInputElement>(
        'input[placeholder="Ex: Lucas Silva"]',
      )?.value === kid.name,
  );
  expect(document.body.textContent).toContain("Salvar alterações");
  expect(window.location.search).toBe("");
});

it("keeps both gender options in a full-width group and updates the selection", async () => {
  const group = document.querySelector<HTMLElement>(
    '[role="radiogroup"][aria-label="Sexo"]',
  )!;
  refreshStyles();
  expect(getComputedStyle(group).width).toBe("100%");
  expect(getComputedStyle(group).flexDirection).toBe("row");
  const male = group.querySelector<HTMLElement>('[aria-label="Masculino"]')!;
  const female = group.querySelector<HTMLElement>('[aria-label="Feminino"]')!;
  expect(getComputedStyle(male).flexGrow).toBe("1");
  male.click();
  await waitFor(() => male.getAttribute("aria-checked") === "true");
  expect(female.getAttribute("aria-checked")).toBe("false");
  female.click();
  await waitFor(() => female.getAttribute("aria-checked") === "true");
});

it("opens an opaque bottom sheet with a covering backdrop and closes it with Escape", async () => {
  document
    .querySelector<HTMLElement>(
      '[aria-label="A criança nasceu antes do tempo previsto?"]',
    )!
    .click();
  const trigger = document.querySelector<HTMLElement>(
    '[aria-label="Escolher semanas de gestação"]',
  );
  expect(trigger).not.toBeNull();
  trigger!.click();
  await waitFor(() => document.querySelector('[role="dialog"]') !== null);
  const sheet = document.querySelector<HTMLElement>(
    '[data-testid="bottom-sheet-surface"]',
  )!;
  const backdrop = document.querySelector<HTMLElement>(
    '[data-testid="bottom-sheet-backdrop"]',
  )!;
  refreshStyles();
  expect(getComputedStyle(sheet).backgroundColor).toBe("hsl(var(--base-100))");
  expect(getComputedStyle(sheet).width).toBe("100%");
  expect(getComputedStyle(backdrop).position).toBe("absolute");
  expect(getComputedStyle(backdrop).inset).toBe("0");
  expect(getComputedStyle(backdrop).backgroundColor).toBe("rgba(0, 0, 0, 0.5)");
  await waitFor(() => Number(getComputedStyle(backdrop).opacity) > 0.9);
  document.dispatchEvent(
    new KeyboardEvent("keyup", { key: "Escape", bubbles: true }),
  );
  await waitFor(() => document.querySelector('[role="dialog"]') === null);
});

it("shows a missing record instead of silently changing edit into creation", async () => {
  navigate("/app/perfil/dependentes/missing/editar");
  await waitFor(
    () =>
      document.body.textContent?.includes(
        "Este dependente não está disponível",
      ) === true,
  );
  expect(document.body.textContent).not.toContain("Salvar alterações");
});

it("handles an unknown app URL with a visible return action", async () => {
  navigate("/app/rota-inexistente");
  await waitFor(
    () => document.body.textContent?.includes("Página não encontrada") === true,
  );
  expect(document.body.textContent).toContain("Ir para o início");
  expect(failures).toEqual([]);
});

it.each([
  [
    "article-highlight",
    "Ler artigo em destaque: O cuidado com os primeiros dentinhos",
  ],
  [
    "article-card",
    "Ler artigo: Como organizar a rotina de higiene bucal de toda a família",
  ],
])("opens the article from its home card: %s", async (id, label) => {
  navigate("/app");
  await waitFor(
    () => document.querySelector(`[aria-label="${label}"]`) !== null,
  );
  const card = document.querySelector<HTMLElement>(`[aria-label="${label}"]`)!;
  expect(card.getAttribute("role")).toBe("button");
  card.click();
  await waitFor(() => window.location.pathname === `/app/artigos/${id}`);
  await waitFor(
    () =>
      document.body.textContent?.includes("Conteúdo educativo de teste.") ===
      true,
  );
});

it("renders the full article Markdown with the app palette and safe HTML", () => {
  const content = document.querySelector<HTMLElement>(
    '[data-testid="article-markdown"]',
  )!;
  expect(content.querySelector("blockquote")?.textContent).toContain(
    "Texto voltado para profissionais",
  );
  expect(content.querySelector("h2")?.textContent).toBe("Cuidados diários");
  expect(content.querySelectorAll("ul li")).toHaveLength(2);
  expect(content.querySelectorAll("ol li")).toHaveLength(2);
  expect(content.querySelector("strong")?.textContent).toBe("destaque");
  expect(content.querySelector("em")?.textContent).toBe("ênfase");
  expect(content.querySelector("a")?.href).toBe(
    "https://example.com/referencia",
  );
  expect(content.querySelectorAll("table tbody tr")).toHaveLength(1);
  expect(content.querySelector("pre code")?.textContent).toContain(
    "Exemplo de código",
  );
  expect(content.lastElementChild?.textContent).toBe(
    "Último parágrafo do artigo.",
  );
  expect(content.querySelector("script")).toBeNull();
  expect(getComputedStyle(content).color).toBe("hsl(var(--base-800))");
  expect(
    getComputedStyle(content.querySelector("blockquote")!).backgroundColor,
  ).toBe("hsl(var(--secondary-100))");
});

it("sizes the kid selector and smile cards to their contents", async () => {
  navigate("/app/sorriso");
  await waitFor(
    () => document.body.textContent?.includes("Últimos Registros") === true,
  );
  const recent = document.querySelector('[data-testid="recent-events"]')!;
  refreshStyles();
  expect(getComputedStyle(recent).flexGrow).toBe("0");
  expect(getComputedStyle(recent).flexShrink).toBe("0");
  expect(recent.textContent).toContain("Incisivo Central");
  expect(recent.textContent).toContain("Incisivo Lateral");
  expect(recent.textContent).toContain("Canino");
  const predictions = document.querySelector(
    '[aria-label="Ver todas as previsões"]',
  )!.parentElement!.parentElement!;
  expect(getComputedStyle(predictions).flexGrow).toBe("0");
  expect(getComputedStyle(predictions).flexShrink).toBe("0");
  const selector = document.querySelector('[data-testid="kid-selector"]')!;
  expect(getComputedStyle(selector).flexGrow).toBe("0");
  expect(getComputedStyle(selector).flexShrink).toBe("0");
});

it.each([
  ["dependentes", "dependents-list"],
  ["categorias", "categories-list"],
])(
  "keeps management padding inside the scroll viewport: %s",
  async (path, testId) => {
    navigate(`/app/perfil/${path}`);
    await waitFor(
      () => document.querySelector(`[data-testid="${testId}"]`) !== null,
    );
    const viewport = document.querySelector<HTMLElement>(
      `[data-testid="${testId}"]`,
    )!;
    refreshStyles();
    expect(getComputedStyle(viewport).paddingLeft).toBe("0px");
    expect(getComputedStyle(viewport.firstElementChild!).paddingLeft).toBe(
      "24px",
    );
    expect(getComputedStyle(viewport.firstElementChild!).paddingRight).toBe(
      "24px",
    );
    expect(getComputedStyle(viewport.firstElementChild!).paddingBottom).toBe(
      "104px",
    );
  },
);

it.each([
  ["Incisivo Central", "Superior Direito"],
  ["Canino", "Superior Esquerdo"],
  ["Primeiro Molar", "Inferior Direito"],
  ["Incisivo Lateral", "Inferior Esquerdo"],
])(
  "opens the tooth actually pressed in the map: %s %s",
  async (tooth, quadrant) => {
    navigate("/app/sorriso");
    await waitFor(
      () => document.querySelector('[data-testid="kid-selector"]') !== null,
    );
    const button = document.querySelector<HTMLElement>(
      `[aria-label^="${tooth} ${quadrant}"]`,
    )!;
    expect(button).not.toBeNull();
    button.click();
    await waitFor(
      () =>
        document
          .querySelector('[data-testid="bottom-sheet-surface"]')
          ?.textContent?.includes(`${tooth} · ${quadrant}`) === true,
    );
    document
      .querySelector<HTMLElement>(
        '[data-testid="bottom-sheet-surface"] [aria-label="Fechar"]',
      )!
      .click();
    await waitFor(
      () =>
        document.querySelector('[data-testid="bottom-sheet-surface"]') === null,
    );
  },
);

it("opens disabled-save help inside the sheet portal", async () => {
  document
    .querySelector<HTMLElement>(
      '[data-testid="recent-events"] [aria-label^="Editar"]',
    )!
    .click();
  await waitFor(
    () =>
      document.querySelector('[aria-label="Por que não posso salvar?"]') !==
      null,
  );
  const sheet = document.querySelector('[data-testid="bottom-sheet-surface"]')!;
  const help = sheet.querySelector<HTMLElement>(
    '[aria-label="Por que não posso salvar?"]',
  )!;
  help.click();
  await waitFor(() => help.getAttribute("aria-expanded") === "true");
  const contentId = help.getAttribute("aria-controls")!;
  await waitFor(() => document.getElementById(contentId) !== null);
  const content = document.getElementById(contentId)!;
  expect(sheet.closest('[aria-modal="true"]')!.contains(content)).toBe(true);
  expect(content.textContent?.length).toBeGreaterThan(0);
  refreshStyles();
  const bubble = content.querySelector<HTMLElement>(
    '[data-testid="info-popover-message"]',
  )!;
  expect(getComputedStyle(bubble).backgroundColor).toBe("hsl(var(--base-400))");
  help.click();
  await waitFor(() => document.getElementById(contentId) === null);
  sheet.querySelector<HTMLElement>('[aria-label="Fechar"]')!.click();
  await waitFor(
    () =>
      document.querySelector('[data-testid="bottom-sheet-surface"]') === null,
  );
});

it("snaps home cards and updates pagination and the active kid while scrolling", async () => {
  navigate("/app");
  await waitFor(
    () =>
      document.querySelector(
        '[aria-label="Ver o sorriso de Segundo dependente"]',
      ) !== null,
  );
  const viewport = document.querySelector<HTMLElement>(
    '[data-testid="kids-smile-carousel"]',
  )!;
  const card = document.querySelector(
    '[aria-label="Ver o sorriso de Segundo dependente"]',
  )!.parentElement!;
  refreshStyles();
  expect(getComputedStyle(viewport).scrollSnapType).toBe(
    "x var(--tw-scroll-snap-strictness)",
  );
  expect(
    getComputedStyle(viewport).getPropertyValue("--tw-scroll-snap-strictness"),
  ).toBe("mandatory");
  expect(getComputedStyle(card).scrollSnapAlign).toBe("start");
  const step = Number.parseFloat(getComputedStyle(card).width) + 12;
  expect(Number.isFinite(step)).toBe(true);
  expect(
    document.querySelector('[aria-label="Dependente 1 de 2"]'),
  ).not.toBeNull();
  viewport.scrollLeft = step;
  viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
  await waitFor(
    () => document.querySelector('[aria-label="Dependente 2 de 2"]') !== null,
  );
  viewport.scrollLeft = 0;
  await new Promise((done) => setTimeout(done, 20));
  viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
  await waitFor(
    () => document.querySelector('[aria-label="Dependente 1 de 2"]') !== null,
  );
  viewport.scrollLeft = step;
  await new Promise((done) => setTimeout(done, 20));
  viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
  await waitFor(
    () => document.querySelector('[aria-label="Dependente 2 de 2"]') !== null,
  );
  document
    .querySelector<HTMLElement>('[aria-label="Novo registro dentário"]')!
    .click();
  await waitFor(
    () =>
      window.location.pathname === "/app/sorriso" &&
      new URLSearchParams(window.location.search).get("kidId") === secondKid.id,
  );
});

it(
  "reserves enough icon space to contain the selected tab highlight",
  async () => {
    navigate("/app");
    await waitFor(() => window.location.pathname === "/app");
    await waitFor(() => {
      const tab = document.querySelector('[role="tab"][aria-selected="true"]');
      return tab?.textContent?.includes("Início") === true;
    });
    refreshStyles();
    const tab = document.querySelector('[role="tab"][aria-selected="true"]')!;
    const highlight = tab.querySelector("svg")!.parentElement!;
    const iconContainer = highlight.parentElement!.parentElement!;
    expect(getComputedStyle(iconContainer).width).toBe("64px");
    expect(getComputedStyle(highlight).width).toBe("100%");
  },
);

it("keeps the error illustration at its intended size on the web", async () => {
  navigate("/app/pagina-inexistente");
  await waitFor(
    () => document.body.textContent?.includes("Página não encontrada") === true,
  );
  const illustration = document.querySelector<HTMLElement>(
    '[aria-label="Dente sem conexão com a internet"]',
  )!;
  expect(getComputedStyle(illustration).width).toBe("144px");
  expect(getComputedStyle(illustration).height).toBe("128px");
});
