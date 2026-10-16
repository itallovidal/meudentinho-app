import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createKid } from "@/api/kids/createKid";
import { patchKid } from "@/api/kids/patchKid";
import { revokeKidConsent } from "@/api/kids/revokeKidConsent";
import { updateKid } from "@/api/kids/updateKid";
import { notifyKidsChanged } from "@/lib/kidsSubject";
import { KidRequestDTO } from "@/types/dtos/user";

type SaveKidVariables = {
  kidId: string;
  data: KidRequestDTO;
  usePut: boolean;
};

export function useKidMutations(authToken: string | null | undefined) {
  const queryClient = useQueryClient();

  function invalidateKids() {
    return queryClient.invalidateQueries({ queryKey: ["kids"] });
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
    mutationFn: ({ kidId, data, usePut }: SaveKidVariables) =>
      usePut
        ? updateKid(kidId, authToken ?? null, data)
        : patchKid(kidId, authToken ?? null, data),
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
    onSuccess: (_response, kidId) => {
      void invalidateKids();
      notifyKidsChanged({ type: "deleted", kidId });
    },
  });

  return { createKidMutation, saveKidMutation, revokeKidMutation };
}
