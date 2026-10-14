import { ScrollView, TouchableOpacity, View } from "react-native";
import { PlusIcon } from "phosphor-react-native";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { cn, formatAgeFromBirthDate } from "@/lib/utils";

export type KidOption = {
  id: string;
  name: string;
  birthDate: string;
};

type KidSelectorProps = {
  kids: KidOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen?: (id: string) => void;
  onAdd?: () => void;
};

export function KidSelector({
  kids,
  selectedId,
  onSelect,
  onOpen,
  onAdd,
}: KidSelectorProps) {
  const colors = THEME.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="w-full"
      contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
    >
      <View className="flex-row items-center gap-2 pr-1">
        {kids.map((kid) => {
          const isSelected = kid.id === selectedId;
          const initial = (kid.name.trim().charAt(0) || "?").toUpperCase();
          const age = formatAgeFromBirthDate(kid.birthDate);

          return (
            <TouchableOpacity
              key={kid.id}
              onPress={() => onSelect(kid.id)}
              onLongPress={() => {
                onSelect(kid.id);
                onOpen?.(kid.id);
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={cn(
                "w-40 shrink-0 flex-row items-center gap-2 rounded-xl px-3 py-1",
                isSelected
                  ? "bg-primary-500"
                  : "border border-base-300 bg-base-100",
              )}
            >
              <View
                className={cn(
                  "h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isSelected ? "bg-base-100" : "bg-base-400",
                )}
              >
                <Text
                  className={cn(
                    "text-lg font-bold",
                    isSelected ? "text-primary-500" : "text-base-100",
                  )}
                >
                  {initial}
                </Text>
              </View>
              <View className="min-w-0 flex-1 shrink">
                <Text
                  numberOfLines={1}
                  className={cn(
                    "text-sm font-bold leading-5",
                    isSelected ? "text-base-100" : "text-primary-500",
                  )}
                >
                  {kid.name.split(" ")[0]}
                </Text>
                {age ? (
                  <Text
                    numberOfLines={1}
                    className={cn(
                      "mb-0.5 text-xs leading-4",
                      isSelected ? "text-base-200" : "text-base-500",
                    )}
                  >
                    {age}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
        {onAdd && (
          <TouchableOpacity
            onPress={onAdd}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Adicionar dependente"
            className="h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-base-300 bg-base-100"
          >
            <PlusIcon size={20} weight="bold" color={colors.base600} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
