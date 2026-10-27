import { BirthDateInput } from "@/components/forms/birthDateInput";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { EditDependent } from "@/pages/profile/editDependent";
import { UserContext } from "@/contexts/UserContext";
import type { UserContextProps } from "@/contexts/UserContext";
import type { KidResponseDTO } from "@/types/dtos/user";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({
  View: "View",
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  Alert: { alert: jest.fn() },
}));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Pressable", () => "Pressable", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/ScrollView", () => "ScrollView", {
  virtual: true,
});
jest.mock("react-native-web/dist/exports/Alert", () => ({ alert: jest.fn() }), {
  virtual: true,
});
jest.mock("@/components/ui/input", () => ({ Input: "Input" }));
jest.mock("@/components/ui/text", () => ({ Text: "Text" }));
jest.mock("@/components/ui/button", () => ({ Button: "Button" }));
jest.mock("@/components/wrapper", () => ({ Wrapper: "Wrapper" }));
jest.mock("@/components/header", () => ({ Header: "Header" }));
jest.mock("@/components/ui/bottomSheet", () => ({
  BottomSheet: "BottomSheet",
}));
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("@/components/formInput", () => ({ FormInput: "FormInput" }));
jest.mock("@/components/infoPopover", () => ({ InfoPopover: "InfoPopover" }));
jest.mock("@/components/forms/animatedCheckbox", () => ({
  AnimatedCheckbox: "AnimatedCheckbox",
}));
jest.mock("@/components/forms/genderSelector", () => ({
  GenderSelector: "GenderSelector",
}));
jest.mock("@/components/forms/prematureWeeksSelector", () => ({
  PrematureWeeksSelector: "PrematureWeeksSelector",
}));
jest.mock("@/lib/privacyPolicy", () => ({
  getPrivacyPolicyUrl: () => "https://example.com/politica-de-privacidade",
  openPrivacyPolicy: jest.fn(),
  buildKidRequest: async (data: unknown) => data,
}));
jest.mock("@/lib/theme", () => jest.requireActual("@/lib/themeColors"));
jest.mock("phosphor-react-native", () => ({
  CalendarBlankIcon: "CalendarBlankIcon",
  TrashIcon: "TrashIcon",
}));
jest.mock("@/contexts/UserContext", () => ({
  UserContext: jest.requireActual("react").createContext(null),
}));
jest.mock("@react-navigation/native", () => ({
  useRoute: () => ({ name: mockRouteName, params: mockParams }),
  useNavigation: () => ({
    goBack: jest.fn(),
    canGoBack: () => false,
    navigate: jest.fn(),
  }),
}));
jest.mock("@/hooks/useKids", () => ({
  useKids: () => ({
    kids: mockKids,
    isLoading: false,
    failure: null,
    refetch: jest.fn(),
  }),
}));
jest.mock("@/hooks/useKidMutations", () => ({
  useKidMutations: () => ({
    saveKidMutation: { mutateAsync: mockSave },
    createKidMutation: { mutateAsync: jest.fn() },
    revokeKidMutation: { isPending: false },
  }),
}));
jest.mock("react-native-reanimated", () => ({
  __esModule: true,
  default: { View: "AnimatedView" },
  useSharedValue: (value: number) => ({ value }),
  useAnimatedStyle: () => ({}),
  withTiming: (value: number) => value,
}));
const { act, create } = jest.requireActual("react-test-renderer");
const valid = {
  name: "Alice",
  birthDate: "2020-01-01",
  gender: "female" as const,
  accepted: true,
};
let mockParams: { kidId?: string } = {};
let mockRouteName = "NewDependent";
let mockKids: KidResponseDTO[] = [];
const mockSave = jest.fn(async () => ({}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-10-22T09:00:00-03:00"));
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mockSave.mockClear();
  mockParams = {};
  mockRouteName = "NewDependent";
  mockKids = [];
});
afterEach(() => {
  jest.useRealTimers();
});

it.each([
  ["22/10/2026", "2026-10-22", null],
  ["01/01/202", "", "Digite a data completa."],
  ["31/02/2026", "", "Digite uma data válida."],
  ["23/10/2026", "", "A data não pode ser futura."],
  ["", "", null],
])("validates masked input %s at 09:00", async (text, expected, message) => {
  const onChange = jest.fn();
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <BirthDateInput value="2020-01-01" onChange={onChange} />,
    );
  });
  await act(async () => {
    renderer.root.findByType("Input").props.onChangeText(text);
  });
  expect(onChange).toHaveBeenLastCalledWith(expected);
  if (message)
    expect(
      renderer.root
        .findAllByType("Text")
        .some((node: any) => node.props.children === message),
    ).toBe(true);
  await act(async () => {
    renderer.unmount();
  });
});

it("keeps partial typing while clearing the stale form date and blocks saving", async () => {
  const onSubmit = jest.fn();
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <RegisterKidForm defaultValues={valid} onSubmit={onSubmit} />,
    );
  });
  await act(async () => {
    renderer.root.findByType("Input").props.onChangeText("01/01/202");
  });
  expect(renderer.root.findByType("Input").props.value).toBe("01/01/202");
  await act(async () => {
    await renderer.root.findByType("Button").props.onPress();
  });
  expect(onSubmit).not.toHaveBeenCalled();
  await act(async () => {
    renderer.root.findByType("Input").props.onChangeText("22/10/2026");
  });
  await act(async () => {
    await renderer.root.findByType("Button").props.onPress();
  });
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ birthDate: "2026-10-22" }),
    undefined,
  );
  await act(async () => {
    renderer.unmount();
  });
});

