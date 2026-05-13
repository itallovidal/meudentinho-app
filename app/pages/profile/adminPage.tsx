import { createNewArticle } from "@/api/article/createNewArticle";
import { ArticleForm } from "@/components/forms/articleForm";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { ApiError } from "@/types/domain";
import { ArticleRequestDTO } from "@/types/dtos/article";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";

export function AdminPage() {
  const { authToken } = useContext(UserContext)!;
  const [error, setError] = useState<ApiError | null>(null);
  const navigation = useNavigation();

  async function onSubmit(articleRequestDTO: ArticleRequestDTO) {
    try {
      console.log("Submitting article:", articleRequestDTO);
      await createNewArticle(articleRequestDTO, authToken!);

      console.log("article created successfully");
      navigation.goBack();
    } catch (err: unknown) {
      console.log("Signup error:", err);
      if (err instanceof ApiError) {
        setError(err);
        return;
      }
    }
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
