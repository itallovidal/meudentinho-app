import { View } from "react-native";
import { ToothSVG } from "@/components/smile/teeth/ToothSVG";
import {
  LEGEND_TOOTH,
  MILK_SYMBOL_DASH,
  TOOTH_STYLE,
  isMilkSymbol,
  type ToothMapStateKey,
} from "@/components/smile/teeth/toothStyle";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

type SmileSummaryBadgeProps = {
  state: ToothMapStateKey;
  value: number;
  label: string;
};

export function SmileSummaryBadge({
  state,
  value,
  label,
}: SmileSummaryBadgeProps) {
  const colors = THEME.light;
  const style = TOOTH_STYLE[state];

  return (
    <View
      className="flex-row items-center gap-2 rounded-full px-3 py-1.5"
      style={{ backgroundColor: style.fill }}
    >
      <ToothSVG
        viewBox={LEGEND_TOOTH.viewBox}
        contour={LEGEND_TOOTH.contour}
        details={LEGEND_TOOTH.details}
        fill={colors.base100}
        stroke={style.stroke}
        strokeWidth={1.8}
        strokeDasharray={isMilkSymbol(state) ? MILK_SYMBOL_DASH : undefined}
        width={16}
        height={16}
      />
      <Text className="text-sm font-bold" style={{ color: style.stroke }}>
        {`${value} ${label}`}
      </Text>
    </View>
  );
}
