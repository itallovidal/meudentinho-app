import type { ComponentProps } from "react";
import { DentalMap } from "@/components/smile/DentalMap";
import { TOOTH_STYLE } from "@/components/smile/teeth/toothStyle";
import * as toothMilestones from "@/lib/toothMilestones";
import { buildSmileSummary } from "@/lib/smileSummary";
import type { ToothEvent } from "@/types/teeth";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({
  View: "View",
  Pressable: "Pressable",
  TouchableOpacity: "TouchableOpacity",
  Platform: { OS: "web" },
}));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Pressable", () => "Pressable", {
  virtual: true,
});
jest.mock(
  "react-native-web/dist/exports/TouchableOpacity",
  () => "TouchableOpacity",
  { virtual: true },
);
jest.mock("react-native-web/dist/exports/Platform", () => ({ OS: "web" }), {
  virtual: true,
});
jest.mock("react-native-svg", () => ({
  __esModule: true,
  default: "Svg",
  Path: "Path",
}));
jest.mock("@react-navigation/native", () => ({ useFocusEffect: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
jest.mock("@/hooks/useContainerWidth", () => ({
  useContainerWidth: () => ({ width: 368, onLayout: jest.fn() }),
}));
jest.mock("@/components/collapsibleSection", () => ({
  CollapsibleSection: "CollapsibleSection",
}));
jest.mock("@/components/ui/separator", () => ({ Separator: "Separator" }));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/wrapper", () => ({ Wrapper: "Wrapper" }));
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("@/components/infoPopover", () => ({ InfoPopover: "InfoPopover" }));
jest.mock("@/components/smile/ToothEventModal", () => ({
  ToothEventModal: "ToothEventModal",
}));
jest.mock("@/components/smile/teeth/ToothSVG", () => ({
  ToothSVG: "ToothSVG",
}));

const { act, create } = jest.requireActual("react-test-renderer");
let renderer: ReturnType<typeof create>;
let props: ComponentProps<typeof DentalMap>;
const milk: ToothEvent = {
  id: "milk",
  parentId: "parent",
  kidId: "kid",
  occurrenceDate: "2019-07-01T12:00:00-03:00",
  dentition: "primary",
  arch: "upper",
  side: "right",
  toothType: "central_incisor",
  eventType: "eruption",
  quadrant: "upper_right",
  createdAt: "2019-07-01T12:00:00-03:00",
  updatedAt: "2019-07-01T12:00:00-03:00",
};

function tooth(name: string) {
  return renderer.root
    .findAllByType("TouchableOpacity")
    .find((node: { props: { accessibilityLabel: string } }) =>
      node.props.accessibilityLabel.startsWith(name),
    );
}

beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  props = {
    kidId: "kid",
    kidBirthDate: "2018-09-01",
    kidGender: "male",
    events: [milk],
    referenceDate: new Date("2026-08-01T12:00:00-03:00"),
    onRegisterEvent: jest.fn(),
    onEditEvent: jest.fn(),
  };
  await act(async () => {
    renderer = create(<DentalMap {...props} />);
  });
});

afterEach(async () => {
  await act(async () => renderer.unmount());
  jest.restoreAllMocks();
});

it.each(["eruption", "exfoliation"] as const)(
  "highlights the pending permanent without hiding milk %s",
  async (eventType) => {
    props = { ...props, events: [{ ...milk, eventType }] };
    await act(async () => renderer.update(<DentalMap {...props} />));
    const position = tooth("Incisivo Central Superior Direito");
    expect(position.findByType("ToothSVG").props.halfFill).toBe(
      TOOTH_STYLE.eruptionWindow.fill,
    );
    expect(position.findByType("ToothSVG").props.fill).toBe(
      TOOTH_STYLE[eventType === "eruption" ? "bornMilk" : "fell"].fill,
    );
    expect(position.findByType("ToothSVG").props.halfFillSide).toBe("bottom");
    expect(position.findByType("ToothSVG").props.strokeDasharray).toBeDefined();
    expect(position.props.accessibilityLabel).toContain(
      "nascimento permanente esperado",
    );
    expect(position.props.accessibilityLabel).toContain(
      "metade voltada para o centro da boca amarela",
    );
    expect(position.props.accessibilityLabel).toContain(
      eventType === "eruption" ? "nasceu" : "caiu",
    );
    const highlighted = renderer.root
      .findAllByType("TouchableOpacity")
      .filter(
        (node: ReturnType<typeof tooth>) =>
          node.findByType("ToothSVG").props.halfFill ===
            TOOTH_STYLE.eruptionWindow.fill ||
          node.findByType("ToothSVG").props.fill ===
            TOOTH_STYLE.eruptionWindow.fill,
      ).length;
    expect(highlighted).toBe(
      buildSmileSummary(
        props.kidBirthDate,
        props.events,
        props.kidGender,
        props.referenceDate,
      ).eruptionWindow,
    );
  },
);

it.each(["dated", "presence", "undated"] as const)(
  "removes the indicator for a permanent %s registration",
  async (recordKind) => {
    props = {
      ...props,
      events: [
        milk,
        { ...milk, id: "permanent", dentition: "permanent", recordKind },
      ],
    };
    await act(async () => renderer.update(<DentalMap {...props} />));
    const position = tooth("Incisivo Central Superior Direito");
    expect(position.findByType("ToothSVG").props.halfFill).toBeUndefined();
    expect(position.props.accessibilityLabel).not.toContain(
      "nascimento permanente esperado",
    );
  },
);

it("recalculates the indicator and legend when only gender changes", async () => {
  const build = jest.spyOn(toothMilestones, "buildToothMilestones");
  props = {
    ...props,
    kidBirthDate: "2019-06-17",
    events: [],
    referenceDate: new Date("2026-07-17T12:00:00-03:00"),
  };
  await act(async () => renderer.update(<DentalMap {...props} />));
  build.mockClear();
  props = { ...props, kidGender: "female" };
  await act(async () => renderer.update(<DentalMap {...props} />));
  expect(build).toHaveBeenCalledWith(
    expect.objectContaining({ gender: "female" }),
  );
  const after = buildSmileSummary(
    props.kidBirthDate,
    [],
    "female",
    props.referenceDate,
  ).eruptionWindow;
  const highlighted = renderer.root
    .findAllByType("TouchableOpacity")
    .filter(
      (node: ReturnType<typeof tooth>) =>
        node.findByType("ToothSVG").props.halfFill ===
          TOOTH_STYLE.eruptionWindow.fill ||
        node.findByType("ToothSVG").props.fill ===
          TOOTH_STYLE.eruptionWindow.fill,
    ).length;
  expect(highlighted).toBe(after);
  const row = renderer.root
    .findAllByType("Wrapper")
    .find((node: ReturnType<typeof tooth>) => {
      const texts = node.findAllByType("Text");
      return texts.length === 3 && texts[0].props.children === "Hora de nascer";
    });
  expect(row.findAllByType("Text")[2].props.children).toBe(after);
});

it("does not advertise the ended range as time to erupt", async () => {
  props = { ...props, referenceDate: new Date("2026-09-02T00:00:00-03:00") };
  await act(async () => renderer.update(<DentalMap {...props} />));
  expect(
    tooth("Incisivo Central Superior Direito").findByType("ToothSVG").props
      .halfFill,
  ).toBeUndefined();
});

it("keeps the unregistered state recognizable inside the current window", async () => {
  props = { ...props, events: [] };
  await act(async () => renderer.update(<DentalMap {...props} />));
  const position = tooth("Incisivo Central Superior Direito");
  expect(position.findByType("ToothSVG").props.halfFill).toBeUndefined();
  expect(position.findByType("ToothSVG").props.fill).toBe(
    TOOTH_STYLE.eruptionWindow.fill,
  );
});

it("does not highlight a permanent tooth already recorded as lost", async () => {
  props = {
    ...props,
    events: [{ ...milk, dentition: "permanent", eventType: "exfoliation" }],
  };
  await act(async () => renderer.update(<DentalMap {...props} />));
  expect(
    tooth("Incisivo Central Superior Direito").findByType("ToothSVG").props
      .halfFill,
  ).toBeUndefined();
});

it("keeps future permanent predictions in the recorded color", async () => {
  props = { ...props, kidBirthDate: "2021-10-27" };
  await act(async () => renderer.update(<DentalMap {...props} />));
  const position = tooth("Incisivo Central Superior Direito");
  expect(position.findByType("ToothSVG").props.halfFill).toBeUndefined();
  expect(position.findByType("ToothSVG").props.fill).toBe(
    TOOTH_STYLE.bornMilk.fill,
  );
});

it("places yellow on the upper half of a lower-arch tooth", async () => {
  props = {
    ...props,
    events: [
      {
        ...milk,
        arch: "lower",
        quadrant: "lower_right",
        toothType: "lateral_incisor",
      },
    ],
  };
  await act(async () => renderer.update(<DentalMap {...props} />));
  const svg = tooth("Incisivo Lateral Inferior Direito").findByType("ToothSVG");
  expect(svg.props.halfFill).toBe(TOOTH_STYLE.eruptionWindow.fill);
  expect(svg.props.halfFillSide).toBe("top");
  expect(svg.props.fill).toBe(TOOTH_STYLE.bornMilk.fill);
});

it("shows an entirely yellow tooth in the eruption legend", () => {
  const row = renderer.root
    .findAllByType("Wrapper")
    .find((node: ReturnType<typeof tooth>) => {
      const texts = node.findAllByType("Text");
      return texts.length === 3 && texts[0].props.children === "Hora de nascer";
    });
  const svg = row.findByType("ToothSVG");
  expect(svg.props.fill).toBe(TOOTH_STYLE.eruptionWindow.fill);
  expect(svg.props.stroke).toBe(TOOTH_STYLE.eruptionWindow.stroke);
  expect(svg.props.halfFill).toBeUndefined();
  expect(svg.props.strokeDasharray).toBeUndefined();
});

it("opens creation on a simple tap even when the tooth has a record", async () => {
  await act(async () =>
    tooth("Incisivo Central Superior Direito").props.onPress(),
  );
  expect(renderer.root.findByType("ToothEventModal").props.visible).toBe(true);
  expect(props.onEditEvent).not.toHaveBeenCalled();
});

it("opens the editor on long press without opening creation", async () => {
  await act(async () =>
    tooth("Incisivo Central Superior Direito").props.onLongPress(),
  );
  expect(props.onEditEvent).toHaveBeenCalledWith(milk);
  expect(renderer.root.findByType("ToothEventModal").props.visible).toBe(false);
  expect(props.onRegisterEvent).not.toHaveBeenCalled();
});

it("edits the latest stage of the same tooth regardless of input order", async () => {
  const permanent: ToothEvent = {
    ...milk,
    id: "permanent",
    dentition: "permanent",
    occurrenceDate: "2026-07-01T12:00:00-03:00",
  };
  props = {
    ...props,
    events: [
      permanent,
      { ...milk, id: "other-side", quadrant: "upper_left", side: "left" },
      { ...milk, id: "fell", eventType: "exfoliation" },
      milk,
    ],
  };
  await act(async () => renderer.update(<DentalMap {...props} />));
  await act(async () =>
    tooth("Incisivo Central Superior Direito").props.onLongPress(),
  );
  expect(props.onEditEvent).toHaveBeenCalledWith(permanent);
});

it("exposes editing as an accessibility action", async () => {
  const position = tooth("Incisivo Central Superior Direito");
  expect(position.props.accessibilityHint).toContain("Toque e segure");
  expect(position.props.accessibilityActions).toContainEqual({
    name: "longpress",
    label: "Editar último registro",
  });
  await act(async () =>
    position.props.onAccessibilityAction({
      nativeEvent: { actionName: "longpress" },
    }),
  );
  expect(props.onEditEvent).toHaveBeenCalledWith(milk);
});

it("does not offer editing for an unregistered tooth", () => {
  const position = tooth("Incisivo Central Superior Esquerdo");
  expect(position.props.onLongPress).toBeUndefined();
  expect(position.props.accessibilityActions).toBeUndefined();
});

it("supports long press through the native arch touch surface", async () => {
  const nativePlatform = jest.requireMock("react-native").Platform;
  const webPlatform = jest.requireMock(
    "react-native-web/dist/exports/Platform",
  );
  nativePlatform.OS = "android";
  webPlatform.OS = "android";
  try {
    await act(async () => renderer.update(<DentalMap {...props} />));
    const overlay = renderer.root
      .findAllByType("Pressable")
      .find(
        (node: { props: { onLongPress?: unknown } }) =>
          typeof node.props.onLongPress === "function",
      );
    await act(async () =>
      overlay.props.onLongPress({
        nativeEvent: { locationX: 146, locationY: 30 },
      }),
    );
    expect(props.onEditEvent).toHaveBeenCalledWith(milk);
    expect(renderer.root.findByType("ToothEventModal").props.visible).toBe(
      false,
    );
  } finally {
    nativePlatform.OS = "web";
    webPlatform.OS = "web";
  }
});
