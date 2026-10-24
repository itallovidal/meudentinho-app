import { useCallback, useState } from "react";
import { useWindowDimensions } from "react-native";
import type { LayoutChangeEvent } from "react-native";

export function useContainerWidth(horizontalInset = 0) {
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const onLayout = useCallback(function measureContainer(
    event: LayoutChangeEvent,
  ) {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0) {
      setMeasuredWidth(nextWidth);
    }
  }, []);

  return {
    width: measuredWidth ?? Math.max(1, windowWidth - horizontalInset),
    onLayout,
  };
}
