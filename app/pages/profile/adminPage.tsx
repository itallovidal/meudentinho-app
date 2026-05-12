import { createNewArticle } from "@/api/article/createNewArticle";
import { ArticleForm } from "@/components/forms/articleForm";
import { ApiError } from "@/types/domain";
import { ArticleRequestDTO } from "@/types/dtos/article";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ScrollView } from "react-native";

export function AdminPage() {
  const [error, setError] = useState<ApiError | null>(null);
  const navigation = useNavigation();

  async function onSubmit(articleRequestDTO: ArticleRequestDTO) {
    try {
      console.log("Submitting article:", articleRequestDTO);
      await createNewArticle(articleRequestDTO);

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
    <ScrollView className="px-4 my-4">
      <ArticleForm submitError={error} onSubmit={onSubmit} />
    </ScrollView>
  );
}
