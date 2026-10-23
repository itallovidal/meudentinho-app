import { ApiError } from "@/types/domain";
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

jest.mock("@/components/forms/animatedCheckbox", () => ({
  AnimatedCheckbox: "AnimatedCheckbox",
}));
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
jest.mock("@/components/ui/button", () => ({ Button: "Button" }));
jest.mock("@/components/queryWarningBanner", () => ({
  QueryWarningBanner: "QueryWarningBanner",
}));
jest.mock("phosphor-react-native", () => ({
  CalendarBlankIcon: "CalendarBlankIcon",
  CheckIcon: "CheckIcon",
  ClockIcon: "ClockIcon",
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
    children(mockDismiss),
}));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));

const { act, create } = jest.requireActual<{
  act: typeof import("react").act;
  create: any;
}>("react-test-renderer");
const mockDismiss = jest.fn();

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

it("submits a permanent confirmation without a fabricated date or primary history", async () => {
  const submitted: ToothEventRequestDTO[] = [];
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <ToothEventModal
        visible
        toothId="upper_right_central_incisor"
        kidId="kid"
        kidBirthDate="2015-01-01"
        kidGender={null}
        events={[]}
        toothEvents={[]}
        initialDentition="permanent"
        initialDateUnknown
        onClose={() => {}}
        onSubmit={async (payload) => {
          submitted.push(payload);
        }}
      />,
    );
  });
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
      recordKind: "undated",
      occurrenceDate: "",
      dentition: "permanent",
      eventType: "eruption",
    }),
  ]);
  await act(async () => {
    renderer.unmount();
  });
});

it("converts an undated confirmation using the date supplied by the responsible adult", async () => {
  const submitted: ToothEventRequestDTO[] = [];
  const editingEvent: ToothEvent = {
    ...parseToothId("upper_right_central_incisor")!,
    id: "presence",
    kidId: "kid",
    parentId: "parent",
    dentition: "permanent",
    eventType: "eruption",
    recordKind: "presence",
    occurrenceDate: "",
    confirmedAt: "2026-10-02T12:00:00Z",
    createdAt: "2026-10-02T12:00:00Z",
    updatedAt: "2026-10-02T12:00:00Z",
    historyIncomplete: true,
  };
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <ToothEventModal
        visible
        toothId="upper_right_central_incisor"
        kidId="kid"
        kidBirthDate="2015-01-01"
        kidGender={null}
        events={[]}
        toothEvents={[]}
        editingEvent={editingEvent}
        onClose={() => {}}
        onSubmit={async (payload) => {
          submitted.push(payload);
        }}
      />,
    );
  });
  const unknown = renderer.root.findByType("AnimatedCheckbox");
  expect(unknown.props.checked).toBe(true);
  await act(async () => {
    unknown.props.onChange(false);
  });
  await act(async () => {
    renderer.root.findByType("DatePickerSheet").props.onConfirm("2026-10-01");
  });
  const confirm = renderer.root
    .findAllByType("Pressable")
    .find((node: any) =>
      node
        .findAllByType("Text")
        .some((text: any) => text.props.children === "Salvar alterações"),
    );
  await act(async () => {
    confirm.props.onPress();
  });
  expect(submitted[0]).toEqual(
    expect.objectContaining({
      recordKind: "dated",
      occurrenceDate: expect.stringContaining("2026-10-01"),
      historyIncomplete: true,
    }),
  );
  await act(async () => {
    renderer.unmount();
  });
});

it("keeps the form open and shows the actual registration error", async () => {
  const onClose = jest.fn();
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <ToothEventModal
        visible
        toothId="upper_right_first_molar"
        kidId="kid"
        kidBirthDate="2015-01-01"
        kidGender={null}
        events={[]}
        toothEvents={[]}
        initialDentition="permanent"
        initialDateUnknown
        onClose={onClose}
        onSubmit={async () => {
          throw new ApiError(
            "Este dente já possui este registro cadastrado.",
            "TOOTH_EVENT_DUPLICATE",
            409,
          );
        }}
      />,
    );
  });
  const confirm = renderer.root
    .findAllByType("Pressable")
    .find((node: any) =>
      node
        .findAllByType("Text")
        .some((text: any) => text.props.children === "Confirmar"),
    );
  await act(async () => {
    confirm.props.onPress();
  });
  expect(onClose).not.toHaveBeenCalled();
  expect(
    renderer.root
      .findAllByType("Text")
      .some(
        (node: any) =>
          node.props.children ===
          "Este dente já possui este registro cadastrado.",
      ),
  ).toBe(true);
  await act(async () => {
    renderer.unmount();
  });
});

