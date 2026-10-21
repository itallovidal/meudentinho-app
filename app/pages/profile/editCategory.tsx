import { CategoryForm } from "@/components/forms/categoryForm";
import { ErrorState } from "@/components/errorState";
import { Header } from "@/components/header";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useCategoryMutations } from "@/hooks/useCategoryMutations";
import { THEME } from "@/lib/theme";
import type { CategoryFormValues } from "@/lib/schemas/category";
import type { ProfileRouteParams } from "@/navigation/ProfileStack";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { ApiError } from "@/types/domain";
import { isApiError } from "@/types/predicates";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { TrashIcon } from "phosphor-react-native";
import { useContext, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

export function EditCategory() {
  const { authToken, hydrated, user } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();
  const { params } = useRoute<RouteProp<ProfileRouteParams, "EditCategory">>();
  const category = params?.category;
  const isEditing = category !== undefined;
  const { showToast } = useToast();
  const {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  } = useCategoryMutations(authToken);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<ApiError | null>(null);
  const isDeleting = deleteCategoryMutation.isPending;
  const colors = THEME.light;

  useEffect(() => {
    if (hydrated && !authToken) {
      navigation.replace("Login");
    }
  }, [hydrated, authToken, navigation]);

  function exitScreen() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Categories");
  }

  function handleGoBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Index");
  }

  function openDeleteConfirmation() {
    setDeleteError(null);
    setConfirmingDelete(true);
  }

  function closeDeleteConfirmation() {
    setConfirmingDelete(false);
  }

  async function handleSubmit(data: CategoryFormValues) {
    setSubmitError(null);

    try {
      if (category) {
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          name: data.name,
        });
        showToast("Categoria atualizada com sucesso.");
      } else {
        await createCategoryMutation.mutateAsync(data.name);
        showToast("Categoria criada com sucesso.");
      }
      exitScreen();
    } catch (error) {
      if (isApiError(error)) {
        setSubmitError(error);
        return;
      }
      setSubmitError(
        new ApiError(
          "Não foi possível salvar a categoria. Verifique sua conexão e tente novamente.",
          "INTERNAL_SERVER_ERROR",
        ),
      );
    }
  }

  async function handleDeleteCategory() {
    if (!category) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      showToast("Categoria excluída com sucesso.");
      closeDeleteConfirmation();
      exitScreen();
    } catch (error) {
      if (isApiError(error)) {
        setDeleteError(error);
        return;
      }
      setDeleteError(
        new ApiError(
          "Não foi possível excluir a categoria. Verifique sua conexão e tente novamente.",
          "INTERNAL_SERVER_ERROR",
        ),
      );
    }
  }

  if (!hydrated) {
    return (
      <Wrapper
        className="flex-1 bg-base-200"
        direction="column"
        align="center"
        justify="start"
        gap="gap-0"
      >
        <Header hasBackButton />
        <Text>Carregando...</Text>
      </Wrapper>
    );
  }

  if (!authToken) {
    return null;
  }

  if (!user?.isAdmin) {
    return (
      <Wrapper
        className="flex-1 bg-base-200"
        direction="column"
        align="start"
        justify="start"
        gap="gap-0"
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
            message="Apenas administradores podem gerenciar categorias."
            retryLabel="Voltar"
            onRetry={handleGoBack}
          />
        </Wrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      className="flex-1 bg-base-200"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />

      <ScrollView
        className="w-full px-6"
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Wrapper direction="column" className="w-full" gap="gap-4">
          <Wrapper direction="column" gap="gap-1">
            <Text variant="h2" className="mb-0">
              {isEditing ? "Editar categoria" : "Nova categoria"}
            </Text>
            <Text className="text-muted">
              {isEditing
                ? "Atualize o nome da categoria. Os artigos vinculados serão atualizados automaticamente."
                : "Crie uma categoria para organizar os artigos."}
            </Text>
          </Wrapper>

          <View className="w-full rounded-2xl bg-base-100 p-5 shadow-sm shadow-base-300">
            <CategoryForm
              onSubmit={handleSubmit}
              defaultValues={category ? { name: category.name } : undefined}
              submitError={submitError}
              submitLabel={isEditing ? "Salvar alterações" : "Criar categoria"}
              submittingLabel={
                isEditing ? "Salvando..." : "Criando categoria..."
              }
              disabled={isDeleting}
              footer={
                <>
                  <Button
                    variant="outline"
                    onPress={exitScreen}
                    className="h-14 w-full rounded-full border-primary-500 bg-base-100"
                  >
                    <Text className="font-medium text-primary-500">
                      Cancelar
                    </Text>
                  </Button>
                  {category && (
                    <Button
                      variant="ghost"
                      onPress={openDeleteConfirmation}
                      disabled={isDeleting}
                      className="mb-4 self-center"
                    >
                      <TrashIcon size={20} color={colors.destructive} />
                      <Text className="font-medium text-destructive">
                        Excluir categoria
                      </Text>
                    </Button>
                  )}
                </>
              }
            />
          </View>
        </Wrapper>
      </ScrollView>

      {category && (
        <BottomSheet
          visible={confirmingDelete}
          onClose={closeDeleteConfirmation}
          header={
            <Text className="text-xl font-bold text-base-900">
              Excluir categoria
            </Text>
          }
        >
          <Text className="text-base text-base-500">
            A categoria {category.name} será removida permanentemente e os
            artigos vinculados deixarão de exibi-la. Esta ação não pode ser
            desfeita.
          </Text>
          {deleteError && (
            <Text className="text-destructive">{deleteError.message}</Text>
          )}
          <Button
            variant="destructive"
            onPress={() => void handleDeleteCategory()}
            disabled={isDeleting}
            className="h-14 w-full rounded-full"
          >
            <Text className="text-base font-bold">
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Text>
          </Button>
          <Button
            variant="outline"
            onPress={closeDeleteConfirmation}
            disabled={isDeleting}
            className="h-14 w-full rounded-full"
          >
            <Text className="text-base font-bold">Cancelar</Text>
          </Button>
        </BottomSheet>
      )}
    </Wrapper>
  );
}
