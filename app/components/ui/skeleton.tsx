import { cn } from "@/lib/utils";
import { SKELETON_ANIMATION } from "@/lib/themeColors";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Platform, View } from "react-native";

function Skeleton({
  className,
  style,
  ...props
}: React.ComponentProps<typeof Animated.View> & React.RefAttributes<View>) {
  const [opacity] = useState(
    () => new Animated.Value(SKELETON_ANIMATION.minOpacity),
  );

  useEffect(
    function configurePulse() {
      let active = true;
      let pulse: Animated.CompositeAnimation | undefined;
      let preferenceChanged = false;

      function updateMotion(reduceMotion: boolean) {
        if (!active) return;
        pulse?.stop();
        opacity.setValue(
          reduceMotion
            ? SKELETON_ANIMATION.maxOpacity
            : SKELETON_ANIMATION.minOpacity,
        );
        if (reduceMotion) return;
        pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: SKELETON_ANIMATION.maxOpacity,
              duration: SKELETON_ANIMATION.durationMs,
              useNativeDriver: Platform.OS !== "web",
            }),
            Animated.timing(opacity, {
              toValue: SKELETON_ANIMATION.minOpacity,
              duration: SKELETON_ANIMATION.durationMs,
              useNativeDriver: Platform.OS !== "web",
            }),
          ]),
        );
        pulse.start();
      }

      const subscription = AccessibilityInfo.addEventListener(
        "reduceMotionChanged",
        function handleMotionChange(reduceMotion) {
          preferenceChanged = true;
          updateMotion(reduceMotion);
        },
      );
      void AccessibilityInfo.isReduceMotionEnabled()
        .then(function initializeMotion(reduceMotion) {
          if (!preferenceChanged) updateMotion(reduceMotion);
        })
        .catch(function initializeDefaultMotion() {
          if (!preferenceChanged) updateMotion(false);
        });
      return function stopPulse() {
        active = false;
        pulse?.stop();
        subscription.remove();
      };
    },
    [opacity],
  );

  return (
    <Animated.View
      style={[style, { opacity }]}
      className={cn("rounded-md bg-skeleton", className)}
      {...props}
    />
  );
}

export { Skeleton };
