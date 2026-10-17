import { PasswordField } from "@/components/forms/passwordField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  confirmPasswordSchema,
  ConfirmPasswordDTO,
} from "@/lib/schemas/responsible";
import { cn } from "@/lib/utils";
import { ApiError } from "@/types/domain";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";

interface PasswordSheetFormProps {
  onSubmit: (data: ConfirmPasswordDTO) => void | Promise<void>;
  onCancel: () => void;
  submitError: ApiError | null;
  description?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  destructive?: boolean;
}

export function PasswordSheetForm({
  onSubmit,
  onCancel,
  submitError,
  description,
  passwordLabel = "Senha",
  passwordPlaceholder = "Digite sua senha",
  submitLabel = "Confirmar",
  submittingLabel = submitLabel,
  destructive = false,
}: PasswordSheetFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ConfirmPasswordDTO>({
    resolver: zodResolver(confirmPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
    },
  });

  return (
    <View className="w-full gap-4">
      {description ? (
        <Text className="text-base text-base-500">{description}</Text>
      ) : null}

      <PasswordField
        control={control}
        name="password"
        label={passwordLabel}
        placeholder={passwordPlaceholder}
        error={errors.password?.message}
        revealOnInput
      />

      {submitError ? (
        <Text className="text-destructive">{submitError.message}</Text>
      ) : null}

      <Button
        variant={destructive ? "outline" : "default"}
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isSubmitting || !isDirty}
        className="h-14 w-full rounded-full"
      >
        <Text
          className={cn(
            "text-base font-bold",
            destructive && "text-destructive",
          )}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Text>
      </Button>
      <Button
        variant={destructive ? "default" : "outline"}
        onPress={onCancel}
        disabled={isSubmitting}
        className="h-14 w-full rounded-full"
      >
        <Text className="text-base font-bold">Cancelar</Text>
      </Button>
    </View>
  );
}
