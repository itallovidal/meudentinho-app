import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/contexts/UserContext";
import { createToothEvent } from "@/api/smile/createToothEvent";
import { resolveAccountId, toothEventsQueryKey } from "@/lib/queryKeys";
import type { ToothMilestone } from "@/lib/toothMilestones";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";
import {
  pendingMilkStep,
  type ChronologyGender,
} from "@/lib/toothChronology";

export function useToothAlertActions(
  kid:
    | { id: string; birthDate: string; gender?: ChronologyGender | null }
    | undefined,
  events: ToothEvent[],
) {
  const { userId, authToken } = useContext(UserContext)!;
  const accountId = resolveAccountId(userId, authToken);
  const queryClient = useQueryClient();
  const scope = `${authToken ? (accountId ?? "") : "anon"}:${kid?.id ?? ""}`;
  type Selection = {
    scope: string;
    target: { milestone: ToothMilestone; unknown: boolean } | null;
  };
  const [selection, setSelection] = useState<Selection>({
    scope,
    target: null,
  });
  if (selection.scope !== scope) setSelection({ scope, target: null });
  const target = selection.scope === scope ? selection.target : null;
  function setTarget(next: Selection["target"]) {
    setSelection({ scope, target: next });
  }
  const mutation = useMutation({
    mutationFn: (payload: ToothEventRequestDTO) =>
      createToothEvent(payload, authToken),
    onSuccess: (_data, payload) =>
      queryClient.invalidateQueries({
        queryKey: toothEventsQueryKey(accountId, payload.kidId),
      }),
  });
  const selected = target?.milestone;
  async function handleSubmit(payload: ToothEventRequestDTO) {
    await mutation.mutateAsync(payload);
    setTarget(null);
  }
  return {
    openRegistration: (milestone: ToothMilestone, unknown: boolean) =>
      setTarget({ milestone, unknown }),
    modalProps: {
      visible:
        !!authToken && !!accountId && !!selected && kid?.id === selected.kidId,
      toothId: selected
        ? `${selected.arch}_${selected.side}_${selected.toothType}`
        : null,
      kidId: kid?.id ?? null,
      kidBirthDate: kid?.birthDate ?? null,
      kidGender: kid?.gender ?? null,
      events,
      toothEvents: selected
        ? events.filter(
            (event) =>
              event.quadrant === selected.quadrant &&
              event.toothType === selected.toothType,
          )
        : [],
      initialDentition: selected?.dentition,
      initialDateUnknown: target?.unknown ?? false,
      initialHistoryIncomplete:
        !!selected &&
        !target?.unknown &&
        selected.dentition === "permanent" &&
        pendingMilkStep(
          selected.arch,
          selected.quadrant,
          selected.toothType,
          events,
        ) !== null,
      onClose: () => setTarget(null),
      onSubmit: handleSubmit,
    },
  };
}