describe("unknown event dates", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-22T12:00:00-03:00"));
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    { dentition: "primary", eventType: "eruption" },
    { dentition: "primary", eventType: "exfoliation" },
    { dentition: "permanent", eventType: "eruption" },
    { dentition: "permanent", eventType: "exfoliation" },
  ] as const)(
    "registers $dentition $eventType without a date",
    async (stage) => {
      const toothId = "upper_right_first_premolar";
      const stages = [
        { dentition: "primary", eventType: "eruption" },
        { dentition: "primary", eventType: "exfoliation" },
        { dentition: "permanent", eventType: "eruption" },
        { dentition: "permanent", eventType: "exfoliation" },
      ] as const;
      const current = stages.findIndex(
        (item) =>
          item.dentition === stage.dentition &&
          item.eventType === stage.eventType,
      );
      const events: ToothEvent[] = stages
        .slice(0, current)
        .map((item, index) => ({
          ...parseToothId(toothId)!,
          ...item,
          id: `prior-${index}`,
          kidId: "kid",
          parentId: "parent",
          occurrenceDate: "2026-10-01T12:00:00Z",
          createdAt: "2026-10-01T12:00:00Z",
          updatedAt: "2026-10-01T12:00:00Z",
        }));
      const submitted: ToothEventRequestDTO[] = [];
      let renderer: ReturnType<typeof create>;
      await act(async () => {
        renderer = create(
          <ToothEventModal
            visible
            toothId={toothId}
            kidId="kid"
            kidBirthDate="2014-01-01"
            kidGender={null}
            events={events}
            toothEvents={events}
            onClose={() => {}}
            onSubmit={async (payload) => {
              submitted.push(payload);
            }}
          />,
        );
      });
      const checkbox = () => renderer.root.findByType("AnimatedCheckbox");
      const calendar = () =>
        renderer.root
          .findAllByType("Pressable")
          .find(
            (node: any) => node.props.accessibilityLabel === "Abrir calendário",
          );
      await act(async () => {
        renderer.root
          .findByType("DatePickerSheet")
          .props.onConfirm("2026-10-05");
      });
      expect(renderer.root.findByType("Input").props.value).toBe("05/10/2026");
      expect(checkbox().props.accessibilityLabel).toBe("Não sei informar");
      await act(async () => {
        checkbox().props.onChange(true);
      });
      expect(calendar().props.disabled).toBe(true);
      expect(renderer.root.findByType("Input").props.value).toBe("");
      expect(renderer.root.findByType("Input").props.placeholder).toBe(
        "Data não informada",
      );
      await act(async () => {
        checkbox().props.onChange(false);
      });
      expect(calendar().props.disabled).toBe(false);
      expect(renderer.root.findByType("Input").props.value).toBe("05/10/2026");
      await act(async () => {
        checkbox().props.onChange(true);
      });
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
          ...stage,
          recordKind: "undated",
          occurrenceDate: "",
        }),
      ]);
      await act(async () => {
        renderer.unmount();
      });
    },
  );

  it("keeps an undated loss unchanged until the user edits it", async () => {
    const editingEvent: ToothEvent = {
      ...parseToothId("upper_right_first_molar")!,
      id: "loss",
      kidId: "kid",
      parentId: "parent",
      dentition: "permanent",
      eventType: "exfoliation",
      recordKind: "undated",
      occurrenceDate: "",
      confirmedAt: "2026-10-02T12:00:00Z",
      createdAt: "2026-10-02T12:00:00Z",
      updatedAt: "2026-10-02T12:00:00Z",
    };
    const submitted: ToothEventRequestDTO[] = [];
    let renderer: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(
        <ToothEventModal
          visible
          toothId="upper_right_first_molar"
          kidId="kid"
          kidBirthDate="2014-01-01"
          kidGender={null}
          events={[editingEvent]}
          toothEvents={[]}
          editingEvent={editingEvent}
          onClose={() => {}}
          onSubmit={async (payload) => {
            submitted.push(payload);
          }}
        />,
      );
    });
    const save = () =>
      renderer.root
        .findAllByType("Pressable")
        .find((node: any) =>
          node
            .findAllByType("Text")
            .some((text: any) => text.props.children === "Salvar alterações"),
        );
    expect(renderer.root.findByType("AnimatedCheckbox").props.checked).toBe(
      true,
    );
    expect(save().props.disabled).toBe(true);
    await act(async () => {
      renderer.root.findByType("AnimatedCheckbox").props.onChange(false);
    });
    await act(async () => {
      renderer.root.findByType("DatePickerSheet").props.onConfirm("2026-10-01");
    });
    expect(save().props.disabled).toBe(false);
    await act(async () => {
      save().props.onPress();
    });
    expect(submitted).toEqual([
      expect.objectContaining({
        eventType: "exfoliation",
        recordKind: "dated",
        occurrenceDate: expect.stringContaining("2026-10-01"),
      }),
    ]);
    await act(async () => {
      renderer.unmount();
    });
  });
});

