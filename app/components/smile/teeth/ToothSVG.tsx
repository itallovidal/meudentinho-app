import React from 'react';
import Svg, { G } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import { ToothPath } from './paths';

export type StrokeColor =
  | 'black'
  | 'light-blue'
  | 'gray'
  | 'dark-blue'
  | 'orange'
  | 'soft-red';

const STROKE_MAP: Record<StrokeColor, string> = {
  'black': '#0B1B2B',
  'light-blue': '#4C9BDD',
  'gray': '#8E97A3',
  'dark-blue': '#1E3A5F',
  'orange': '#DE7F02',
  'soft-red': '#DA4E4E',
};

export function ToothSVG({ viewBox, content, width = 28, height = 28, stroke = 'black', strokeWidth = 2, fill = '#FFFFFF', flipHorizontal = false, flipVertical = false, onPress, }: {
  viewBox: string;
  content: string;
  width?: number;
  height?: number;
  stroke?: StrokeColor;
  strokeWidth?: number;
  fill?: string;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  onPress?: () => void;
}) {
  const strokeColor = STROKE_MAP[stroke];
  const viewSize = viewBox.split(' ');
  const viewWidth = parseFloat(viewSize[2]);
  const viewHeight = parseFloat(viewSize[3]);
  const painted = content
    .split('class="cls-1"')
    .join(`fill="${fill}" stroke="${strokeColor}" stroke-width="${strokeWidth}"`);
  const translateX = flipHorizontal ? viewWidth : 0;
  const translateY = flipVertical ? viewHeight : 0;
  const scaleX = flipHorizontal ? -1 : 1;
  const scaleY = flipVertical ? -1 : 1;
  const transform =
    flipHorizontal || flipVertical
      ? ` transform="translate(${translateX},${translateY}) scale(${scaleX},${scaleY})"`
      : '';

  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">` +
    `<g${transform}>${painted}</g></svg>`;

  return <SvgXml xml={svg} width={width} height={height} onPress={onPress} />;
}

export default ToothSVG;
