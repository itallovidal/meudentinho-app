import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createKid } from "@/api/kids/createKid";
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import {
  kidsQueryKey,
  resolveAccountId,
  toothEventsQueryKey,
} from "@/lib/queryKeys";
import { revokeKidConsent } from "@/api/kids/revokeKidConsent";
import { updateKid } from "@/api/kids/updateKid";
import { notifyKidsChanged } from "@/lib/kidsSubject";
import type { KidRequestDTO } from "@/types/dtos/user";

type SaveKidVariables = {
  kidId: string;
  data: KidRequestDTO;
};

export function useKidMutations(authToken: string | null | undefined) {
  const queryClient = useQueryClient();
  const { userId } = useContext(UserContext)!;
  const accountId = resolveAccountId(userId, authToken);

  function invalidateKids() {
    return queryClient.invalidateQueries({ queryKey: kidsQueryKey(accountId) });
  }

  const createKidMutation = useMutation({
    mutationFn: (data: KidRequestDTO) => createKid(data, authToken ?? null),
    onSuccess: (response) => {
      void invalidateKids();
      notifyKidsChanged({
        type: "created",
        kidId: response.data?.id,
        kid: response.data ?? null,
      });
    },
  });

  const saveKidMutation = useMutation({
    mutationFn: ({ kidId, data }: SaveKidVariables) =>
      updateKid(kidId, authToken ?? null, data),
    onSuccess: (response, variables) => {
      void invalidateKids();
      notifyKidsChanged({
        type: "updated",
        kidId: variables.kidId,
        kid: response.data ?? null,
      });
    },
  });

  const revokeKidMutation = useMutation({
    mutationFn: (kidId: string) => revokeKidConsent(kidId, authToken ?? null),
    onSuccess: async (_response, kidId) => {
      notifyKidsChanged({ type: "deleted", kidId });
      const queryKey = toothEventsQueryKey(accountId, kidId);
      await queryClient.cancelQueries({ queryKey });
      queryClient.removeQueries({ queryKey });
      void invalidateKids();
    },
  });

  return { createKidMutation, saveKidMutation, revokeKidMutation };
}
