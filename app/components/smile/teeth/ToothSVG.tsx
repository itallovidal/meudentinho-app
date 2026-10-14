import { SvgXml } from "react-native-svg";

export function ToothSVG({
  viewBox,
  contour,
  details,
  fill = "#0B1B2B",
  stroke = "#1F2937",
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
  strokeWidth?: number;
  strokeDasharray?: string;
  width?: number;
  height?: number;
  onPress?: () => void;
}) {
  const outline = contour.match(/M[^M]*/)?.[0] ?? contour;
  const dash = strokeDasharray ? ` stroke-dasharray="${strokeDasharray}"` : "";
  const edge = `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"${dash}`;
  const pathsXml =
    `<path d="${outline}" ${edge}/>` +
    `<path d="${contour}" ${edge}/>` +
    details
      .map(
        (detail) =>
          `<path d="${detail}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth * 0.6}" stroke-linejoin="round"/>`,
      )
      .join("");

  const svg =
    `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">` +
    `${pathsXml}</svg>`;

  return <SvgXml xml={svg} width={width} height={height} onPress={onPress} />;
}

export default ToothSVG;
