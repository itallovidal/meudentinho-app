import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useKidMutations } from "@/hooks/useKidMutations";
import { useKids } from "@/hooks/useKids";
import { UserContext } from "@/contexts/UserContext";
import type { UserContextProps } from "@/contexts/UserContext";
import type { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import { createKid } from "@/api/kids/createKid";
import { updateKid } from "@/api/kids/updateKid";
import { revokeKidConsent } from "@/api/kids/revokeKidConsent";
import {
  kidsQueryKey,
  toothEventsQueryKey,
  toothEventsInfiniteQueryKey,
} from "@/lib/queryKeys";
import { kidsSubject, notifyKidsChanged } from "@/lib/kidsSubject";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("@/contexts/UserContext", () => ({
  UserContext: jest.requireActual("react").createContext(null),
}));
jest.mock("@/api/kids/createKid", () => ({ createKid: jest.fn() }));
jest.mock("@/api/kids/updateKid", () => ({ updateKid: jest.fn() }));
jest.mock("@/api/kids/revokeKidConsent", () => ({
  revokeKidConsent: jest.fn(),
}));
jest.mock("@/api/kids/getAllKids", () => ({
  getAllKids: jest.fn(() => new Promise(() => {})),
}));
const { act, create } = jest.requireActual("react-test-renderer");
const mockCreate = jest.mocked(createKid);
const mockUpdate = jest.mocked(updateKid);
const mockRevoke = jest.mocked(revokeKidConsent);
const context = { userId: "account-1", authToken: "token" } as UserContextProps;
const request: KidRequestDTO = {
  name: "Alice",
  birthDate: "2020-01-01",
  gender: "female",
  prematureWeeks: "0",
  acceptedPolicyVersion: "1.0",
  acceptedAt: "2026-10-22T12:00:00Z",
  requestId: "request",
};
function kid(id: string, name: string): KidResponseDTO {
  return {
    ...request,
    id,
    name,
    parentId: "account-1",
    createdAt: "",
    updatedAt: "",
  };
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

it("removes only the revoked kid caches and cancels late responses", async () => {
  const cache = client();
  const normal = toothEventsQueryKey("account-1", "A");
  const infinite = toothEventsInfiniteQueryKey("account-1", "A", 10);
  const otherKid = toothEventsQueryKey("account-1", "B");
  const otherAccount = toothEventsQueryKey("account-2", "A");
  for (const key of [normal, infinite, otherKid, otherAccount])
    cache.setQueryData(key, ["kept"]);
  let resolveRequest!: (data: string[]) => void;
  const pending = cache
    .fetchQuery({
      queryKey: normal,
      queryFn: () =>
        new Promise<string[]>((resolve) => {
          resolveRequest = resolve;
        }),
    })
    .catch(() => undefined);
  mockRevoke.mockResolvedValue({ status: 200 } as Awaited<
    ReturnType<typeof revokeKidConsent>
  >);
  let mutations!: ReturnType<typeof useKidMutations>;
  function Harness() {
    mutations = useKidMutations("token");
    return null;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <UserContext.Provider value={context}>
        <QueryClientProvider client={cache}>
          <Harness />
        </QueryClientProvider>
      </UserContext.Provider>,
    );
  });
  await act(async () => {
    await mutations.revokeKidMutation.mutateAsync("A");
  });
  resolveRequest(["late event"]);
  await pending;
  expect(cache.getQueryData(normal)).toBeUndefined();
  expect(cache.getQueryData(infinite)).toBeUndefined();
  expect(cache.getQueryData(otherKid)).toEqual(["kept"]);
  expect(cache.getQueryData(otherAccount)).toEqual(["kept"]);
  await act(async () => {
    renderer.unmount();
  });
  cache.clear();
});

it("keeps cached events if revocation fails", async () => {
  const cache = client();
  const key = toothEventsQueryKey("account-1", "A");
  cache.setQueryData(key, ["event"]);
  mockRevoke.mockRejectedValueOnce(new Error("Offline"));
  let mutations!: ReturnType<typeof useKidMutations>;
  function Harness() {
    mutations = useKidMutations("token");
    return null;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <UserContext.Provider value={context}>
        <QueryClientProvider client={cache}>
          <Harness />
        </QueryClientProvider>
      </UserContext.Provider>,
    );
  });
  await act(async () => {
    await expect(mutations.revokeKidMutation.mutateAsync("A")).rejects.toThrow(
      "Offline",
    );
  });
  expect(cache.getQueryData(key)).toEqual(["event"]);
  await act(async () => {
    renderer.unmount();
  });
  cache.clear();
});

it("shares creation notifications and saves complete forms with PUT", async () => {
  const cache = client();
  const a = kid("A", "Alice");
  mockCreate.mockResolvedValue({ status: 201, data: a } as Awaited<
    ReturnType<typeof createKid>
  >);
  mockUpdate.mockResolvedValue({ status: 200, data: a } as Awaited<
    ReturnType<typeof updateKid>
  >);
  const listener = jest.fn();
  const unsubscribe = kidsSubject.subscribe(listener);
  cache.setQueryData(kidsQueryKey("account-1"), []);
  cache.setQueryData(kidsQueryKey("account-2"), []);
  let mutations!: ReturnType<typeof useKidMutations>;
  function Harness() {
    mutations = useKidMutations("token");
    return null;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <UserContext.Provider value={context}>
        <QueryClientProvider client={cache}>
          <Harness />
        </QueryClientProvider>
      </UserContext.Provider>,
    );
  });
  await act(async () => {
    await mutations.createKidMutation.mutateAsync(request);
  });
  expect(mockCreate).toHaveBeenCalledWith(request, "token");
  expect(listener).toHaveBeenCalledWith({
    type: "created",
    kidId: "A",
    kid: a,
  });
  await act(async () => {
    await mutations.saveKidMutation.mutateAsync({ kidId: "A", data: request });
  });
  expect(mockUpdate).toHaveBeenCalledWith("A", "token", request);
  expect(cache.getQueryState(kidsQueryKey("account-1"))?.isInvalidated).toBe(
    true,
  );
  expect(cache.getQueryState(kidsQueryKey("account-2"))?.isInvalidated).toBe(
    false,
  );
  unsubscribe();
  await act(async () => {
    renderer.unmount();
  });
  cache.clear();
});

it("keeps alphabetical order after local creation and renaming before refetch completes", async () => {
  const cache = client();
  cache.setQueryData(kidsQueryKey("account-1"), [
    kid("B", "Bruno"),
    kid("C", "Carlos"),
  ]);
  let result!: ReturnType<typeof useKids>;
  function Harness() {
    result = useKids("token");
    return null;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => {
    renderer = create(
      <UserContext.Provider value={context}>
        <QueryClientProvider client={cache}>
          <Harness />
        </QueryClientProvider>
      </UserContext.Provider>,
    );
  });
  await act(async () => {
    notifyKidsChanged({ type: "created", kidId: "A", kid: kid("A", "Ana") });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(result.kids.map((item) => item.name)).toEqual([
    "Ana",
    "Bruno",
    "Carlos",
  ]);
  await act(async () => {
    notifyKidsChanged({ type: "updated", kidId: "C", kid: kid("C", "Ágata") });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(result.kids.map((item) => item.name)).toEqual([
    "Ágata",
    "Ana",
    "Bruno",
  ]);
  await act(async () => {
    renderer.unmount();
  });
  cache.clear();
});
