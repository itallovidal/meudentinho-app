import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Animated, Platform, View } from "react-native";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof Animated.View> & React.RefAttributes<View>) {
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className={cn("rounded-md bg-accent", className)}
      {...props}
    />
  );
}

export { Skeleton };
