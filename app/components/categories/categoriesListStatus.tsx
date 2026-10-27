import { ErrorState } from "@/components/errorState";
import { Text } from "@/components/ui/text";
import { SkeletonCategoryCard } from "@/skeletons/components/skeletonCategoryCard";
import { THEME } from "@/lib/theme";
import { TagSimpleIcon } from "phosphor-react-native";
import { View } from "react-native";

interface Props {
  loading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
}

export function CategoriesListStatus({
  loading,
  isError,
  isEmpty,
  onRetry,
}: Props) {
  const colors = THEME.light;

  if (loading) {
    return (
      <View className="w-full gap-4">
        <SkeletonCategoryCard />
        <SkeletonCategoryCard />
        <SkeletonCategoryCard />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="w-full gap-4">
        <ErrorState onRetry={() => void onRetry()} />
        <SkeletonCategoryCard />
        <SkeletonCategoryCard />
        <SkeletonCategoryCard />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View className="items-center rounded-xl bg-base-100 px-5 py-6">
        <View className="mb-4 items-center justify-center rounded-full bg-primary-100 p-5">
          <TagSimpleIcon size={40} color={colors.primary400} weight="fill" />
        </View>
        <Text className="mb-2 text-center text-lg font-bold">
          Nenhuma categoria cadastrada
        </Text>
        <Text className="text-center text-muted-foreground">
          Toque no botão + para adicionar a primeira categoria.
        </Text>
      </View>
    );
  }

  return null;
}
