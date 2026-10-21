import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/api/article/createCategory";
import { deleteCategory } from "@/api/article/deleteCategory";
import { updateCategory } from "@/api/article/updateCategory";

type UpdateCategoryVariables = {
  id: string;
  name: string;
};

export function useCategoryMutations(authToken: string | null | undefined) {
  const queryClient = useQueryClient();

  function invalidateCategoryUsage() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["article-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["articles-preview"] }),
      queryClient.invalidateQueries({ queryKey: ["articles-search"] }),
      queryClient.invalidateQueries({ queryKey: ["article"] }),
    ]);
  }

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createCategory(name, authToken ?? ""),
    onSuccess: () => {
      void invalidateCategoryUsage();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: UpdateCategoryVariables) =>
      updateCategory(id, name, authToken ?? ""),
    onSuccess: () => {
      void invalidateCategoryUsage();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id, authToken ?? ""),
    onSuccess: () => {
      void invalidateCategoryUsage();
    },
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}
