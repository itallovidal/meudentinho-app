import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { XIcon } from "phosphor-react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { THEME } from "@/lib/theme";

const colors = THEME.light;

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 700;
const OFFSCREEN_OFFSET = 700;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  header: ReactNode;
  children: ReactNode | ((dismiss: () => void) => ReactNode);
  centerHeader?: boolean;
};

export function BottomSheet({
  visible,
  onClose,
  header,
  children,
  centerHeader = false,
}: BottomSheetProps) {
  const translateY = useSharedValue(OFFSCREEN_OFFSET);
  const backdropOpacity = useSharedValue(0);
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  function animateOut(onHidden: () => void) {
    translateY.value = withTiming(
      OFFSCREEN_OFFSET,
      { duration: 200 },
      (finished) => {
        if (finished) {
          translateY.value = OFFSCREEN_OFFSET;
          backdropOpacity.value = 0;
          runOnJS(onHidden)();
        }
      },
    );
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }

  function unmountSheet() {
    mountedRef.current = false;
    setMounted(false);
  }

  function dismiss() {
    animateOut(() => {
      unmountSheet();
      onClose();
    });
  }

  useEffect(() => {
    if (visible) {
      if (mountedRef.current) {
        handleShow();
      } else {
        mountedRef.current = true;
        setMounted(true);
      }
      return;
    }
    if (mountedRef.current) {
      animateOut(unmountSheet);
    }
  }, [visible]);

  const pan = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.translationY > DISMISS_DISTANCE ||
        event.velocityY > DISMISS_VELOCITY;
      if (shouldDismiss) {
        runOnJS(dismiss)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  function handleShow() {
    translateY.value = OFFSCREEN_OFFSET;
    backdropOpacity.value = 0;
    translateY.value = withTiming(0, { duration: 250 });
    backdropOpacity.value = withTiming(1, { duration: 250 });
  }

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={dismiss}
      onShow={handleShow}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Animated.View
            style={backdropStyle}
            className="absolute inset-0 bg-black/50"
          >
            <Pressable
              onPress={dismiss}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              className="h-full w-full"
            />
          </Animated.View>
          <Animated.View
            style={sheetStyle}
            className="w-full rounded-t-3xl bg-base-100"
          >
            <SafeAreaView edges={["bottom"]}>
              <GestureDetector gesture={pan}>
                <View
                  accessible
                  accessibilityLabel="Arraste para baixo para fechar"
                  className="items-center px-6 pb-2 pt-3"
                >
                  <View className="h-1 w-12 rounded-full bg-base-300" />
                </View>
              </GestureDetector>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingTop: 12,
                  paddingBottom: 24,
                  gap: 20,
                }}
              >
                <View className="flex-row items-start gap-4">
                  {centerHeader ? <View className="h-8 w-8" /> : null}
                  <View className="flex-1">{header}</View>
                  <Pressable
                    onPress={dismiss}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar"
                    hitSlop={8}
                    className="h-8 w-8 items-end justify-start"
                  >
                    <XIcon size={24} color={colors.base500} weight="bold" />
                  </Pressable>
                </View>
                {typeof children === "function" ? children(dismiss) : children}
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
