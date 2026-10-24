import { ArticleForm } from "@/components/forms/articleForm";
import { FormLoadState } from "@/components/forms/formLoadState";
import { FeedbackSheet } from "@/components/feedbackSheet";
import { getArticleById } from "@/api/article/getArticleById";
import { useQuery } from "@tanstack/react-query";
import { retryQuery } from "@/lib/queryRetry";
import { Header } from "@/components/header";
import { ErrorState } from "@/components/errorState";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useArticleMutations } from "@/hooks/useArticleMutations";
import { errorMessage } from "@/lib/errorMessage";
import { THEME } from "@/lib/theme";
import type {
  ArticlesNavigationProp,
  ArticlesStackParamList,
} from "@/navigation/ArticlesStack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { TrashIcon } from "phosphor-react-native";
import { useContext, useState } from "react";
import { View } from "react-native";
import { ApiError } from "@/types/domain";
import type { ArticleRequestDTO } from "@/types/dtos/article";
import { isApiError } from "@/types/predicates";

type ArticleEditorRouteProp = RouteProp<
  ArticlesStackParamList,
  "ArticleEditor" | "NewArticle"
>;

export function ArticleEditor() {
  const { authToken, hydrated, user } = useContext(UserContext)!;
  const navigation = useNavigation<ArticlesNavigationProp>();
  const route = useRoute<ArticleEditorRouteProp>();
  const articleId = route.params?.articleId;
  const isEditing = route.name === "ArticleEditor";
  const {
    data: article,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () => getArticleById(articleId!).then((response) => response.data),
    enabled: !!articleId && hydrated && !!authToken && !!user?.isAdmin,
    retry: retryQuery,
  });
  const [operationError, setOperationError] = useState<string | null>(null);
  const { showToast } = useToast();
  const colors = THEME.light;
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const {
    createArticleMutation,
    updateArticleMutation,
    deleteArticleMutation,
  } = useArticleMutations(authToken);

  async function handleSubmit(data: ArticleRequestDTO) {
    setSubmitError(null);

    if (!authToken) {
      setSubmitError(
        new ApiError(
          "Sessão expirada. Faça login novamente.",
          "INVALID_CREDENTIALS",
          401,
        ),
      );
      return;
    }

    try {
      if (article) {
        await updateArticleMutation.mutateAsync({ id: article.id, data });
        showToast("Artigo atualizado com sucesso.");
      } else {
        await createArticleMutation.mutateAsync(data);
        showToast("Artigo criado com sucesso.");
      }
      exitEditor();
    } catch (error) {
      if (isApiError(error)) {
        setSubmitError(error);
        return;
      }
      setSubmitError(
        new ApiError(
          "Não foi possível salvar o artigo. Verifique sua conexão e tente novamente.",
          "INTERNAL_SERVER_ERROR",
        ),
      );
    }
  }

  function exitEditor() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("ArticlesList");
  }

  async function handleDelete() {
    if (!article) {
      return;
    }

    try {
      await deleteArticleMutation.mutateAsync(article.id);
      setConfirmingDelete(false);
      showToast("Artigo excluído com sucesso.");
      if (navigation.canGoBack()) {
        navigation.popToTop();
      } else {
        navigation.navigate("ArticlesList");
      }
    } catch (error) {
      setConfirmingDelete(false);
      setOperationError(
        errorMessage(error, "Não foi possível excluir o artigo."),
      );
    }
  }

  if (!hydrated) {
    return (
      <Wrapper
        direction="column"
        align="center"
        justify="start"
        gap="gap-0"
        className="flex-1 bg-base-200"
      >
        <Header hasBackButton />
        <Text>Carregando...</Text>
      </Wrapper>
    );
  }

  if (!authToken || !user?.isAdmin) {
    return (
      <Wrapper
        direction="column"
        align="start"
        justify="start"
        gap="gap-0"
        className="flex-1 bg-base-200"
      >
        <Header hasBackButton />
        <Wrapper
          className="flex-1 px-6"
          direction="column"
          align="center"
          justify="center"
          gap="gap-4"
        >
          <ErrorState
            title="Acesso restrito"
            message="Apenas administradores podem gerenciar artigos."
            retryLabel="Voltar"
            onRetry={() => navigation.goBack()}
          />
        </Wrapper>
      </Wrapper>
    );
  }

  if (isEditing && (isPending || isError || !article)) {
    return (
      <View className="flex-1 bg-base-100">
        <Header hasBackButton />
        <FormLoadState
          message={
            isPending
              ? undefined
              : "Não foi possível carregar este artigo. Verifique o endereço e tente novamente."
          }
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      gap="gap-0"
      className="flex-1 bg-base-200"
    >
      <Header hasBackButton />

      <ArticleForm
        key={article?.id ?? "new"}
        onSubmit={handleSubmit}
        submitError={submitError}
        defaultValues={
          article
            ? {
                title: article.title,
                summary: article.summary,
                content: article.content,
                categories: article.categories,
                imageCoverURL: article.imageCoverURL,
              }
            : undefined
        }
        submitLabel={isEditing ? "Salvar alterações" : "Criar Artigo"}
        submittingLabel={isEditing ? "Salvando artigo..." : "Criando artigo..."}
        footer={
          article ? (
            <Button
              variant="ghost"
              onPress={() => setConfirmingDelete(true)}
              disabled={deleteArticleMutation.isPending}
              className="mb-4 self-center"
            >
              <TrashIcon size={20} color={colors.destructive} />
              <Text className="font-medium text-destructive">
                Excluir artigo
              </Text>
            </Button>
          ) : undefined
        }
      />

      <BottomSheet
        visible={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        header={
          <Text className="text-xl font-bold text-base-900">
            Excluir artigo
          </Text>
        }
      >
        <Text className="text-base text-base-500">
          O artigo será removido permanentemente. Esta ação não pode ser
          desfeita.
        </Text>
        <Button
          variant="destructive"
          onPress={() => void handleDelete()}
          disabled={deleteArticleMutation.isPending}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">
            {deleteArticleMutation.isPending ? "Excluindo..." : "Excluir"}
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => setConfirmingDelete(false)}
          disabled={deleteArticleMutation.isPending}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">Cancelar</Text>
        </Button>
      </BottomSheet>
      <FeedbackSheet
        title="Não foi possível excluir o artigo"
        message={operationError}
        onClose={() => setOperationError(null)}
      />
    </Wrapper>
  );
}
