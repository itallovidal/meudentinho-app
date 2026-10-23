import { useState } from "react";
import { MarkdownEditor } from "@/components/markdownEditor";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({ View: "View" }));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-remark", () => ({ Markdown: "Markdown" }));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/ui/button", () => ({ Button: "Button" }));
jest.mock("@/components/ui/textarea", () => ({ Textarea: "Textarea" }));
jest.mock("@/components/ui/separator", () => ({ Separator: "Separator" }));
jest.mock("@/components/sectionHeader", () => ({
  SectionHeader: "SectionHeader",
}));
const { act, create } = jest.requireActual("react-test-renderer");
let renderer: ReturnType<typeof create>;
const focus = jest.fn();

function Harness({ editable = true }: { editable?: boolean }) {
  const [value, setValue] = useState("Cuide do sorriso");
  return (
    <MarkdownEditor value={value} onChangeText={setValue} editable={editable} />
  );
}

beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  focus.mockClear();
  await act(async () => {
    renderer = create(<Harness />, { createNodeMock: () => ({ focus }) });
  });
});
afterEach(async () => {
  await act(async () => {
    renderer.unmount();
  });
});

it("edits markdown without rendering an inline preview", async () => {
  const markdown = "## Cuidados\n\n**Escove** os dentes.";
  await act(async () => {
    renderer.root.findByType("Textarea").props.onChangeText(markdown);
  });
  expect(renderer.root.findByType("Textarea").props.value).toBe(markdown);
  expect(renderer.root.findAllByType("Markdown")).toHaveLength(0);
});

it("formats the native selection and returns focus to the input", async () => {
  await act(async () => {
    renderer.root.findByType("Textarea").props.onSelectionChange({
      nativeEvent: { selection: { start: 9, end: 16 } },
    });
  });
  await act(async () => {
    renderer.root
      .findAllByType("Button")
      .find(
        (node: { props: { accessibilityLabel: string } }) =>
          node.props.accessibilityLabel === "Negrito",
      )
      .props.onPress();
  });
  expect(renderer.root.findByType("Textarea").props.value).toBe(
    "Cuide do **sorriso**",
  );
  expect(renderer.root.findByType("Textarea").props.selection).toEqual({
    start: 11,
    end: 18,
  });
  expect(focus).toHaveBeenCalled();
});

it("keeps the editor empty after clearing the input", async () => {
  await act(async () => {
    renderer.root.findByType("Textarea").props.onChangeText("");
  });
  expect(renderer.root.findAllByType("Markdown")).toHaveLength(0);
  expect(renderer.root.findByType("Textarea").props.value).toBe("");
});

it("disables formatting and typing while the form is submitting", async () => {
  await act(async () => {
    renderer.update(<Harness editable={false} />);
  });
  expect(renderer.root.findByType("Textarea").props.editable).toBe(false);
  const buttons = renderer.root.findAllByType("Button");
  expect(
    buttons.every(
      (node: { props: { disabled: boolean } }) => node.props.disabled,
    ),
  ).toBe(true);
  await act(async () => {
    buttons[0].props.onPress();
  });
  expect(renderer.root.findByType("Textarea").props.value).toBe(
    "Cuide do sorriso",
  );
});
