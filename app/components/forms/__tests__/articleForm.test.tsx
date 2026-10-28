import { ArticleForm } from "@/components/forms/articleForm";
import { articleSchema } from "@/lib/schemas/article";
import type { ArticleRequestDTO } from "@/types/dtos/article";

jest.mock("@/components/markdownEditor", () => ({
  MarkdownEditor: "MarkdownEditor",
}));

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({
  View: "View",
  ScrollView: "ScrollView",
  Image: "Image",
  Keyboard: { dismiss: jest.fn() },
}));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/ScrollView", () => "ScrollView", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Image", () => "Image", {
  virtual: true,
});
jest.mock(
  "react-native-web/dist/exports/Keyboard",
  () => ({ dismiss: jest.fn() }),
  { virtual: true },
);
jest.mock("@/components/article/articleContent", () => ({
  ArticleContent: "ArticleContent",
}));
jest.mock("@/components/ui/bottomSheet", () => ({
  BottomSheet: function MockBottomSheet(props: {
    visible: boolean;
    onClose: () => void;
    children: (dismiss: () => void) => unknown;
  }) {
    return props.visible
      ? jest
          .requireActual("react")
          .createElement(
            "BottomSheet",
            { onClose: props.onClose },
            props.children(props.onClose),
          )
      : null;
  },
}));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/ui/button", () => ({ Button: "Button" }));
jest.mock("@/components/ui/skeleton", () => ({ Skeleton: "Skeleton" }));
jest.mock("@/components/wrapper", () => ({ Wrapper: "Wrapper" }));
jest.mock("@/components/sectionHeader", () => ({
  SectionHeader: "SectionHeader",
}));
jest.mock("@/components/queryWarningBanner", () => ({
  QueryWarningBanner: "QueryWarningBanner",
}));
jest.mock("@/components/propsBadge", () => ({ PropsBadge: "PropsBadge" }));
jest.mock("@/components/formInput", () => ({
  FormInput: function MockFormInput(props: { control: unknown; name: string }) {
    const React = jest.requireActual("react");
    const { Controller } = jest.requireActual("react-hook-form");
    return React.createElement(Controller, {
      control: props.control,
      name: props.name,
      render: ({ field }: { field: object }) =>
        React.createElement("Field", { ...field, name: props.name }),
    });
  },
}));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("phosphor-react-native", () => ({
  ImageIcon: "ImageIcon",
  EyeIcon: "EyeIcon",
  CheckIcon: "CheckIcon",
  PencilSimpleIcon: "PencilSimpleIcon",
  CheckCircleIcon: "CheckCircleIcon",
  WarningCircleIcon: "WarningCircleIcon",
}));
jest.mock("@/api/article/getAllCategories", () => ({
  getAllCategories: jest.fn(),
}));
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: [{ id: "category", name: "Cuidados" }],
    isFetching: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

const { act, create } = jest.requireActual("react-test-renderer");
const valid: ArticleRequestDTO = {
  title: "Cuidados com o sorriso",
  summary: "Cuidados diários com os dentinhos.",
  content: "Veja como cuidar dos dentes em todas as fases do crescimento.",
  categories: ["Cuidados"],
  imageCoverURL: "https://example.com/cover.jpg",
};
let renderer: ReturnType<typeof create>;
const submit = jest.fn();

function publishButton() {
  return renderer.root
    .findAllByType("Button")
    .find(
      (node: { props: { accessibilityState?: object } }) =>
        node.props.accessibilityState,
    );
}

function imageAction(label: string) {
  return renderer.root
    .findAllByType("Button")
    .find(
      (node: { props: { accessibilityLabel: string } }) =>
        node.props.accessibilityLabel === label,
    );
}

async function changeField(name: string, value: string, confirm = true) {
  if (name === "imageCoverURL" && imageAction("Editar imagem de capa")) {
    await act(async () => {
      imageAction("Editar imagem de capa").props.onPress();
    });
  }
  await act(async () => {
    renderer.root
      .findAllByType("Field")
      .find((node: { props: { name: string } }) => node.props.name === name)
      .props.onChange(value);
  });
  if (
    name === "imageCoverURL" &&
    confirm &&
    articleSchema.shape.imageCoverURL.safeParse(value).success
  ) {
    await act(async () => {
      await imageAction("Confirmar URL da imagem").props.onPress();
    });
  }
}

async function advance(ms = 350) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(async () => {
  jest.useFakeTimers();
  submit.mockClear();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  await act(async () => {
    renderer = create(<ArticleForm onSubmit={submit} defaultValues={valid} />);
  });
  await changeField("title", "Cuidados com o sorriso infantil");
});
afterEach(async () => {
  await act(async () => {
    renderer.unmount();
  });
  jest.useRealTimers();
});

