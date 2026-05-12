import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof Animated.View> & React.RefAttributes<View>) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className={cn("bg-accent rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
