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

  function invalidateKids() {
    return queryClient.invalidateQueries({ queryKey: ["kids"] });
  }

  const createKidMutation = useMutation({
    // Lê o token no momento da chamada (sem congelar): null cai no
    // authFetch via sessão fresca (getSession + refresh automático).
    mutationFn: (data: KidRequestDTO) => createKid(data, authToken ?? null),
    onSuccess: invalidateKids,
  });

  const saveKidMutation = useMutation({
    mutationFn: ({ kidId, data, usePut }: SaveKidVariables) =>
      usePut
        ? updateKid(kidId, authToken ?? null, data)
        : patchKid(kidId, authToken ?? null, data),
    onSuccess: invalidateKids,
  });

  const deleteKidMutation = useMutation({
    mutationFn: (kidId: string) => deleteKid(kidId, authToken ?? null),
    onSuccess: invalidateKids,
  });

  return { createKidMutation, saveKidMutation, deleteKidMutation };
}
