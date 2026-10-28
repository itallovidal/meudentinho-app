import { ArticleContent } from "@/components/article/articleContent";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { MarkdownEditor } from "@/components/markdownEditor";
import {
  ImageUrlPreview,
  type ImagePreviewStatus,
} from "@/components/imageUrlPreview";
import { SectionHeader } from "@/components/sectionHeader";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FormInput } from "../formInput";
import { ApiError } from "@/types/domain";
import { normalizeArticleCategory } from "@/lib/articleUrls";
import { articleSchema } from "@/lib/schemas/article";
import type { ArticleCategory, ArticleRequestDTO } from "@/types/dtos/article";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { getAllCategories } from "@/api/article/getAllCategories";
import { Keyboard, ScrollView, View } from "react-native";
import { PropsBadge } from "../propsBadge";
import { CheckIcon, EyeIcon, PencilSimpleIcon } from "phosphor-react-native";
import { THEME } from "@/lib/themeColors";

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
    setError,
    clearErrors,
    trigger,
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

  const selectedCategories = useWatch({ control, name: "categories" });
  const imageCoverURL = useWatch({ control, name: "imageCoverURL" }).trim();
  const imageUrlValidation =
    articleSchema.shape.imageCoverURL.safeParse(imageCoverURL);
  const previewUrl = imageUrlValidation.success
    ? imageUrlValidation.data
    : null;
  const [imagePreview, setImagePreview] = useState<{
    url: string;
    status: ImagePreviewStatus;
  } | null>(null);
  const [isImageEditing, setIsImageEditing] = useState(
    () =>
      !articleSchema.shape.imageCoverURL.safeParse(
        defaultValues?.imageCoverURL ?? "",
      ).success,
  );
  const imageReady =
    !isImageEditing &&
    imagePreview?.url === imageCoverURL &&
    imagePreview.status === "loaded";
  const [titleHeight, setTitleHeight] = useState(64);
  const [imageUrlHeight, setImageUrlHeight] = useState(64);
  const isEditing = defaultValues !== undefined;
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<
    (ArticleRequestDTO & { readingTime: number }) | null
  >(null);

  function openPreview() {
    Keyboard.dismiss();
    const values = getValues();
    const wordCount = values.content.trim()
      ? values.content.trim().split(/\s+/).length
      : 0;
    setPreviewArticle({
      ...values,
      title: values.title.trim() || "Título do artigo",
      summary: values.summary.trim(),
      content: values.content.trim()
        ? values.content
        : "O conteúdo do artigo aparecerá aqui quando você começar a escrever.",
      imageCoverURL: imageReady ? imageCoverURL : "",
      readingTime: Math.ceil(wordCount / 140),
    });
    setPreviewVisible(true);
  }

  const handleImageStatus = useCallback(
    (url: string, status: ImagePreviewStatus) => {
      if (getValues("imageCoverURL").trim() !== url) return;
      setImagePreview({ url, status });
      if (status === "loaded") clearErrors("imageCoverURL");
    },
    [getValues, clearErrors],
  );

  function editImage() {
    setImagePreview(null);
    setIsImageEditing(true);
  }

  async function confirmImage() {
    if (!(await trigger("imageCoverURL"))) return;
    const url = getValues("imageCoverURL").trim();
    setValue("imageCoverURL", url, { shouldDirty: true, shouldValidate: true });
    setImagePreview(null);
    setIsImageEditing(false);
    Keyboard.dismiss();
  }

  const ImageActionIcon = isImageEditing ? CheckIcon : PencilSimpleIcon;
  const imageAction = (
    <Button
      variant="outline"
      size="icon"
      onPress={isImageEditing ? () => void confirmImage() : editImage}
      disabled={isSubmitting}
      accessibilityLabel={
        isImageEditing ? "Confirmar URL da imagem" : "Editar imagem de capa"
      }
      className="h-11 w-11 shrink-0 rounded-full border-base-300 bg-base-100 shadow-sm"
    >
      <ImageActionIcon size={20} color={THEME.light.primary500} weight="bold" />
    </Button>
  );

  async function submitArticle(data: ArticleRequestDTO) {
    if (!imageReady || imagePreview?.url !== data.imageCoverURL) {
      setError("imageCoverURL", {
        type: "validate",
        message:
          "Aguarde a prévia carregar uma imagem válida antes de continuar.",
      });
      return;
    }
    const category = categoriesData?.find(
      (item) =>
        normalizeArticleCategory(item.name) ===
        normalizeArticleCategory(data.categories[0]),
    );
    if (!category) {
      setError("categories", {
        type: "validate",
        message: "Escolha uma categoria disponível para salvar o artigo.",
      });
      return;
    }
    await onSubmit({ ...data, categories: [category.name] });
  }

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
      isSelected: currentCategories.some(
        (name) =>
          normalizeArticleCategory(name) === normalizeArticleCategory(cat.name),
      ),
    }));
  }, [categoriesData, selectedCategories]);

  function addCategory(category: {
    id: string;
    name: string;
    isSelected: boolean;
  }) {
    const currentCategories = getValues("categories") || [];

    const selected =
      currentCategories.length === MAX_CATEGORIES &&
      normalizeArticleCategory(currentCategories[0]) ===
        normalizeArticleCategory(category.name);
    setValue("categories", selected ? [] : [category.name], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <>
      <ScrollView
        className="w-full flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Wrapper
          align="start"
          direction="column"
          className="mx-6 my-4 pb-6"
          gap="gap-4"
        >
          <View className="w-full gap-2 pb-1">
            <Text
              accessibilityRole="header"
              className="text-2xl font-bold text-primary-800"
            >
              {isEditing ? "Editar artigo" : "Novo artigo"}
            </Text>
            <Text className="text-sm leading-5 text-muted-foreground">
              Compartilhe orientações e cuidados para acompanhar cada sorriso.
            </Text>
          </View>

          <View className="w-full gap-5 rounded-2xl bg-base-100 p-5">
            <SectionHeader title="Informações do artigo" />
            <FormInput
              control={control}
              errors={errors}
              name="title"
              label="Título"
              inputProps={{
                placeholder: "Dê um título ao artigo",
                multiline: true,
                numberOfLines: 2,
                scrollEnabled: false,
                style: { height: titleHeight },
                onContentSizeChange: (event) =>
                  setTitleHeight(
                    Math.max(
                      64,
                      Math.ceil(event.nativeEvent.contentSize.height),
                    ),
                  ),
                autoCapitalize: "sentences",
                autoCorrect: true,
                editable: !isSubmitting,
                className: "rounded-xl bg-base-200",
              }}
            />
            <FormInput
              control={control}
              errors={errors}
              name="summary"
              label="Resumo"
              inputProps={{
                placeholder:
                  "Conte em poucas palavras o que o leitor vai encontrar",
                multiline: true,
                autoCapitalize: "sentences",
                autoCorrect: true,
                editable: !isSubmitting,
                className: "min-h-24 rounded-xl bg-base-200",
              }}
            />
            <View className="w-full gap-2">
              <Text className="font-bold text-primary-800">Categoria</Text>
              <Text className="text-xs leading-5 text-muted-foreground">
                Escolha uma categoria para o artigo.
              </Text>
              {categoriesData &&
                (selectedCategories.length > 1 ||
                  selectedCategories.some(
                    (name) =>
                      !categories.some(
                        (category) =>
                          normalizeArticleCategory(category.name) ===
                          normalizeArticleCategory(name),
                      ),
                  )) && (
                  <Text
                    accessibilityRole="alert"
                    className="text-xs text-destructive"
                  >
                    Este artigo possui categorias antigas:{" "}
                    {selectedCategories.join(", ")}. Escolha uma categoria
                    disponível para salvar.
                  </Text>
                )}
              <View
                pointerEvents={isSubmitting ? "none" : "auto"}
                className="w-full"
              >
                <PropsBadge
                  props={categories}
                  onPress={addCategory}
                  isLoading={
                    isCategoriesFetching ||
                    (!!categoriesFetchingError && categories.length === 0)
                  }
                  wrap
                />
              </View>
              {categoriesFetchingError && (
                <QueryWarningBanner
                  message="Não foi possível atualizar as categorias."
                  onRetry={() => void refetchCategories()}
                />
              )}
              {!isCategoriesFetching &&
                !categoriesFetchingError &&
                categories.length === 0 && (
                  <Text className="text-xs leading-5 text-muted-foreground">
                    Nenhuma categoria disponível no momento.
                  </Text>
                )}
              {errors.categories && (
                <Text
                  accessibilityRole="alert"
                  className="text-xs text-destructive"
                >
                  {errors.categories.message}
                </Text>
              )}
            </View>
          </View>

          <View className="w-full gap-4 rounded-2xl bg-base-100 p-5">
            <SectionHeader title="Imagem de capa" />
            {isImageEditing ? (
              <View className="w-full gap-3 rounded-2xl border border-base-200 bg-base-200 p-4">
                <View className="w-full flex-row items-center justify-between gap-3">
                  <Text className="min-w-0 flex-1 text-sm font-semibold text-primary-800">
                    Editar imagem de capa
                  </Text>
                  {imageAction}
                </View>
                <Text className="text-xs leading-5 text-muted-foreground">
                  Cole o link direto da imagem e toque no check para confirmar e
                  carregar a capa.
                </Text>
                <FormInput
                  control={control}
                  errors={errors}
                  name="imageCoverURL"
                  label="URL da imagem"
                  inputProps={{
                    placeholder: "https://exemplo.com/imagem.jpg",
                    multiline: true,
                    numberOfLines: 2,
                    scrollEnabled: false,
                    style: { height: imageUrlHeight },
                    onContentSizeChange: (event) =>
                      setImageUrlHeight(
                        Math.max(
                          64,
                          Math.ceil(event.nativeEvent.contentSize.height),
                        ),
                      ),
                    keyboardType: "url",
                    autoCapitalize: "none",
                    autoCorrect: false,
                    editable: !isSubmitting,
                    className: "rounded-xl bg-base-200",
                  }}
                />
                {imageCoverURL &&
                  !imageUrlValidation.success &&
                  !errors.imageCoverURL && (
                    <Text
                      accessibilityLiveRegion="polite"
                      className="text-xs text-destructive"
                    >
                      {imageUrlValidation.error.issues[0]?.message}
                    </Text>
                  )}
              </View>
            ) : (
              <ImageUrlPreview
                key={previewUrl ?? "empty"}
                url={previewUrl}
                accessibilityLabel="Prévia da imagem de capa do artigo"
                onStatusChange={handleImageStatus}
                action={imageAction}
              />
            )}
          </View>

          <View className="w-full gap-4 rounded-2xl bg-base-100 p-5">
            <SectionHeader title="Conteúdo" />
            <Controller
              control={control}
              name="content"
              render={({ field, fieldState }) => (
                <MarkdownEditor
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  editable={!isSubmitting}
                  label="Texto do artigo"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </View>

          {submitError && (
            <Text
              accessibilityRole="alert"
              className="text-sm leading-5 text-destructive"
            >
              {submitError.message}
            </Text>
          )}
          <View className="w-full gap-3 pt-2">
            {!imageReady && (
              <Text
                accessibilityLiveRegion="polite"
                className="text-center text-xs leading-5 text-muted-foreground"
              >
                {previewUrl &&
                imagePreview?.url === previewUrl &&
                imagePreview.status === "loading"
                  ? "Aguarde a imagem de capa carregar para continuar."
                  : "Adicione uma imagem de capa que carregue na prévia para continuar."}
              </Text>
            )}
            <Button
              variant="ghost"
              onPress={openPreview}
              disabled={isSubmitting}
              accessibilityLabel="Visualizar prévia do artigo"
              className="h-14 w-full rounded-full"
            >
              <EyeIcon size={16} color={THEME.light.primary500} weight="bold" />
              <Text className="text-base font-bold text-primary-500">
                Visualizar prévia
              </Text>
            </Button>
            <Button
              onPress={() => void handleSubmit(submitArticle)()}
              disabled={isSubmitting || !isDirty || !imageReady}
              accessibilityState={{
                disabled: isSubmitting || !isDirty || !imageReady,
                busy: isSubmitting,
              }}
              className="h-14 w-full rounded-full"
            >
              <Text className="text-base font-bold">
                {isSubmitting ? submittingLabel : submitLabel}
              </Text>
            </Button>
          </View>
          {footer}
        </Wrapper>
      </ScrollView>
      <BottomSheet
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        header={
          <Text className="text-xl font-bold text-primary-800">
            Prévia do artigo
          </Text>
        }
      >
        {(dismiss) => (
          <>
            {previewArticle && (
              <ArticleContent
                title={previewArticle.title}
                summary={previewArticle.summary}
                categories={previewArticle.categories}
                readingTime={previewArticle.readingTime}
                imageCoverURL={previewArticle.imageCoverURL}
                content={previewArticle.content}
              />
            )}
            <Button
              variant="outline"
              onPress={dismiss}
              className="h-14 w-full rounded-full"
            >
              <Text className="text-base font-bold text-primary-500">
                Voltar à edição
              </Text>
            </Button>
          </>
        )}
      </BottomSheet>
    </>
  );
}
