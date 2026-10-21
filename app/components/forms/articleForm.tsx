import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FormInput } from "../formInput";
import { ApiError } from "@/types/domain";
import { articleSchema } from "@/lib/schemas/article";
import type { ArticleCategory, ArticleRequestDTO } from "@/types/dtos/article";
import { useMemo, type ReactNode } from "react";
import { getAllCategories } from "@/api/article/getAllCategories";
import { ScrollView } from "react-native";
import { PropsBadge } from "../propsBadge";

interface ArticleFormProps {
  onSubmit: (data: ArticleRequestDTO) => void | Promise<void>;
  submitError?: ApiError | null;
  defaultValues?: Partial<ArticleRequestDTO>;
  submitLabel?: string;
  submittingLabel?: string;
  footer?: ReactNode;
}

const MAX_CATEGORIES = 1;

export function ArticleForm({
  onSubmit,
  defaultValues,
  submitLabel = "Criar Artigo",
  submittingLabel = "Criando artigo...",
  submitError,
  footer,
}: ArticleFormProps) {
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ArticleRequestDTO>({
    resolver: zodResolver(articleSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      categories: [],
      imageCoverURL: "",
      ...defaultValues,
    },
  });

  const selectedCategories = watch("categories");

  const {
    data: categoriesData,
    isFetching: isCategoriesFetching,
    error: categoriesFetchingError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["article-categories"],
    queryFn: () => getAllCategories().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const categories = useMemo<ArticleCategory[]>(() => {
    if (!categoriesData) return [];

    const currentCategories = selectedCategories ?? [];

    return categoriesData.map((cat) => ({
      id: cat.id,
      name: cat.name,
      isSelected: currentCategories.includes(cat.name),
    }));
  }, [categoriesData, selectedCategories]);

  function addCategory(category: {
    id: string;
    name: string;
    isSelected: boolean;
  }) {
    const currentCategories = getValues("categories") || [];

    if (currentCategories.includes(category.name)) {
      const filtered = currentCategories.filter(
        (name) => name !== category.name,
      );

      setValue("categories", filtered, { shouldDirty: true });
    } else {
      if (currentCategories.length >= MAX_CATEGORIES) {
        return;
      }

      setValue("categories", [...currentCategories, category.name], {
        shouldDirty: true,
      });
    }
  }

  const categoriesError = useMemo(() => {
    if (!categoriesFetchingError) return undefined;

    return {
      name: categoriesFetchingError.name,
      cause: categoriesFetchingError.cause,
      message: categoriesFetchingError.message,
      stack: categoriesFetchingError.stack,
      onPress: refetchCategories,
    };
  }, [categoriesFetchingError, refetchCategories]);

  return (
    <ScrollView className="w-full flex-1">
      <Wrapper
        align="center"
        direction="column"
        className="mx-6 my-4"
        gap={"gap-6"}
      >
        <FormInput
          control={control}
          errors={errors}
          name="title"
          label="Título do Artigo"
          inputProps={{
            placeholder: "Digite o título do artigo",
            autoCorrect: false,
            className: "bg-white",
          }}
        />

        <Text className="w-full font-bold">Categoria</Text>

        <PropsBadge
          props={categories}
          onPress={addCategory}
          isLoading={isCategoriesFetching}
          error={categoriesError}
          wrap
        />

        <FormInput
          control={control}
          errors={errors}
          name="summary"
          label="Resumo do Artigo"
          inputProps={{
            placeholder: "Digite o resumo do artigo",
            keyboardType: "default",
            autoCapitalize: "sentences",
            autoCorrect: true,
            className: "bg-white",
          }}
        />

        <FormInput
          control={control}
          errors={errors}
          name="imageCoverURL"
          label="URL da Imagem de Capa"
          inputProps={{
            placeholder: "Digite a URL da imagem de capa",
            autoCapitalize: "none",
            autoCorrect: false,
            className: "bg-white",
          }}
        />

        <FormInput
          control={control}
          errors={errors}
          name="content"
          label="Conteúdo do Artigo"
          inputProps={{
            placeholder: "Digite o conteúdo do artigo",
            multiline: true,
            autoCapitalize: "none",
            autoCorrect: false,
            className: "bg-white h-[200px]",
          }}
        />

        {submitError && (
          <Text className="text-red-600">{submitError.message}</Text>
        )}

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || !isDirty}
          className="mb-4 w-full"
        >
          <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
        </Button>

        {footer}
      </Wrapper>
    </ScrollView>
  );
}