it("defaults to male and allows changing the selection", async () => {
  const onSubmit = jest.fn();
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <RegisterKidForm
        defaultValues={{
          name: valid.name,
          birthDate: valid.birthDate,
          accepted: true,
        }}
        onSubmit={onSubmit}
      />,
    );
  });
  expect(
    renderer.root.findByType("GenderSelector").props.gender,
  ).toBe("male");
  await act(async () => {
    await renderer.root.findByType("Button").props.onPress();
  });
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ gender: "male" }),
    undefined,
  );
  await act(async () => {
    renderer.root.findByType("GenderSelector").props.onChange("female");
  });
  await act(async () => {
    await renderer.root.findByType("Button").props.onPress();
  });
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ gender: "female" }),
    undefined,
  );
  await act(async () => {
    renderer.unmount();
  });
});

it("requires gestational weeks when premature and clears them when unchecked", async () => {
  const onSubmit = jest.fn();
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <RegisterKidForm defaultValues={valid} onSubmit={onSubmit} />,
    );
  });
  function checkbox() {
    return renderer.root
      .findAllByType("AnimatedCheckbox")
      .find((node: any) =>
        node.props.accessibilityLabel.startsWith("A criança"),
      );
  }
  await act(async () => {
    checkbox().props.onChange();
  });
  await act(async () => {
    await renderer.root.findByType("Button").props.onPress();
  });
  expect(onSubmit).not.toHaveBeenCalled();
  await act(async () => {
    renderer.root.findByType("PrematureWeeksSelector").props.onChange("30");
  });
  await act(async () => {
    await renderer.root.findByType("Button").props.onPress();
  });
  expect(onSubmit).toHaveBeenLastCalledWith(
    expect.objectContaining({ isPremature: true, prematureWeeks: "30" }),
    undefined,
  );
  await act(async () => {
    checkbox().props.onChange();
  });
  await act(async () => {
    await renderer.root.findByType("Button").props.onPress();
  });
  expect(onSubmit).toHaveBeenLastCalledWith(
    expect.objectContaining({ isPremature: false, prematureWeeks: "0" }),
    undefined,
  );
  await act(async () => {
    renderer.unmount();
  });
});

it("reinitializes the actual edit form from A to B and then to creation", async () => {
  const context = { authToken: "token", hydrated: true } as UserContextProps;
  const a = {
    ...valid,
    id: "A",
    parentId: "parent",
    createdAt: "",
    updatedAt: "",
    prematureWeeks: "30",
  } as KidResponseDTO;
  const b = {
    ...a,
    id: "B",
    name: "Bruno",
    gender: "male",
    birthDate: "2021-02-02",
    prematureWeeks: "0",
  } as KidResponseDTO;
  function screen() {
    return (
      <UserContext.Provider value={context}>
        <EditDependent />
      </UserContext.Provider>
    );
  }
  let renderer: ReturnType<typeof create>;
  mockKids = [a, b];
  mockRouteName = "EditDependent";
  mockParams = { kidId: a.id };
  await act(async () => {
    renderer = create(screen());
  });
  mockParams = { kidId: b.id };
  await act(async () => {
    renderer.update(screen());
  });
  expect(
    renderer.root.findByType("FormInput").props.control._formValues,
  ).toEqual(
    expect.objectContaining({
      name: "Bruno",
      birthDate: "2021-02-02",
      gender: "male",
      isPremature: false,
    }),
  );
  expect(renderer.root.findByType("Input").props.value).toBe("02/02/2021");
  expect(
    renderer.root
      .findAllByType("AnimatedCheckbox")
      .some((node: any) =>
        node.props.accessibilityLabel.startsWith("Li e aceito"),
      ),
  ).toBe(false);
  await act(async () => {
    renderer.root.findByType("GenderSelector").props.onChange("female");
  });
  await act(async () => {
    await renderer.root
      .findAllByType("Button")
      .find((node: any) =>
        node
          .findAllByType("Text")
          .some((text: any) => text.props.children === "Salvar alterações"),
      )
      .props.onPress();
  });
  expect(mockSave).toHaveBeenCalledWith(
    expect.objectContaining({
      kidId: "B",
      data: expect.objectContaining({ name: "Bruno" }),
    }),
  );
  mockParams = {};
  mockRouteName = "NewDependent";
  await act(async () => {
    renderer.update(screen());
  });
  expect(
    renderer.root.findByType("FormInput").props.control._formValues.name,
  ).toBeUndefined();
  expect(
    renderer.root.findByType("GenderSelector").props.gender,
  ).toBe("male");
  expect(
    renderer.root
      .findAllByType("AnimatedCheckbox")
      .some((node: any) =>
        node.props.accessibilityLabel.startsWith("Li e aceito"),
      ),
  ).toBe(true);
  await act(async () => {
    renderer.unmount();
  });
});

it("clears displayed text on an external value reset", async () => {
  let renderer: ReturnType<typeof create>;
  const onChange = jest.fn();
  await act(async () => {
    renderer = create(
      <BirthDateInput value="2020-01-01" onChange={onChange} />,
    );
  });
  await act(async () => {
    renderer.update(<BirthDateInput value="" onChange={onChange} />);
  });
  expect(renderer.root.findByType("Input").props.value).toBe("");
  await act(async () => {
    renderer.unmount();
  });
});
