import { Animated as NativeAnimated } from "react-native";
import Animated from "react-native-reanimated";
import { cssInterop } from "nativewind";
import * as PopoverPrimitive from "@rn-primitives/popover";

export function configureWebStyles(): void {
  cssInterop(Animated.View, { className: "style" });
  cssInterop(NativeAnimated.View, { className: "style" });
  cssInterop(PopoverPrimitive.Content, { className: "style" });
  cssInterop(PopoverPrimitive.Overlay, { className: "style" });
}
