import type { ReactNode } from "react";
import { View } from "react-native";
import { CaretRightIcon, CaretUpIcon } from "phosphor-react-native";
import { SectionHeader } from "@/components/sectionHeader";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

type DisclosureCardProps = {
  title: string;
  description: string;
  badge?: ReactNode;
  expanded: boolean;
  expandLabel: string;
  collapseLabel: string;
  onToggle: () => void;
  children: ReactNode;
};

export function DisclosureCard({
  title,
  description,
  badge,
  expanded,
  expandLabel,
  collapseLabel,
  onToggle,
  children,
}: DisclosureCardProps) {
  const Caret = expanded ? CaretUpIcon : CaretRightIcon;
  return (
    <View className="w-full gap-3 rounded-2xl border border-base-200 bg-base-100 p-4">
      <SectionHeader title={title} trailing={badge} />
      <Text className="text-xs leading-5 text-primary">{description}</Text>
      <Button
        variant="outline"
        onPress={onToggle}
        accessibilityState={{ expanded }}
        className="min-h-12 w-full gap-2 rounded-xl border-base-300 bg-base-100 px-3 py-3"
      >
        <Text className="shrink text-center text-xs font-semibold text-base-600">
          {expanded ? collapseLabel : expandLabel}
        </Text>
        <Caret size={16} weight="bold" color={THEME.light.base600} />
      </Button>
      {expanded && (
        <View className="gap-3 border-t border-secondary-200 pt-3">
          {children}
        </View>
      )}
    </View>
  );
}
