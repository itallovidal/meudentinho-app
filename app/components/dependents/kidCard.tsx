import { Text } from "@/components/ui/text";
import { formatAgeFromBirthDate, formatDatePtBR } from "@/lib/utils";
import { THEME } from "@/lib/theme";
import type { KidResponseDTO } from "@/types/dtos/user";
import { CaretRightIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

interface Props {
  kid: KidResponseDTO;
  onPress: (kid: KidResponseDTO) => void;
}

function buildSubtitle(kid: KidResponseDTO): string {
  const parts: string[] = [];
  const ageText = formatAgeFromBirthDate(kid.birthDate);
  if (ageText) {
    parts.push(ageText);
  }
  const birthBr = formatDatePtBR(kid.birthDate);
  if (birthBr) {
    parts.push(birthBr);
  }
  return parts.join(" • ");
}

export function KidCard({ kid, onPress }: Props) {
  const colors = THEME.light;
  const subtitle = buildSubtitle(kid);
  const initial = (kid.name.trim().charAt(0) || "?").toUpperCase();

  return (
    <TouchableOpacity
      onPress={() => onPress(kid)}
      activeOpacity={0.7}
      className="w-full flex-row items-center gap-4 rounded-2xl bg-base-100 px-5 py-4 shadow-md shadow-base-300"
    >
      <View className="h-14 w-14 items-center justify-center rounded-full bg-base-300">
        <Text className="text-2xl font-light text-base-600">{initial}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-primary-500" numberOfLines={1}>
          {kid.name}
        </Text>
        {subtitle ? (
          <Text className="text-sm text-base-500" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <CaretRightIcon size={20} color={colors.base500} weight="regular" />
    </TouchableOpacity>
  );
}
