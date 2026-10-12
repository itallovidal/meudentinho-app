import React from 'react';
import Svg, { G } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import { ToothPath } from './paths';

export type StrokeColor = 'black' | 'light-blue' | 'gray';

const STROKE_MAP: Record<StrokeColor, string> = {
  'black': '#0B1B2B',
  'light-blue': '#7CB9E8',
  'gray': '#B0B0B0',
};

export function ToothSVG({ viewBox, content, width = 28, height = 28, stroke = 'black', flipHorizontal = false, onPress, }: {
  viewBox: string;
  content: string;
  width?: number;
  height?: number;
  stroke?: StrokeColor;
  flipHorizontal?: boolean;
  onPress?: () => void;
}) {
  const strokeColor = STROKE_MAP[stroke];

  // Build a minimal svg wrapper around the content and replace stroke color in css
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">` +
    `<defs><style>.cls-1{fill:#fff;stroke:${strokeColor};stroke-width:1.5px}</style></defs><g ${flipHorizontal ? `transform=\"translate(${parseFloat(viewBox.split(' ')[2])},0) scale(-1,1)\"` : ''}>${content}</g></svg>`;

  return <SvgXml xml={svg} width={width} height={height} onPress={onPress} />;
}

export default ToothSVG;