it("blocks submission until the actual image loads, including submission through the handler", async () => {
  expect(publishButton().props.disabled).toBe(true);
  await act(async () => {
    await publishButton().props.onPress();
  });
  expect(submit).not.toHaveBeenCalled();
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onLoad();
  });
  expect(publishButton().props.disabled).toBe(false);
  await act(async () => {
    await publishButton().props.onPress();
  });
  expect(submit).toHaveBeenCalledWith({
    ...valid,
    title: "Cuidados com o sorriso infantil",
  });
});

it("keeps a failed cover blocked and allows a successful retry", async () => {
  await advance();
  const previousLoad = renderer.root.findByType("Image").props.onLoad;
  await act(async () => {
    renderer.root.findByType("Image").props.onError();
  });
  expect(publishButton().props.disabled).toBe(true);
  await act(async () => {
    await publishButton().props.onPress();
  });
  expect(submit).not.toHaveBeenCalled();
  await act(async () => {
    renderer.root
      .findAllByType("Button")
      .find(
        (node: { props: { accessibilityLabel: string } }) =>
          node.props.accessibilityLabel === "Tentar carregar imagem novamente",
      )
      .props.onPress();
  });
  await act(async () => {
    previousLoad();
  });
  expect(publishButton().props.disabled).toBe(true);
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onLoad();
  });
  expect(publishButton().props.disabled).toBe(false);
});

it("invalidates the previous image when its url changes and ignores late callbacks", async () => {
  await advance();
  const previousLoad = renderer.root.findByType("Image").props.onLoad;
  await act(async () => {
    previousLoad();
  });
  expect(publishButton().props.disabled).toBe(false);
  await changeField("imageCoverURL", "https://example.com/replacement.jpg");
  expect(publishButton().props.disabled).toBe(true);
  await act(async () => {
    previousLoad();
  });
  expect(publishButton().props.disabled).toBe(true);
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onError();
  });
  expect(publishButton().props.disabled).toBe(true);
});

it("shows a recoverable failure when the image never finishes loading", async () => {
  await advance(15000);
  expect(publishButton().props.disabled).toBe(true);
  expect(
    renderer.root
      .findAllByType("Button")
      .some(
        (node: { props: { accessibilityLabel: string } }) =>
          node.props.accessibilityLabel === "Tentar carregar imagem novamente",
      ),
  ).toBe(true);
  await act(async () => {
    await publishButton().props.onPress();
  });
  expect(submit).not.toHaveBeenCalled();
});

it.each([
  "",
  "not a url",
  "file:///image.jpg",
  "ftp://example.com/image.jpg",
  "data:image/png;base64,abc",
])("rejects unsupported image urls: %s", async (url) => {
  expect(
    articleSchema.safeParse({ ...valid, imageCoverURL: url }).success,
  ).toBe(false);
  await changeField("imageCoverURL", url);
  await advance();
  expect(renderer.root.findAllByType("Image")).toHaveLength(0);
  expect(publishButton().props.disabled).toBe(true);
});

it("trims the image url before validation and submission", async () => {
  await changeField("imageCoverURL", `  ${valid.imageCoverURL}  `);
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onLoad();
  });
  await act(async () => {
    await publishButton().props.onPress();
  });
  expect(submit.mock.calls[0][0].imageCoverURL).toBe(valid.imageCoverURL);
});

it("submits the markdown produced by the editor without stripping its formatting", async () => {
  const content =
    "## Cuidados\n\n**Escove os dentes** todos os dias.\n\n- Use uma escova macia.";
  await act(async () => {
    renderer.root.findByType("MarkdownEditor").props.onChangeText(content);
  });
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onLoad();
  });
  await act(async () => {
    await publishButton().props.onPress();
  });
  expect(submit.mock.calls[0][0].content).toBe(content);
});

it("opens a full article preview with current form values without submitting", async () => {
  const content = "## Rotina\n\n**Escove os dentes** todos os dias.";
  await act(async () => {
    renderer.root.findByType("MarkdownEditor").props.onChangeText(content);
  });
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onLoad();
  });
  const buttons = renderer.root.findAllByType("Button");
  const previewButton = buttons.find(
    (node: { props: { accessibilityLabel: string } }) =>
      node.props.accessibilityLabel === "Visualizar prévia do artigo",
  );
  expect(buttons.indexOf(previewButton)).toBeLessThan(
    buttons.indexOf(publishButton()),
  );
  expect(renderer.root.findAllByType("ArticleContent")).toHaveLength(0);
  await act(async () => {
    previewButton.props.onPress();
  });
  expect(renderer.root.findByType("ArticleContent").props).toMatchObject({
    title: "Cuidados com o sorriso infantil",
    summary: "Cuidados diários com os dentinhos.",
    content,
    imageCoverURL: valid.imageCoverURL,
    categories: valid.categories,
    readingTime: 1,
  });
  expect(submit).not.toHaveBeenCalled();
});

