import { SvgXml } from 'react-native-svg';

export function ToothSVG({ viewBox, contour, details, fill = '#0B1B2B', width = 28, height = 28, onPress, }: {
  viewBox: string;
  contour: string;
  details: string[];
  fill?: string;
  width?: number;
  height?: number;
  onPress?: () => void;
}) {
  const pathsXml =
    `<path d="${contour}" fill="${fill}"/>` +
    details
      .map((detail) => `<path d="${detail}" fill="#FFFFFF"/>`)
      .join('');

  const svg =
    `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">` +
    `${pathsXml}</svg>`;

  return <SvgXml xml={svg} width={width} height={height} onPress={onPress} />;
}

export default ToothSVG;
