import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import type { ArticleCategoryDTO } from "@/types/dtos/article";
import { CaretRightIcon, TagSimpleIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

interface Props {
  category: ArticleCategoryDTO;
  onPress: (category: ArticleCategoryDTO) => void;
}

export function CategoryCard({ category, onPress }: Props) {
  const colors = THEME.light;

  return (
    <TouchableOpacity
      onPress={() => onPress(category)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Editar categoria ${category.name}`}
      accessibilityHint="Abre o formulário de edição"
      className="w-full flex-row items-center gap-4 rounded-2xl bg-base-100 px-5 py-4 shadow-md shadow-base-300"
    >
      <View className="h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100">
        <TagSimpleIcon size={26} color={colors.primary400} weight="fill" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-lg font-bold text-primary-500" numberOfLines={1}>
          {category.name}
        </Text>
        <Text className="text-sm text-base-500">Toque para editar</Text>
      </View>
      <CaretRightIcon size={20} color={colors.base500} weight="regular" />
    </TouchableOpacity>
  );
}
