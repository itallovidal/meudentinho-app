import { getToothEventDependents } from "@/lib/toothEventDependents";
import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteToothEvent } from "@/api/smile/deleteToothEvent";
import { updateToothEvent } from "@/api/smile/updateToothEvent";
import { resolveAccountId, toothEventsQueryKey } from "@/lib/queryKeys";
import { toothEventErrorMessage } from "@/lib/toothEventError";
import { UserContext } from "@/contexts/UserContext";
import type { ChronologyGender } from "@/lib/toothChronology";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";

export function useToothEventEditor({
  kidId,
  kidBirthDate,
  kidGender,
  authToken,
  events,
}: {
  kidId: string | null;
  kidBirthDate: string | null;
  kidGender: ChronologyGender | null;
  authToken: string | null | undefined;
  events: ToothEvent[];
}) {
  const queryClient = useQueryClient();
  const { userId } = useContext(UserContext)!;
  const accountId = resolveAccountId(userId, authToken);
  const [deleteError, setDeleteError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [editingEvent, setEditingEvent] = useState<ToothEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<ToothEvent | null>(null);

  const scope = `${authToken ? (accountId ?? "") : "anon"}:${kidId ?? ""}`;
  const [previousScope, setPreviousScope] = useState(scope);
  if (scope !== previousScope) {
    setPreviousScope(scope);
    setEditingEvent(null);
    setDeletingEvent(null);
    setDeleteError(null);
  }

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ToothEventRequestDTO;
    }) => updateToothEvent(id, authToken ?? "", payload),
    onSuccess: (_data, { payload }) =>
      queryClient.invalidateQueries({
        queryKey: toothEventsQueryKey(accountId, payload.kidId),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteToothEvent(id, authToken ?? ""),
    onSettled: (_data, _error, id) =>
      queryClient.invalidateQueries({
        queryKey: toothEventsQueryKey(accountId, id.split("|")[0]),
      }),
  });

  const otherEvents = editingEvent
    ? events.filter((event) => event.id !== editingEvent.id)
    : events;
  const editingToothEvents = editingEvent
    ? otherEvents.filter(
        (event) =>
          event.quadrant === editingEvent.quadrant &&
          event.toothType === editingEvent.toothType,
      )
    : [];

  async function handleUpdate(payload: ToothEventRequestDTO) {
    if (!editingEvent) {
      return;
    }
    const target = editingEvent;
    await updateMutation.mutateAsync({ id: target.id, payload });
    setEditingEvent((current) => (current?.id === target.id ? null : current));
  }

  async function handleConfirmDelete() {
    const target = deletingEvent;
    if (!target) {
      return;
    }
    if (deleteMutation.isPending) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(target.id);
      setDeletingEvent((current) =>
        current?.id === target.id ? null : current,
      );
    } catch (error) {
      setDeletingEvent((current) =>
        current && current.id !== target.id ? current : target,
      );
      setDeleteError({
        id: target.id,
        message: toothEventErrorMessage(
          error,
          "Não foi possível excluir o registro. Tente novamente.",
        ),
      });
    }
  }

  return {
    openEditor: (event: ToothEvent) => setEditingEvent(event),
    modalProps: {
      visible:
        !!authToken &&
        editingEvent !== null &&
        editingEvent.kidId === kidId &&
        editingEvent.parentId === accountId,
      toothId: editingEvent
        ? `${editingEvent.arch}_${editingEvent.side}_${editingEvent.toothType}`
        : null,
      kidId,
      kidBirthDate,
      kidGender,
      toothEvents: editingToothEvents,
      events: otherEvents,
      editingEvent,
      onClose: () => setEditingEvent(null),
      onSubmit: handleUpdate,
      onDelete: () => {
        const target = editingEvent;
        setEditingEvent(null);
        setDeleteError(null);
        setDeletingEvent(target);
      },
    },
    confirmProps: {
      open:
        !!authToken &&
        deletingEvent !== null &&
        deletingEvent.kidId === kidId &&
        deletingEvent.parentId === accountId,
      title: "Excluir registro?",
      confirmLabel: "Excluir",
      dependents: getToothEventDependents(deletingEvent, events),
      errorMessage:
        deleteError?.id === deletingEvent?.id ? deleteError?.message : null,
      pending: deleteMutation.isPending,
      onConfirm: () => void handleConfirmDelete(),
      onCancel: () => setDeletingEvent(null),
    },
  };
}