it("preserves edits when closing the preview and refreshes them on the next open", async () => {
  function open() {
    renderer.root
      .findAllByType("Button")
      .find(
        (node: { props: { accessibilityLabel: string } }) =>
          node.props.accessibilityLabel === "Visualizar prévia do artigo",
      )
      .props.onPress();
  }
  await act(async () => {
    open();
  });
  await act(async () => {
    renderer.root.findByType("BottomSheet").props.onClose();
  });
  expect(renderer.root.findAllByType("ArticleContent")).toHaveLength(0);
  expect(renderer.root.findByType("MarkdownEditor").props.value).toBe(
    valid.content,
  );
  await changeField("title", "Outro título do artigo");
  await act(async () => {
    open();
  });
  expect(renderer.root.findByType("ArticleContent").props.title).toBe(
    "Outro título do artigo",
  );
  expect(submit).not.toHaveBeenCalled();
});

it("allows a draft preview while keeping publication blocked for a failed image", async () => {
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onError();
  });
  await act(async () => {
    renderer.root
      .findAllByType("Button")
      .find(
        (node: { props: { accessibilityLabel: string } }) =>
          node.props.accessibilityLabel === "Visualizar prévia do artigo",
      )
      .props.onPress();
  });
  expect(renderer.root.findByType("ArticleContent").props.imageCoverURL).toBe(
    "",
  );
  expect(publishButton().props.disabled).toBe(true);
  expect(submit).not.toHaveBeenCalled();
});

it("replaces the loaded image with the url field and only loads a replacement after confirmation", async () => {
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onLoad();
  });
  expect(
    renderer.root
      .findAllByType("Field")
      .some(
        (node: { props: { name: string } }) =>
          node.props.name === "imageCoverURL",
      ),
  ).toBe(false);
  expect(publishButton().props.disabled).toBe(false);
  await act(async () => {
    imageAction("Editar imagem de capa").props.onPress();
  });
  expect(renderer.root.findAllByType("Image")).toHaveLength(0);
  expect(imageAction("Confirmar URL da imagem")).toBeDefined();
  expect(publishButton().props.disabled).toBe(true);
  const field = renderer.root
    .findAllByType("Field")
    .find(
      (node: { props: { name: string } }) =>
        node.props.name === "imageCoverURL",
    );
  expect(field.props.value).toBe(valid.imageCoverURL);
  await changeField("imageCoverURL", "https://example.com/new.jpg", false);
  await advance(1000);
  expect(renderer.root.findAllByType("Image")).toHaveLength(0);
  await act(async () => {
    await imageAction("Confirmar URL da imagem").props.onPress();
  });
  await advance();
  expect(renderer.root.findByType("Image").props.source.uri).toBe(
    "https://example.com/new.jpg",
  );
  expect(publishButton().props.disabled).toBe(true);
  await act(async () => {
    renderer.root.findByType("Image").props.onLoad();
  });
  expect(publishButton().props.disabled).toBe(false);
  expect(imageAction("Editar imagem de capa")).toBeDefined();
});

it("keeps url editing open if the check is pressed with an invalid address", async () => {
  await changeField("imageCoverURL", "invalid url", false);
  await act(async () => {
    await imageAction("Confirmar URL da imagem").props.onPress();
  });
  expect(imageAction("Confirmar URL da imagem")).toBeDefined();
  expect(renderer.root.findAllByType("Image")).toHaveLength(0);
  expect(publishButton().props.disabled).toBe(true);
  await act(async () => {
    await publishButton().props.onPress();
  });
  expect(submit).not.toHaveBeenCalled();
});

it("requires an explicit single category when editing legacy multiple categories", async () => {
  await act(async () => {
    renderer.unmount();
    renderer = create(
      <ArticleForm
        onSubmit={submit}
        defaultValues={{ ...valid, categories: ["Antiga", "Cuidados"] }}
      />,
    );
  });
  await changeField("title", "Novo título do artigo");
  await advance();
  await act(async () => {
    renderer.root.findByType("Image").props.onLoad();
    await publishButton().props.onPress();
  });
  expect(submit).not.toHaveBeenCalled();
  await act(async () => {
    renderer.root
      .findByType("PropsBadge")
      .props.onPress({ id: "category", name: "Cuidados", isSelected: true });
  });
  await act(async () => {
    await publishButton().props.onPress();
  });
  expect(submit).toHaveBeenCalledWith(
    expect.objectContaining({ categories: ["Cuidados"] }),
  );
});
