import { CategoriesListStatus } from "@/components/categories/categoriesListStatus";
import { CategoryCard } from "@/components/categories/categoryCard";
import { ErrorState } from "@/components/errorState";
import { Header } from "@/components/header";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { FloatingActionButton } from "@/components/ui/floatingActionButton";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useCategories } from "@/hooks/useCategories";
import { THEME } from "@/lib/theme";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import type { ArticleCategoryDTO } from "@/types/dtos/article";
import { useNavigation } from "@react-navigation/native";
import { PlusIcon } from "phosphor-react-native";
import { useContext, useEffect } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

export function Categories() {
  const { authToken, hydrated, user } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();
  const colors = THEME.light;

  const {
    categories,
    isLoading,
    isRefreshing,
    isError,
    refetchError,
    refetch,
  } = useCategories();

  const isEmptyState = !isLoading && !isError && categories.length === 0;
  const showCategoryList = !isLoading && !isError && categories.length > 0;

  useEffect(() => {
    if (hydrated && !authToken) {
      navigation.replace("Login");
    }
  }, [hydrated, authToken, navigation]);

  function handleSelectCategory(category: ArticleCategoryDTO) {
    navigation.navigate("EditCategory", { category });
  }

  function handleCreateCategory() {
    navigation.navigate("EditCategory");
  }

  function handleGoBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Index");
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

      <View className="relative w-full flex-1">
        <ScrollView
          className="w-full px-6"
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void refetch()}
            />
          }
        >
          <Wrapper direction="column" className="w-full" gap="gap-4">
            <Wrapper direction="column" gap="gap-1">
              <Text
                variant="h2"
                className={`mb-0 ${isEmptyState ? "text-center" : ""}`}
              >
                Categorias
              </Text>
              <Text
                className={`text-muted ${isEmptyState ? "text-center" : ""}`}
              >
                {isEmptyState
                  ? "Adicione a primeira categoria para começar."
                  : "Toque em uma categoria para editar o nome."}
              </Text>
            </Wrapper>

            {refetchError && (
              <QueryWarningBanner
                message="Não foi possível atualizar as categorias. Mostrando a lista carregada anteriormente."
                onRetry={() => void refetch()}
              />
            )}

            <CategoriesListStatus
              loading={isLoading}
              isError={isError}
              isEmpty={isEmptyState}
              onRetry={() => void refetch()}
            />

            {showCategoryList &&
              categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onPress={handleSelectCategory}
                />
              ))}
          </Wrapper>
        </ScrollView>

        {!isLoading && !isError && (
          <FloatingActionButton
            accessibilityLabel="Nova categoria"
            onPress={handleCreateCategory}
            icon={
              <PlusIcon
                size={24}
                weight="bold"
                color={colors.primaryForeground}
              />
            }
          />
        )}
      </View>
    </Wrapper>
  );
}
