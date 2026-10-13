import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { KidsLoadFailure } from "@/hooks/useKids";
import { THEME } from "@/lib/theme";
import { UsersThreeIcon } from "phosphor-react-native";
import { ActivityIndicator, View } from "react-native";

interface Props {
  loading: boolean;
  failure: KidsLoadFailure | null;
  isEmpty: boolean;
  onRetry: () => void;
  onLoginAgain: () => void;
}

export function KidsListStatus({
  loading,
  failure,
  isEmpty,
  onRetry,
  onLoginAgain,
}: Props) {
  const colors = THEME.light;

  if (loading) {
    return (
      <View className="flex-row items-center justify-center gap-2 rounded-xl bg-base-100 p-4">
        <ActivityIndicator size="small" color={colors.primary400} />
        <Text>Carregando dependentes...</Text>
      </View>
    );
  }

  if (failure === "auth") {
    return (
      <View className="items-center rounded-xl bg-base-100 px-5 py-6">
        <Text className="mb-2 text-center text-lg font-bold">
          Sessão expirada
        </Text>
        <Text className="mb-5 text-center text-base-500">
          Faça login novamente para gerenciar os dependentes.
        </Text>
        <Button onPress={onLoginAgain} className="h-12">
          <Text>Fazer login</Text>
        </Button>
      </View>
    );
  }

  if (failure === "network") {
    return (
      <View className="items-center rounded-xl bg-base-100 px-5 py-6">
        <Text className="mb-2 text-center text-lg font-bold">
          Não foi possível carregar
        </Text>
        <Text className="mb-5 text-center text-base-500">
          Verifique sua conexão e tente novamente.
        </Text>
        <Button onPress={onRetry} className="h-12">
          <Text>Tentar novamente</Text>
        </Button>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View className="items-center rounded-xl bg-base-100 px-5 py-6">
        <View className="mb-4 items-center justify-center rounded-full bg-primary-100 p-5">
          <UsersThreeIcon size={40} color={colors.primary400} weight="fill" />
        </View>
        <Text className="mb-2 text-center text-lg font-bold">
          Nenhum dependente cadastrado
        </Text>
        <Text className="text-center text-base-500">
          Toque no botão + para adicionar o primeiro dependente.
        </Text>
      </View>
    );
  }

  return null;
}
