import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import type { ComponentProps, ReactNode } from "react";
import { ToothAlertsPanel } from "@/components/smile/ToothAlertsPanel";
import type { ToothMilestone } from "@/lib/toothMilestones";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({ View: "View" }));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("@/components/card", () => ({ Card: "Card" }));
jest.mock("@/components/noticeCard", () => ({ NoticeCard: "NoticeCard" }));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/errorState", () => ({ ErrorState: "ErrorState" }));
jest.mock("@/components/queryWarningBanner", () => ({
  QueryWarningBanner: "QueryWarningBanner",
}));
jest.mock("@/skeletons/components/skeletonText", () => ({
  SkeletonText: "SkeletonText",
}));
jest.mock("@/components/smile/ToothAlertItem", () => ({
  ToothAlertItem: "ToothAlertItem",
}));
jest.mock("phosphor-react-native", () => ({
  CaretRightIcon: "CaretRightIcon",
  ClockCountdownIcon: "ClockCountdownIcon",
  ClockCounterClockwiseIcon: "ClockCounterClockwiseIcon",
  TimerIcon: "TimerIcon",
  InfoIcon: "InfoIcon",
  CheckIcon: "CheckIcon",
}));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("@/components/ui/bottomSheet", () => {
  const { createElement: mockCreateElement } =
    jest.requireActual<typeof import("react")>("react");
  return {
    BottomSheet: (props: {
      visible: boolean;
      header: ReactNode;
      children: (dismiss: () => void) => ReactNode;
    }) =>
      props.visible
        ? mockCreateElement(
            "BottomSheet",
            props,
            props.header,
            props.children(mockDismiss),
          )
        : null,
  };
});

const { act, create } = jest.requireActual<{
  act: typeof import("react").act;
  create: any;
}>("react-test-renderer");
const mockDismiss = jest.fn();
const active: ToothMilestone = {
  id: "active",
  kidId: "kid",
  toothType: "central_incisor",
  quadrant: "upper_right",
  arch: "upper",
  side: "right",
  dentition: "permanent",
  status: "overdue",
  windowStart: "2025-01-01",
  expectedEnd: "2026-01-01",
  limitDate: "2026-06-01",
  inTolerance: false,
  historical: false,
  chronologyVersion: "test",
};
const snoozed = { ...active, id: "snoozed" };
const historical = { ...active, id: "historical", historical: true };
let renderer: ReturnType<typeof create>;
let props: ComponentProps<typeof ToothAlertsPanel>;

async function openCategory(title: string) {
  await act(async () => {
    renderer.root
      .findAllByType("Card")
      .find((card: { props: { title: string } }) => card.props.title === title)
      .props.handlePress();
  });
}

beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  props = {
    active: [active],
    snoozed: [snoozed],
    historical: [historical],
    snoozes: [{ id: snoozed.id, snoozedUntil: "2026-10-30T12:00:00Z" }],
    ready: true,
    stale: false,
    loading: false,
    busy: false,
    onRetry: jest.fn(),
    onRegister: jest.fn(),
  };
  await act(async () => {
    renderer = create(<ToothAlertsPanel {...props} />);
  });
});

afterEach(async () => {
  await act(async () => renderer.unmount());
});

