import { useId } from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { THEME } from "@/lib/themeColors";

export function ToothSVG({
  viewBox,
  contour,
  details,
  fill = THEME.light.primary800,
  stroke = THEME.light.base800,
  halfFill,
  halfFillSide = "bottom",
  strokeWidth = 1.4,
  strokeDasharray,
  width = 28,
  height = 28,
  onPress,
}: {
  viewBox: string;
  contour: string;
  details: string[];
  fill?: string;
  stroke?: string;
  halfFill?: string;
  halfFillSide?: "top" | "bottom";
  strokeWidth?: number;
  strokeDasharray?: string;
  width?: number;
  height?: number;
  onPress?: () => void;
}) {
  const gradientId = `tooth-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [x, y, , viewBoxHeight] = viewBox.split(/\s+/).map(Number);
  const gradient = halfFill
    ? `<defs><linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="${x}" y1="${halfFillSide === "top" ? y + viewBoxHeight : y}" x2="${x}" y2="${halfFillSide === "top" ? y : y + viewBoxHeight}"><stop offset="50%" stop-color="${fill}"/><stop offset="50%" stop-color="${halfFill}"/></linearGradient></defs>`
    : "";
  const pathFill = halfFill ? `url(#${gradientId})` : fill;
  const outline = contour.match(/M[^M]*/)?.[0] ?? contour;
  const dash = strokeDasharray || "none";
  const edge = `fill="${pathFill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-dasharray="${dash}"`;
  const pathsXml =
    `<path d="${outline}" ${edge}/>` +
    `<path d="${contour}" ${edge}/>` +
    details
      .map(
        (detail) =>
          `<path d="${detail}" fill="${pathFill}" stroke="${stroke}" stroke-width="${strokeWidth * 0.6}" stroke-linejoin="round" stroke-dasharray="none"/>`,
      )
      .join("");

  const svg =
    `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">` +
    `${gradient}${pathsXml}</svg>`;

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <SvgXml
        key={dash}
        xml={svg}
        width={width}
        height={height}
        onPress={onPress}
      />
    </View>
  );
}
