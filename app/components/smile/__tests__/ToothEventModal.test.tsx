import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ToothEventModal } from "@/components/smile/ToothEventModal";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";
import { parseToothId } from "@/lib/teethLabels";

jest.mock("@/components/infoPopover", () => ({ InfoPopover: "InfoPopover" }));
jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({ Pressable: "Pressable", View: "View" }));
jest.mock("react-native-web/dist/exports/Pressable", () => "Pressable", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("@/components/ui/input", () => ({ Input: "Input" }));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/ui/textarea", () => ({ Textarea: "Textarea" }));
jest.mock("phosphor-react-native", () => ({
  CalendarBlankIcon: "CalendarBlankIcon",
  CheckIcon: "CheckIcon",
}));
jest.mock("@/components/smile/datePickerSheet", () => ({
  DatePickerSheet: "DatePickerSheet",
}));
jest.mock("@/components/smile/teeth/ToothSVG", () => ({
  ToothSVG: "ToothSVG",
}));
jest.mock("@/components/smile/ToothEventCard", () => ({
  eventToothState: () => "bornPermanent",
}));
jest.mock("@/components/ui/bottomSheet", () => ({
  BottomSheet: ({ children }: { children: (dismiss: () => void) => unknown }) =>
    children(() => {}),
}));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));

const { act, create } = require("react-test-renderer");