describe("independent tooth review categories", () => {
  it.each([
    { title: "Registros para revisar", expected: active },
    { title: "Avisos adiados", expected: snoozed },
    { title: "Histórico incompleto", expected: historical },
  ])(
    "opens only $title and its available actions",
    async ({ title, expected }) => {
      expect(renderer.root.findAllByType("BottomSheet")).toHaveLength(0);
      expect(renderer.root.findAllByType("Card")).toHaveLength(3);
      expect(renderer.root.findByType("NoticeCard").props.title).toBe(
        "Orientações de rotina",
      );

      await openCategory(title);

      const sheet = renderer.root.findByType("BottomSheet");
      const items = sheet.findAllByType("ToothAlertItem");
      expect(items).toHaveLength(1);
      expect(items[0].props.milestone).toEqual(expected);
      expect(sheet.findAllByType("NoticeCard")).toHaveLength(0);
      expect(
        sheet
          .findAllByType("Text")
          .some(
            (text: { props: { children: unknown } }) =>
              text.props.children === title,
          ),
      ).toBe(true);
      expect(typeof items[0].props.onPress).toBe("function");
      expect(items[0].props.onSnooze).toBeUndefined();
      if (expected.id === snoozed.id) {
        expect(items[0].props.snoozedUntil).toBe(props.snoozes[0].snoozedUntil);
      }
    },
  );

  it("waits for sheet dismissal before opening the selected card's form", async () => {
    await openCategory("Registros para revisar");
    await act(async () => {
      renderer.root.findByType("ToothAlertItem").props.onPress();
    });
    expect(mockDismiss).toHaveBeenCalledTimes(1);
    expect(props.onRegister).not.toHaveBeenCalled();

    await act(async () => {
      renderer.root.findByType("BottomSheet").props.onClose();
    });
    expect(renderer.root.findAllByType("BottomSheet")).toHaveLength(0);
    expect(props.onRegister).toHaveBeenCalledWith(active);
  });

  it("updates the selected list after an alert moves to snoozed", async () => {
    await openCategory("Registros para revisar");
    props = { ...props, active: [], snoozed: [snoozed, active] };
    await act(async () => renderer.update(<ToothAlertsPanel {...props} />));
    expect(renderer.root.findAllByType("ToothAlertItem")).toHaveLength(0);
    expect(
      renderer.root
        .findAllByType("NoticeCard")
        .some(
          (notice: { props: { title: string } }) =>
            notice.props.title === "Tudo em dia por aqui!",
        ),
    ).toBe(true);

    await act(async () =>
      renderer.root.findByType("BottomSheet").props.onClose(),
    );
    await openCategory("Avisos adiados");
    expect(
      renderer.root
        .findAllByType("ToothAlertItem")
        .map(
          (item: { props: { milestone: ToothMilestone } }) =>
            item.props.milestone.id,
        ),
    ).toEqual(["snoozed", "active"]);
  });

  it.each(["Registros para revisar", "Avisos adiados", "Histórico incompleto"])(
    "keeps an empty %s category accessible",
    async (title) => {
      props = { ...props, active: [], snoozed: [], historical: [] };
      await act(async () => renderer.update(<ToothAlertsPanel {...props} />));
      await openCategory(title);
      const sheet = renderer.root.findByType("BottomSheet");
      expect(sheet.findAllByType("ToothAlertItem")).toHaveLength(0);
      expect(sheet.findAllByType("NoticeCard")).toHaveLength(1);
    },
  );

  it.each([
    { stale: true, busy: false },
    { stale: false, busy: true },
  ])("disables actions when stale=$stale and busy=$busy", async (state) => {
    props = {
      ...props,
      ...state,
    };
    await act(async () => renderer.update(<ToothAlertsPanel {...props} />));
    await openCategory("Registros para revisar");
    expect(renderer.root.findByType("ToothAlertItem").props.disabled).toBe(
      true,
    );
    const sheet = renderer.root.findByType("BottomSheet");
    expect(sheet.findAllByType("QueryWarningBanner")).toHaveLength(
      state.stale ? 1 : 0,
    );
  });

  it("keeps skeletons visible beside an initial load error", async () => {
    props = {
      ...props,
      ready: false,
      errorMessage: "Falha ao carregar avisos.",
    };
    await act(async () => renderer.update(<ToothAlertsPanel {...props} />));
    expect(renderer.root.findAllByType("SkeletonText")).toHaveLength(2);
    expect(renderer.root.findAllByType("ErrorState")).toHaveLength(1);
    expect(renderer.root.findAllByType("Card")).toHaveLength(0);
  });
});
