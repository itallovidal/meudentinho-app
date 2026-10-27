import { Linking } from "react-native";
import { MarkdownContent as WebMarkdownContent } from "@/components/markdownContent.web";
import { ArticleContent } from "@/components/article/articleContent";
import { RemoteImage } from "@/components/remoteImage";
import { useToast } from "@/components/ui/toast";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({
  View: "View",
  ScrollView: "ScrollView",
  Image: "Image",
  Linking: { openURL: jest.fn() },
}));
jest.mock(
  "react-native-web/dist/exports/Linking",
  () => ({ openURL: jest.fn() }),
  { virtual: true },
);
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Image", () => "Image", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/ScrollView", () => "ScrollView", {
  virtual: true,
});
jest.mock("react-native-remark", () => ({
  Markdown: "Markdown",
  useMarkdownContext: () => ({
    contentSize: { width: 320 },
    definitions: { cover: { url: "http://example.com/unsafe.jpg" } },
  }),
}));
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: "WebMarkdown",
}));
jest.mock("remark-gfm", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/ui/badge", () => ({ Badge: "Badge" }));
jest.mock("@/components/ui/toast", () => ({ useToast: jest.fn() }));
jest.mock("@/components/externalLink", () => ({
  ExternalLink: "ExternalLink",
}));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("phosphor-react-native", () => ({ ClockIcon: "ClockIcon" }));

const { MarkdownContent } = jest.requireActual(
  "@/components/markdownContent.tsx",
);

const { act, create } = jest.requireActual("react-test-renderer");
let renderer: ReturnType<typeof create>;
const showToast = jest.fn();
const openURL = jest.mocked(Linking.openURL);

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.mocked(useToast).mockReturnValue({ showToast });
  openURL.mockResolvedValue(undefined);
});
afterEach(() => act(() => renderer?.unmount()));

it("opens allowed links and reports blocked destinations or opening failures", async () => {
  act(() => {
    renderer = create(
      <MarkdownContent content="[link](https://example.com)" />,
    );
  });
  const open = renderer.root.findByType("Markdown").props.onLinkPress;
  await act(async () => {
    open("https://example.com");
    open("mailto:contato@example.com");
    open("javascript:alert(1)");
  });
  expect(openURL).toHaveBeenCalledTimes(2);
  expect(showToast).toHaveBeenCalledWith(
    expect.stringContaining("não é permitido"),
  );
  openURL.mockRejectedValueOnce(new Error("unavailable"));
  await act(async () => {
    open("https://example.com");
  });
  expect(showToast).toHaveBeenCalledWith(
    expect.stringContaining("Não foi possível abrir"),
  );
});

it("blocks reference images before requesting an insecure URL", () => {
  act(() => {
    renderer = create(<MarkdownContent content="![cover][cover]" />);
  });
  const ReferenceImage =
    renderer.root.findByType("Markdown").props.customRenderers
      .ImageReferenceRenderer;
  act(() => {
    renderer.update(
      <ReferenceImage node={{ identifier: "cover", alt: "Capa" }} />,
    );
  });
  expect(renderer.root.findAllByType("Image")).toHaveLength(0);
  expect(JSON.stringify(renderer.toJSON())).toContain("Imagem indisponível");
});

it("shows a fallback for a failed cover and recovers when its URL changes", () => {
  act(() => {
    renderer = create(
      <RemoteImage uri="https://example.com/a.jpg" accessibilityLabel="Capa" />,
    );
  });
  act(() => {
    renderer.root.findByType("Image").props.onError();
  });
  expect(renderer.root.findAllByType("Image")).toHaveLength(0);
  act(() => {
    renderer.update(
      <RemoteImage uri="https://example.com/b.jpg" accessibilityLabel="Capa" />,
    );
  });
  expect(renderer.root.findByType("Image").props.source.uri).toBe(
    "https://example.com/b.jpg",
  );
});

it("renders a summary only when the reader supplies one", () => {
  const props = {
    title: "Título",
    categories: ["Higiene"],
    readingTime: 1,
    imageCoverURL: "https://example.com/image.jpg",
    content: "Texto",
  };
  act(() => {
    renderer = create(
      <ArticleContent {...props} summary="Resumo exclusivo da leitura" />,
    );
  });
  expect(JSON.stringify(renderer.toJSON())).toContain(
    "Resumo exclusivo da leitura",
  );
  act(() => {
    renderer.update(<ArticleContent {...props} />);
  });
  expect(JSON.stringify(renderer.toJSON())).not.toContain(
    "Resumo exclusivo da leitura",
  );
});

it("uses external links on the web and gives feedback for unsupported links", () => {
  act(() => {
    renderer = create(
      <WebMarkdownContent content="[link](https://example.com)" />,
    );
  });
  const markdown = renderer.root.findByType("WebMarkdown");
  expect(markdown.props.skipHtml).toBe(true);
  const Link = markdown.props.components.a;
  act(() => {
    renderer.update(<Link href="https://example.com">Referência</Link>);
  });
  expect(renderer.root.findByType("ExternalLink").props.href).toBe(
    "https://example.com",
  );
  act(() => {
    renderer.update(<Link href="/relative">Referência</Link>);
  });
  const blocked = renderer.root.findByType("a");
  expect(blocked.props.href).toBeUndefined();
  act(() => {
    blocked.props.onClick();
  });
  expect(showToast).toHaveBeenCalledWith(
    expect.stringContaining("não é permitido"),
  );
});

it("preserves code indentation and line breaks with the themed code renderer", () => {
  act(() => {
    renderer = create(<MarkdownContent content="Code" />);
  });
  const Code =
    renderer.root.findByType("Markdown").props.customRenderers.CodeRenderer;
  const value = "function example() {\n  return true;\n}";
  act(() => {
    renderer.update(<Code node={{ value, lang: "javascript" }} />);
  });
  const textNodes = renderer.root.findAllByType("Text");
  expect(
    textNodes.some(
      (node: { props: { children: string; selectable?: boolean } }) =>
        node.props.children === value && node.props.selectable,
    ),
  ).toBe(true);
});
