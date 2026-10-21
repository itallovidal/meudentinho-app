import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/formInput";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/lib/schemas/category";
import type { ApiError } from "@/types/domain";

interface Props {
  onSubmit: (data: CategoryFormValues) => void | Promise<void>;
  defaultValues?: Partial<CategoryFormValues>;
  submitError?: ApiError | null;
  submitLabel?: string;
  submittingLabel?: string;
  disabled?: boolean;
  footer?: ReactNode;
}

export function CategoryForm({
  onSubmit,
  defaultValues,
  submitError,
  submitLabel = "Criar categoria",
  submittingLabel = "Criando categoria...",
  disabled = false,
  footer,
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      ...defaultValues,
    },
  });

  return (
    <Wrapper direction="column" align="start" className="w-full" gap="gap-4">
      <FormInput
        control={control}
        errors={errors}
        name="name"
        label="Nome da categoria"
        labelProps={{
          className:
            "mb-1 text-xs font-semibold uppercase tracking-wide text-primary-400",
        }}
        inputProps={{
          placeholder: "Ex: Higiene Oral",
          autoCapitalize: "sentences",
          autoCorrect: false,
          className: "bg-base-100",
        }}
      />

      {submitError && (
        <Text className="text-destructive">{submitError.message}</Text>
      )}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isDirty || disabled}
        className="mt-2 h-14 w-full rounded-full"
      >
        <Text>{isSubmitting ? submittingLabel : submitLabel}</Text>
      </Button>

      {footer}
    </Wrapper>
  );
}
