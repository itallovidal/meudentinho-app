import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  default as Animated,
} from "react-native-reanimated";

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
}

const TOAST_DURATION_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(8, { duration: 200 });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (text: string) => {
      setMessage(text);
      opacity.value = withTiming(1, { duration: 150 });
      translateY.value = withTiming(0, { duration: 150 });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(hide, TOAST_DURATION_MS);
    },
    [hide, opacity, translateY],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          animatedStyle,
          {
            position: "absolute",
            bottom: 112,
            left: 0,
            right: 0,
            alignItems: "center",
          },
        ]}
      >
        {message !== null && (
          <View className="rounded-full bg-base-900 px-6 py-3 shadow-lg shadow-black/20">
            <Text className="text-white">{message}</Text>
          </View>
        )}
      </Animated.View>
    </ToastContext.Provider>
  );
}
