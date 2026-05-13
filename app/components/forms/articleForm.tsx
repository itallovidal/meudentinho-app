import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput } from "../formInput";
import { ApiError } from "@/types/domain";
import { articleSchema } from "@/lib/schemas/article";
import { ArticleCategory, ArticleRequestDTO } from "@/types/dtos/article";
import { useEffect, useState } from "react";
import { getAllCategories } from "@/api/article/getAllCategories";
import { getAllArticlePreview } from "@/api/article/getArticles";
import { ScrollView } from "react-native";

interface ArticleFormProps {
  onSubmit: (data: ArticleRequestDTO) => void | Promise<void>;
  submitError?: ApiError | null;
  defaultValues?: Partial<ArticleRequestDTO>;
  submitLabel?: string;
  submittingLabel?: string;
}

const MAX_CATEGORIES = 2;

export function ArticleForm({
  onSubmit,
  defaultValues,
  submitLabel = "Criar Artigo",
  submittingLabel = "Criando artigo...",
  submitError,
}: ArticleFormProps) {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);

  // TODO: turn into a hook later?
  async function loadCategories() {
    const { data } = await getAllCategories();

    setCategories(
      data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        isSelected: defaultValues?.categories?.includes(cat.id) || false,
      })),
    );
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
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

  function addCategory(category: {
    id: string;
    name: string;
    isSelected: boolean;
  }) {
    const currentCategories = getValues("categories") || [];

    if (currentCategories.includes(category.name)) {
      // removing..
      const filtered = currentCategories.filter(
        (name) => name !== category.name,
      );

      setValue("categories", filtered);
    } else {
      if (currentCategories.length >= MAX_CATEGORIES) {
        return;
      }

      // adding..
      setValue("categories", [...currentCategories, category.name]);
    }

    // updating local
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === category.id ? { ...cat, isSelected: !cat.isSelected } : cat,
      ),
    );
  }

  return (
    <ScrollView className="flex-1 w-full">
      <Wrapper
        align="center"
        direction="column"
        className="mx-4 my-4"
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

        <Text className="w-full font-bold">
          Categorias (Selecione até {MAX_CATEGORIES})
        </Text>

        <Wrapper
          direction="row"
          align="start"
          justify="start"
          gap="gap-2"
          className="w-full flex-wrap"
        >
          {categories.map((category) => (
            <Button
              variant={category.isSelected ? "default" : "outline"}
              key={category.id}
              onPress={() => addCategory(category)}
            >
              <Text>{category.name}</Text>
            </Button>
          ))}
        </Wrapper>

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
          disabled={isSubmitting}
          className="w-full mb-4"
        >
          <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
        </Button>
      </Wrapper>
    </ScrollView>
  );
}
