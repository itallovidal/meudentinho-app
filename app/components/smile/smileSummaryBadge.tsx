import { useState } from "react";
import {
  Platform,
  View,
  useWindowDimensions,
  type TextLayoutEvent,
} from "react-native";
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
  const text = `${value} ${label}`.replace(/ /g, "\u00a0");
  const { fontScale } = useWindowDimensions();
  const [measurement, setMeasurement] = useState<{
    text: string;
    fontScale: number;
    width: number;
  } | null>(null);
  const textWidth =
    measurement?.text === text && measurement.fontScale === fontScale
      ? measurement.width
      : undefined;

  function handleTextLayout(event: TextLayoutEvent) {
    const lines = event.nativeEvent.lines;
    if (lines.length === 0) {
      return;
    }
    const width =
      Math.ceil(lines.reduce((sum, line) => sum + line.width, 0)) + 1;
    setMeasurement((current) =>
      current?.text === text &&
      current.fontScale === fontScale &&
      current.width === width
        ? current
        : { text, fontScale, width },
    );
  }

  return (
    <View
      className="shrink-0 flex-row items-center gap-2 self-start rounded-full px-3 py-1.5"
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
      <Text
        onTextLayout={Platform.OS === "android" ? handleTextLayout : undefined}
        className="shrink-0 text-sm font-bold"
        style={{ color: colors.primary800, width: textWidth }}
      >
        {text}
      </Text>
    </View>
  );
}