describe("snoozing from the registration sheet", () => {
  let renderer: ReturnType<typeof create>;
  let props: import("react").ComponentProps<typeof ToothEventModal>;

  function confirmButton() {
    return renderer.root
      .findAllByType("Pressable")
      .find((node: any) =>
        node
          .findAllByType("Text")
          .some((text: any) => text.props.children === "Confirmar"),
      );
  }

  beforeEach(async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    mockDismiss.mockClear();
    props = {
      visible: true,
      toothId: "upper_right_central_incisor",
      kidId: "kid",
      kidBirthDate: "2015-01-01",
      kidGender: null,
      events: [],
      toothEvents: [],
      initialDentition: "permanent",
      onClose: jest.fn(),
      onSubmit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      onSnooze: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    await act(async () => {
      renderer = create(<ToothEventModal {...props} />);
    });
  });

  afterEach(async () => {
    await act(async () => renderer.unmount());
  });

  it("lets the user choose whether the date and earlier milk history are known", async () => {
    const history = renderer.root
      .findAllByType("AnimatedCheckbox")
      .find(
        (node: any) =>
          node.props.accessibilityLabel ===
          "Não tenho o histórico anterior de leite",
      );
    const date = renderer.root
      .findAllByType("AnimatedCheckbox")
      .find(
        (node: any) => node.props.accessibilityLabel === "Não sei informar",
      );
    expect(history.props.checked).toBe(false);
    expect(date.props.checked).toBe(false);
    expect(confirmButton().props.disabled).toBe(true);
    await act(async () => history.props.onChange(true));
    expect(confirmButton().props.disabled).toBe(false);
    await act(async () => date.props.onChange(true));
    await act(async () => confirmButton().props.onPress());
    expect(props.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        occurrenceDate: "",
        recordKind: "undated",
        historyIncomplete: true,
        dentition: "permanent",
      }),
    );
  });

  it("snoozes without requiring a valid date or earlier milk records", async () => {
    await act(async () =>
      renderer.root.findByType("DatePickerSheet").props.onConfirm("invalid"),
    );
    expect(confirmButton().props.disabled).toBe(true);
    const snooze = renderer.root.findByType("Button");
    expect(snooze.props.disabled).toBe(false);
    await act(async () => snooze.props.onPress());
    expect(props.onSnooze).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("shows a snooze failure in the form and allows retrying", async () => {
    props = {
      ...props,
      onSnooze: jest
        .fn<() => Promise<void>>()
        .mockRejectedValueOnce(
          new ApiError("Falha ao adiar o aviso.", "INTERNAL_SERVER_ERROR", 500),
        )
        .mockResolvedValue(undefined),
    };
    await act(async () => renderer.update(<ToothEventModal {...props} />));
    await act(async () => renderer.root.findByType("Button").props.onPress());
    expect(mockDismiss).not.toHaveBeenCalled();
    expect(
      renderer.root
        .findAllByType("Text")
        .some((node: any) => node.props.children === "Falha ao adiar o aviso."),
    ).toBe(true);
    expect(renderer.root.findByType("Button").props.disabled).toBe(false);
    await act(async () => renderer.root.findByType("Button").props.onPress());
    expect(props.onSnooze).toHaveBeenCalledTimes(2);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("blocks duplicate snoozes and registration while snoozing", async () => {
    let finish!: () => void;
    props = {
      ...props,
      initialHistoryIncomplete: true,
      onSnooze: jest.fn<() => Promise<void>>().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      ),
    };
    await act(async () => renderer.update(<ToothEventModal {...props} />));
    const snooze = renderer.root.findByType("Button");
    await act(async () => {
      snooze.props.onPress();
      snooze.props.onPress();
      confirmButton().props.onPress();
    });
    expect(props.onSnooze).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(renderer.root.findByType("Button").props.disabled).toBe(true);
    expect(confirmButton().props.disabled).toBe(true);
    await act(async () => finish());
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("prevents snoozing and saving with outdated data and offers refresh", async () => {
    const onRetry = jest.fn();
    props = {
      ...props,
      initialHistoryIncomplete: true,
      actionsDisabledReason: "Atualize os dados antes de registrar ou adiar.",
      onRetry,
    };
    await act(async () => renderer.update(<ToothEventModal {...props} />));
    expect(renderer.root.findByType("Button").props.disabled).toBe(true);
    expect(confirmButton().props.disabled).toBe(true);
    await act(async () => {
      renderer.root.findByType("Button").props.onPress();
      confirmButton().props.onPress();
    });
    expect(props.onSnooze).not.toHaveBeenCalled();
    expect(props.onSubmit).not.toHaveBeenCalled();
    renderer.root.findByType("QueryWarningBanner").props.onRetry();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not show snooze when it is not available for the selected record", async () => {
    await act(async () =>
      renderer.update(<ToothEventModal {...props} onSnooze={undefined} />),
    );
    expect(renderer.root.findAllByType("Button")).toHaveLength(0);
  });
});
