import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createKid } from "@/api/kids/createKid";
import { deleteKid } from "@/api/kids/deleteKid";
import { patchKid } from "@/api/kids/patchKid";
import { updateKid } from "@/api/kids/updateKid";
import { KidRequestDTO } from "@/types/dtos/user";

type SaveKidVariables = {
  kidId: string;
  data: KidRequestDTO;
  usePut: boolean;
};

export function useKidMutations(authToken: string | null | undefined) {
  const queryClient = useQueryClient();
  const token = authToken ?? "";

  function invalidateKids() {
    return queryClient.invalidateQueries({ queryKey: ["kids"] });
  }

  const createKidMutation = useMutation({
    mutationFn: (data: KidRequestDTO) => createKid(data, token),
    onSuccess: invalidateKids,
  });

  const saveKidMutation = useMutation({
    mutationFn: ({ kidId, data, usePut }: SaveKidVariables) =>
      usePut ? updateKid(kidId, token, data) : patchKid(kidId, token, data),
    onSuccess: invalidateKids,
  });

  const deleteKidMutation = useMutation({
    mutationFn: (kidId: string) => deleteKid(kidId, token),
    onSuccess: invalidateKids,
  });

  return { createKidMutation, saveKidMutation, deleteKidMutation };
}
