import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserContext, type UserContextProps } from "@/contexts/UserContext";
import { useToothEventEditor } from "@/hooks/useToothEventEditor";
import { updateToothEvent } from "@/api/smile/updateToothEvent";
import { deleteToothEvent } from "@/api/smile/deleteToothEvent";
import { toothEventsQueryKey } from "@/lib/queryKeys";
import { ApiError } from "@/types/domain";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("@/contexts/UserContext", () => ({
  UserContext: jest.requireActual("react").createContext(null),
}));
jest.mock("@/api/smile/updateToothEvent", () => ({
  updateToothEvent: jest.fn(),
}));
jest.mock("@/api/smile/deleteToothEvent", () => ({
  deleteToothEvent: jest.fn(),
}));
const { act, create } = jest.requireActual("react-test-renderer");
const event: ToothEvent = {
  id: "kid|central_incisor|upper_right|permanent|eruption",
  kidId: "kid",
  parentId: "account",
  toothType: "central_incisor",
  arch: "upper",
  side: "right",
  quadrant: "upper_right",
  dentition: "permanent",
  eventType: "eruption",
  occurrenceDate: "",
  recordKind: "presence",
  confirmedAt: "2026-06-07T12:00:00Z",
  createdAt: "2026-06-07T12:00:00Z",
  updatedAt: "2026-06-07T12:00:00Z",
};
const payload: ToothEventRequestDTO = {
  ...event,
  occurrenceDate: "2026-06-01T12:00:00Z",
  recordKind: "dated",
};
let editor: ReturnType<typeof useToothEventEditor>;
function Harness({ kidId }: { kidId: string }) {
  const value = useToothEventEditor({
    kidId,
    kidBirthDate: "2015-01-01",
    kidGender: null,
    authToken: "token",
    events: [event],
  });
  useEffect(() => {
    editor = value;
  }, [value]);
  return null;
}
function screen(cache: QueryClient, kidId = "kid", account = "account") {
  return (
    <UserContext.Provider
      value={{ userId: account, authToken: "token" } as UserContextProps}
    >
      <QueryClientProvider client={cache}>
        <Harness kidId={kidId} />
      </QueryClientProvider>
    </UserContext.Provider>
  );
}
function client() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

it("invalidates the saved child's cache even if the user changes children while saving", async () => {
  const cache = client();
  const originalKey = toothEventsQueryKey("account", "kid");
  const otherKey = toothEventsQueryKey("account", "other");
  cache.setQueryData(originalKey, [event]);
  cache.setQueryData(otherKey, []);
  let finish!: () => void;
  jest.mocked(updateToothEvent).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = () => resolve({ status: 200, data: { ...event, ...payload } });
      }),
  );
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(screen(cache));
  });
  await act(async () => {
    editor.openEditor(event);
  });
  let pending!: Promise<void>;
  await act(async () => {
    pending = editor.modalProps.onSubmit(payload);
  });
  await act(async () => {
    renderer.update(screen(cache, "other"));
  });
  expect(editor.modalProps.visible).toBe(false);
  await act(async () => {
    finish();
    await pending;
  });
  expect(cache.getQueryState(originalKey)?.isInvalidated).toBe(true);
  expect(cache.getQueryState(otherKey)?.isInvalidated).toBe(false);
  await act(async () => {
    renderer.unmount();
    cache.clear();
  });
});

it("keeps a failed conversion open so the form can show the API error", async () => {
  const cache = client();
  jest
    .mocked(updateToothEvent)
    .mockRejectedValue(
      new ApiError("Data do evento inválida.", "INVALID_PAYLOAD", 400),
    );
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(screen(cache));
  });
  await act(async () => {
    editor.openEditor(event);
  });
  await act(async () => {
    await expect(editor.modalProps.onSubmit(payload)).rejects.toMatchObject({
      message: "Data do evento inválida.",
    });
  });
  expect(editor.modalProps.visible).toBe(true);
  await act(async () => {
    renderer.update(screen(cache, "kid", "other-account"));
  });
  expect(editor.modalProps.visible).toBe(false);
  await act(async () => {
    renderer.unmount();
    cache.clear();
  });
});

it("keeps deletion errors visible in the confirmation sheet", async () => {
  const cache = client();
  jest
    .mocked(deleteToothEvent)
    .mockRejectedValue(
      new ApiError(
        "Não foi possível excluir este registro.",
        "INTERNAL_SERVER_ERROR",
        500,
      ),
    );
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(screen(cache));
  });
  await act(async () => {
    editor.openEditor(event);
  });
  await act(async () => {
    editor.modalProps.onDelete();
  });
  await act(async () => {
    editor.confirmProps.onConfirm();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(editor.confirmProps.open).toBe(true);
  expect(editor.confirmProps.errorMessage).toBe(
    "Não foi possível excluir este registro.",
  );
  await act(async () => {
    renderer.unmount();
    cache.clear();
  });
});
