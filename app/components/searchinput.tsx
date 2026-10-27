import { MagnifyingGlassIcon, XIcon } from "phosphor-react-native";
import { Button } from "./ui/button";
import { FormInput } from "./formInput";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Wrapper } from "./wrapper";

type SearchFormData = {
  query: string;
};

interface SearchInputProps {
  onSearchTermChange: (term: string) => void;
}

const DEBOUNCE_MS = 400;

export function SearchInput({ onSearchTermChange }: SearchInputProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    reset,
  } = useForm<SearchFormData>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      query: "",
    },
  });

  const query = watch("query");
  const termChangeRef = useRef(onSearchTermChange);

  useEffect(() => {
    termChangeRef.current = onSearchTermChange;
  }, [onSearchTermChange]);

  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      termChangeRef.current(trimmed);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  function publishNow(term: string) {
    termChangeRef.current(term);
  }

  function handleActionPress() {
    if (query.trim()) {
      reset();
      publishNow("");
      return;
    }
    publishNow("");
  }

  return (
    <Wrapper
      className="relative w-full"
      direction="row"
      align="center"
    >
      <FormInput
        control={control}
        errors={{}}
        name="query"
        inputProps={{
          accessibilityLabel: "Buscar artigos e guias",
          placeholder: "Buscar artigos e guias",
          returnKeyType: "search",
          onSubmitEditing: () =>
            void handleSubmit((data) => publishNow(data.query.trim()))(),
          className: "bg-base-100 rounded-lg pl-4 pr-10",
        }}
      />
      <Button
        variant="ghost"
        onPress={handleActionPress}
        disabled={isSubmitting}
        accessibilityLabel={query ? "Limpar busca" : "Buscar artigos"}
        className="absolute right-0 h-full"
      >
        {query ? (
          <XIcon size={16} color="gray" weight="regular" />
        ) : (
          <MagnifyingGlassIcon size={16} color="gray" weight="regular" />
        )}
      </Button>
    </Wrapper>
  );
}
