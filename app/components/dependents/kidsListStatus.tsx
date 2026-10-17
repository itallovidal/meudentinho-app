import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/errorState";
import { Text } from "@/components/ui/text";
import { SkeletonKidCard } from "@/skeletons/components/skeletonKidCard";
import { KidsLoadFailure } from "@/hooks/useKids";
import { THEME } from "@/lib/theme";
import { UsersThreeIcon } from "phosphor-react-native";
import { View } from "react-native";

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
      <View className="w-full gap-4">
        <SkeletonKidCard />
        <SkeletonKidCard />
        <SkeletonKidCard />
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
      <View className="w-full gap-4">
        <ErrorState onRetry={() => void onRetry()} />
        <SkeletonKidCard />
        <SkeletonKidCard />
        <SkeletonKidCard />
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
