import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ArticlePreviewDTO } from "@/types/dtos/article";
import type { ResponsePayload } from "@/types/domain";
import type { ArticlePreviewPageParams } from "@/api/article/getAllArticles";
import { getAllArticlePreview } from "@/api/article/getAllArticles";
import { getAllCategories } from "@/api/article/getAllCategories";
import { useArticlesFeed } from "@/hooks/useArticlesFeed";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("@/api/article/getAllArticles", () => ({
  getAllArticlePreview: jest.fn(),
}));
jest.mock("@/api/article/getAllCategories", () => ({
  getAllCategories: jest.fn(),
}));

const previewRequest = jest.mocked(getAllArticlePreview);
const categoriesRequest = jest.mocked(getAllCategories);

const { act, create } = jest.requireActual("react-test-renderer");

const CATEGORIES = [
  { id: "cat-1", name: "Higiene Oral" },
  { id: "cat-2", name: "Prevencao" },
];

function article(id: string, categories: string[] = []): ArticlePreviewDTO {
  return {
    id,
    title: id,
    imageCoverURL: "",
    categories,
    readingTime: 1,
  };
}

function page(
  data: ArticlePreviewDTO[],
  meta: ResponsePayload<ArticlePreviewDTO[]>["meta"],
): ResponsePayload<ArticlePreviewDTO[]> {
  return { status: 200, data, meta };
}

function requests(): ArticlePreviewPageParams[] {
  return previewRequest.mock.calls.map(([params = {}]) => params);
}

function client() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
}

async function flush() {
  for (let i = 0; i < 6; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  categoriesRequest.mockResolvedValue({
    status: 200,
    data: CATEGORIES,
  } as ResponsePayload<(typeof CATEGORIES)[number][]>);

  previewRequest.mockImplementation(async (params = {}) => {
    if (params.perPage === 1) {
      return page([article("banner", [CATEGORIES[0].name])], {
        page: 1,
        per_page: 1,
        total: 1,
        total_pages: 1,
      });
    }
    if (params.perPage === 4) {
      if (params.category === CATEGORIES[0].name) {
        return page(
          [
            article("banner", [CATEGORIES[0].name]),
            ...["a2", "a3", "a4"].map((id) => article(id, [CATEGORIES[0].name])),
          ],
          { page: 1, per_page: 4, total: 4, total_pages: 1 },
        );
      }
      return page(
        ["b1", "b2", "b3"].map((id) =>
          article(id, [CATEGORIES[1].name]),
        ),
        { page: 1, per_page: 4, total: 3, total_pages: 1 },
      );
    }
    return page(
      [
        article("banner", [CATEGORIES[0].name]),
        ...Array.from({ length: 19 }, (_, index) =>
          article(`c${index + 2}`, [CATEGORIES[0].name]),
        ),
      ],
      {
        page: (params.page ?? 1) as number,
        per_page: 20,
        total: 25,
        total_pages: 2,
      },
    );
  });
});

function renderFeed(cache: QueryClient) {
  let result!: ReturnType<typeof useArticlesFeed>;
  function Harness() {
    result = useArticlesFeed();
    return null;
  }

  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <QueryClientProvider client={cache}>
        <Harness />
      </QueryClientProvider>,
    );
  });

  return {
    get current() {
      return result;
    },
    unmount: () => act(() => renderer.unmount()),
  };
}

it("keeps a global banner and lists five articles per category in Todos", async () => {
  const cache = client();
  const feed = renderFeed(cache);
  await flush();

  expect(feed.current.latestArticle?.id).toBe("banner");
  expect(requests().some((params) => params.perPage === 1)).toBe(true);
  for (const category of CATEGORIES) {
    expect(
      requests().some(
        (params) => params.category === category.name && params.perPage === 4,
      ),
    ).toBe(true);
  }

  const byCategory = feed.current.previews.map((preview) => ({
    id: preview.category.id,
    articles: preview.articles.map((item) => item.id),
  }));

  expect(byCategory).toEqual([
    { id: "cat-1", articles: ["a2", "a3", "a4"] },
    { id: "cat-2", articles: ["b1", "b2", "b3"] },
  ]);

  feed.unmount();
  cache.clear();
});

it("keeps the banner while paginating the selected category by twenty", async () => {
  const cache = client();
  const feed = renderFeed(cache);
  await flush();

  await act(async () => {
    feed.current.selectCategory("cat-1");
  });
  await flush();

  expect(
    requests().some(
      (params) =>
        params.category === CATEGORIES[0].name &&
        params.page === 1 &&
        params.perPage === 20,
    ),
  ).toBe(true);

  const ids = feed.current.feed.articles.map((item) => item.id);
  expect(ids).not.toContain("banner");
  expect(ids).toHaveLength(19);

  await act(async () => {
    feed.current.feed.fetchNextPage();
  });
  await flush();

  expect(
    requests().some(
      (params) =>
        params.category === CATEGORIES[0].name &&
        params.page === 2 &&
        params.perPage === 20,
    ),
  ).toBe(true);

  feed.unmount();
  cache.clear();
});
