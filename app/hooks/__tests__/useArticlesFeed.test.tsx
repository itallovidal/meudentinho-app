import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ArticlePreviewDTO } from "@/types/dtos/article";
import { ApiError } from "@/types/domain";
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
      await new Promise((done) => setTimeout(done, 0));
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
    return page(
      params.page === 2
        ? Array.from({ length: 5 }, (_, index) =>
            article(`c${index + 21}`, [CATEGORIES[0].name]),
          )
        : [
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

it("loads Todos without a category filter and keeps legacy articles", async () => {
  previewRequest.mockImplementation(async (params = {}) =>
    page(
      params.perPage === 1
        ? [article("banner")]
        : [
            article("banner"),
            article("orphan", ["Antiga"]),
            article("lowercase", ["higiene oral"]),
            article("uncategorized"),
          ],
      { page: 1, per_page: params.perPage ?? 20, total: 4, total_pages: 1 },
    ),
  );
  const cache = client();
  const feed = renderFeed(cache);
  await flush();

  expect(requests()).toContainEqual({ category: "", page: 1, perPage: 20 });
  expect(requests().some((params) => params.category)).toBe(false);
  expect(feed.current.feed.articles.map((item) => item.id)).toEqual([
    "orphan",
    "lowercase",
    "uncategorized",
  ]);

  feed.unmount();
  cache.clear();
});

it("keeps Todos available when categories fail", async () => {
  categoriesRequest.mockRejectedValue(
    new ApiError("unavailable", "TIMEOUT", 408),
  );
  const cache = client();
  const feed = renderFeed(cache);
  await flush();

  expect(feed.current.categoriesError).toBe(true);
  expect(feed.current.isError).toBe(false);
  expect(feed.current.feed.articles.length).toBeGreaterThan(0);
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

  expect(feed.current.feed.articles).toHaveLength(24);
  feed.unmount();
  cache.clear();
});

it("treats an empty catalog as empty data instead of a failed highlight", async () => {
  previewRequest.mockResolvedValue(
    page([], { page: 1, per_page: 20, total: 0, total_pages: 0 }),
  );
  const cache = client();
  const feed = renderFeed(cache);
  await flush();
  expect(feed.current.latestArticle).toBeUndefined();
  expect(feed.current.latestError).toBe(false);
  expect(feed.current.isLoading).toBe(false);
  expect(feed.current.isError).toBe(false);
  expect(feed.current.feed.articles).toEqual([]);
  feed.unmount();
  cache.clear();
});
