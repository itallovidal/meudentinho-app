import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewArticle } from "@/api/article/createNewArticle";
import { deleteArticle } from "@/api/article/deleteArticle";
import { updateArticle } from "@/api/article/updateArticle";
import type { ArticleRequestDTO } from "@/types/dtos/article";

type UpdateArticleVariables = {
  id: string;
  data: ArticleRequestDTO;
};

export function useArticleMutations(authToken: string | null | undefined) {
  const queryClient = useQueryClient();

  function invalidateArticleLists() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["articles-preview"] }),
      queryClient.invalidateQueries({ queryKey: ["articles-search"] }),
    ]);
  }

  const createArticleMutation = useMutation({
    mutationFn: (data: ArticleRequestDTO) =>
      createNewArticle(data, authToken ?? ""),
    onSuccess: () => {
      void invalidateArticleLists();
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: UpdateArticleVariables) =>
      updateArticle(id, data, authToken ?? ""),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["article", response.data.id],
      });
      void invalidateArticleLists();
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => deleteArticle(id, authToken ?? ""),
    onSuccess: (_response, id) => {
      queryClient.removeQueries({ queryKey: ["article", id] });
      void invalidateArticleLists();
    },
  });

  return {
    createArticleMutation,
    updateArticleMutation,
    deleteArticleMutation,
  };
}
