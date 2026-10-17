import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { PasswordField } from "@/components/forms/passwordField";
import {
  deleteAccountSchema,
  DeleteAccountDTO,
} from "@/lib/schemas/responsible";
import { ApiError } from "@/types/domain";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";

interface DeleteAccountFormProps {
  onSubmit: (data: DeleteAccountDTO) => void | Promise<void>;
  onCancel: () => void;
  submitError: ApiError | null;
}

export function DeleteAccountForm({
  onSubmit,
  onCancel,
  submitError,
}: DeleteAccountFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountDTO>({
    resolver: zodResolver(deleteAccountSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
    },
  });

  return (
    <View className="w-full gap-4">
      <Text className="text-base text-base-500">
        Todos os dependentes e o histórico serão apagados e esta ação é
        irreversível. Digite sua senha para confirmar.
      </Text>

      <PasswordField
        control={control}
        name="password"
        label="Senha"
        placeholder="Digite sua senha"
        error={errors.password?.message}
        revealOnInput
      />

      {submitError ? (
        <Text className="text-destructive">{submitError.message}</Text>
      ) : null}

      <Button
        variant="outline"
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isSubmitting}
        className="h-14 w-full rounded-full"
      >
        <Text className="text-base font-bold text-destructive">
          {isSubmitting ? "Excluindo..." : "Excluir"}
        </Text>
      </Button>
      <Button
        onPress={onCancel}
        disabled={isSubmitting}
        className="h-14 w-full rounded-full"
      >
        <Text className="text-base font-bold">Cancelar</Text>
      </Button>
    </View>
  );
}
