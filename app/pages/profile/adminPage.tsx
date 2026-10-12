import { createNewArticle } from "@/api/article/createNewArticle";
import { ArticleForm } from "@/components/forms/articleForm";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { ApiError } from "@/types/domain";
import { ArticleRequestDTO } from "@/types/dtos/article";
import { useNavigation } from "@react-navigation/native";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export function AdminPage() {
  const { authToken, hydrated, user } = useContext(UserContext)!;
  const [error, setError] = useState<ApiError | null>(null);
  const navigation = useNavigation<ProfileNavegationProp>();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!authToken) {
      navigation.navigate("Login");
    } else if (!user?.isAdmin) {
      navigation.goBack();
    }
  }, [hydrated, authToken, user, navigation]);

  const createArticleMutation = useMutation({
    mutationFn: (articleRequestDTO: ArticleRequestDTO) =>
      createNewArticle(articleRequestDTO, authToken ?? ""),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["articles-preview"] }),
  });

  async function onSubmit(articleRequestDTO: ArticleRequestDTO) {
    setError(null);
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }
      await createArticleMutation.mutateAsync(articleRequestDTO);
      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err);
        return;
      }
      setError(
        new ApiError(
          "Não foi possível criar o artigo. Verifique sua conexão e tente novamente.",
          "INTERNAL_SERVER_ERROR",
        ),
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
    return null;
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

      <ArticleForm submitError={error} onSubmit={onSubmit} />
    </Wrapper>
  );
}
