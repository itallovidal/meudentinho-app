import { MagnifyingGlassIcon, XIcon } from "phosphor-react-native";
import { Button } from "./ui/button";
import { FormInput } from "./formInput";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { searchArticles } from "@/api/article/searchArticles";
import { Article } from "@/types/domain";
import { ArticlePreviewDTO } from "@/types/dtos/article";
import { Wrapper } from "./wrapper";

type SearchFormData = {
  query: string;
};

interface SearchInputProps {
  onSearchStart?: (query: string) => void;
  onSearchComplete: (query: string, articles: ArticlePreviewDTO[]) => void;
  onSearchReset?: () => void;
}

export function SearchInput({
  onSearchStart,
  onSearchComplete,
  onSearchReset,
}: SearchInputProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<SearchFormData>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      query: "",
    },
  });

  async function fetchSearchResults(query: string) {
    try {
      const payload = await searchArticles(query);
      if (payload.status === 200) {
        onSearchComplete(query, mapToPreviews(payload.data || []));
        return;
      }

      onSearchComplete(query, []);
    } catch (error) {
      onSearchComplete(query, []);
    }
  }

  const query = watch("query");
  const lastSearched = useRef("");

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed === lastSearched.current) {
      return;
    }
    const timer = setTimeout(() => {
      lastSearched.current = trimmed;
      onSearchStart?.(trimmed);
      void fetchSearchResults(trimmed);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleSearchSubmit(data: SearchFormData) {
    const query = data.query.trim();

    if (!query) {
      onSearchReset?.();
      return;
    }

    lastSearched.current = query;
    onSearchStart?.(query);
    await fetchSearchResults(query);
  }

  function onPress() {
    if (watch("query")) {
      reset();
      lastSearched.current = "";
      onSearchReset?.();
      return;
    }

    handleSubmit(handleSearchSubmit)();
  }

  return (
    <Wrapper
      className="relative mb-4 w-full flex-1"
      direction="row"
      align="center"
    >
      <FormInput
        control={control}
        errors={errors}
        name="query"
        inputProps={{
          placeholder: "Buscar artigos e guias",
          returnKeyType: "search",
          onSubmitEditing: handleSubmit(handleSearchSubmit),
          className: "bg-base-100 rounded-lg pl-4 pr-10",
        }}
      />
      <Button
        variant="ghost"
        onPress={onPress}
        disabled={isSubmitting}
        className="absolute right-0 h-full"
      >
        {watch("query") ? (
          <XIcon size={16} color="gray" weight="regular" />
        ) : (
          <MagnifyingGlassIcon size={16} color="gray" weight="regular" />
        )}
      </Button>
    </Wrapper>
  );
}

function mapToPreviews(articles: Article[]): ArticlePreviewDTO[] {
  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    categories: article.categories ?? [],
    readingTime: article.readingTime,
    imageCoverURL: article.imageCoverURL,
  }));
}