describe("ToothEventModal independent permanent teeth", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-22T12:00:00-03:00"));
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(
    [
      "upper_right_first_molar",
      "upper_left_first_molar",
      "lower_right_first_molar",
      "lower_left_first_molar",
      "upper_right_second_molar",
      "upper_left_second_molar",
      "lower_right_second_molar",
      "lower_left_second_molar",
    ].flatMap((toothId) =>
      (["eruption", "exfoliation"] as const).map((eventType) => ({
        toothId,
        eventType,
      })),
    ),
  )(
    "submits $toothId $eventType without primary events",
    async ({ toothId, eventType }) => {
      const submitted: ToothEventRequestDTO[] = [];
      const parsed = parseToothId(toothId)!;
      const events: ToothEvent[] =
        eventType === "exfoliation"
          ? [
              {
                ...parsed,
                id: "eruption-1",
                kidId: "kid-1",
                parentId: "parent-1",
                occurrenceDate: "2026-10-01T12:00:00-03:00",
                createdAt: "2026-10-01T12:00:00-03:00",
                updatedAt: "2026-10-01T12:00:00-03:00",
                dentition: "permanent",
                eventType: "eruption",
              },
            ]
          : [];
      const props = {
        visible: false,
        toothId,
        kidId: "kid-1",
        kidBirthDate: "2019-10-22",
        kidGender: null,
        toothEvents: events,
        events,
        onClose: () => {},
        onSubmit: async (payload: ToothEventRequestDTO) => {
          submitted.push(payload);
        },
      };
      let renderer: ReturnType<typeof create>;
      await act(async () => {
        renderer = create(<ToothEventModal {...props} />);
      });
      await act(async () => {
        renderer.update(<ToothEventModal {...props} visible />);
      });
      const permanent = renderer.root
        .findAllByType("Pressable")
        .find(
          (node: any) =>
            node.props.accessibilityRole === "radio" &&
            node
              .findAllByType("Text")
              .some((text: any) => text.props.children === "Permanente"),
        );
      expect(permanent.props.disabled).toBe(false);
      expect(permanent.props.accessibilityState.selected).toBe(true);
      const primary = renderer.root
        .findAllByType("Pressable")
        .find(
          (node: any) =>
            node.props.accessibilityRole === "radio" &&
            node
              .findAllByType("Text")
              .some((text: any) => text.props.children === "De leite"),
        );
      expect(primary.props.disabled).toBe(true);
      expect(primary.props.accessibilityState.selected).toBe(false);
      if (eventType === "eruption") {
        const fall = renderer.root
          .findAllByType("Pressable")
          .find(
            (node: any) =>
              node.props.accessibilityRole === "radio" &&
              node
                .findAllByType("Text")
                .some((text: any) => text.props.children === "Caiu"),
          );
        expect(fall.props.disabled).toBe(true);
      }
      const confirm = renderer.root
        .findAllByType("Pressable")
        .find((node: any) =>
          node
            .findAllByType("Text")
            .some((text: any) => text.props.children === "Confirmar"),
        );
      expect(confirm.props.disabled).toBe(false);
      await act(async () => {
        confirm.props.onPress();
      });
      expect(submitted).toEqual([
        expect.objectContaining({
          kidId: "kid-1",
          dentition: "permanent",
          eventType,
          toothType: toothId.split("_").slice(2).join("_"),
        }),
      ]);
      await act(async () => {
        renderer.unmount();
      });
    },
  );

  it.each([
    "upper_right_first_premolar",
    "upper_left_first_premolar",
    "lower_right_first_premolar",
    "lower_left_first_premolar",
    "upper_right_second_premolar",
    "upper_left_second_premolar",
    "lower_right_second_premolar",
    "lower_left_second_premolar",
  ])("registers the complete four-stage cycle for %s", async (toothId) => {
    const events: ToothEvent[] = [];
    const submitted: ToothEventRequestDTO[] = [];
    const props = {
      toothId,
      kidId: "kid-1",
      kidBirthDate: "2014-10-22",
      kidGender: null,
      events,
      toothEvents: events,
      onClose: () => {},
      onSubmit: async (payload: ToothEventRequestDTO) => {
        submitted.push(payload);
      },
    };
    let renderer: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(<ToothEventModal {...props} visible={false} />);
    });
    const stages: Pick<ToothEventRequestDTO, "dentition" | "eventType">[] = [
      { dentition: "primary", eventType: "eruption" },
      { dentition: "primary", eventType: "exfoliation" },
      { dentition: "permanent", eventType: "eruption" },
      { dentition: "permanent", eventType: "exfoliation" },
    ];
    function control(label: string) {
      return renderer.root
        .findAllByType("Pressable")
        .find((node: any) =>
          node
            .findAllByType("Text")
            .some((text: any) => text.props.children === label),
        );
    }
    for (const stage of stages) {
      await act(async () => {
        renderer.update(
          <ToothEventModal
            {...props}
            events={[...events]}
            toothEvents={[...events]}
            visible
          />,
        );
      });
      const primary = control("De leite");
      const permanent = control("Permanente");
      expect(primary.props.accessibilityState.selected).toBe(
        stage.dentition === "primary",
      );
      expect(permanent.props.accessibilityState.selected).toBe(
        stage.dentition === "permanent",
      );
      expect(permanent.props.disabled).toBe(stage.dentition === "primary");
      expect(
        control(stage.eventType === "eruption" ? "Nasceu" : "Caiu").props
          .accessibilityState.selected,
      ).toBe(true);
      const confirm = control("Confirmar");
      expect(confirm.props.disabled).toBe(false);
      await act(async () => {
        confirm.props.onPress();
      });
      const payload = submitted[submitted.length - 1];
      expect(payload).toEqual(expect.objectContaining(stage));
      events.push({
        ...payload,
        id: `event-${events.length}`,
        parentId: "parent-1",
        createdAt: payload.occurrenceDate,
        updatedAt: payload.occurrenceDate,
      });
      await act(async () => {
        renderer.update(<ToothEventModal {...props} visible={false} />);
      });
    }
    expect(submitted).toHaveLength(4);
    await act(async () => {
      renderer.unmount();
    });
  });
  it.each([
    { toothId: "upper_right_first_molar", dentition: "primary" },
    { toothId: "lower_left_second_molar", dentition: "primary" },
    { toothId: "upper_right_first_molar", dentition: "permanent" },
    { toothId: "lower_left_second_molar", dentition: "permanent" },
    { toothId: "upper_right_first_premolar", dentition: "permanent" },
    { toothId: "lower_left_second_premolar", dentition: "permanent" },
  ] as const)(
    "preserves $dentition identity when editing $toothId",
    async ({ toothId, dentition }) => {
      const editingEvent: ToothEvent = {
        ...parseToothId(toothId)!,
        id: "event-1",
        kidId: "kid-1",
        parentId: "parent-1",
        occurrenceDate: "2026-10-01T12:00:00-03:00",
        createdAt: "2026-10-01T12:00:00-03:00",
        updatedAt: "2026-10-01T12:00:00-03:00",
        dentition,
        eventType: "eruption",
        note: "Original",
      };
      const submitted: ToothEventRequestDTO[] = [];
      let renderer: ReturnType<typeof create>;
      await act(async () => {
        renderer = create(
          <ToothEventModal
            visible
            toothId={toothId}
            kidId="kid-1"
            kidBirthDate="2014-10-22"
            kidGender={null}
            editingEvent={editingEvent}
            events={[editingEvent]}
            toothEvents={[]}
            onClose={() => {}}
            onSubmit={async (payload) => {
              submitted.push(payload);
            }}
          />,
        );
      });
      function saveButton() {
        return renderer.root
          .findAllByType("Pressable")
          .find((node: any) =>
            node
              .findAllByType("Text")
              .some((text: any) => text.props.children === "Salvar alterações"),
          );
      }
      expect(saveButton().props.disabled).toBe(true);
      await act(async () => {
        renderer.root.findByType("Textarea").props.onChangeText("Updated note");
      });
      expect(saveButton().props.disabled).toBe(false);
      await act(async () => {
        saveButton().props.onPress();
      });
      expect(submitted).toEqual([
        expect.objectContaining({
          dentition,
          toothType: editingEvent.toothType,
          eventType: editingEvent.eventType,
          note: "Updated note",
        }),
      ]);
      await act(async () => {
        renderer.unmount();
      });
    },
  );
});
