import type { ComponentRef, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { XIcon } from "phosphor-react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { THEME } from "@/lib/theme";
import { PopoverPortalContext } from "@/contexts/PopoverPortalContext";

const colors = THEME.light;

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 700;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  header: ReactNode;
  children: ReactNode | ((dismiss: () => void) => ReactNode);
  centerHeader?: boolean;
  portalHostName?: string;
};

export function BottomSheet({
  visible,
  onClose,
  onDismiss,
  header,
  children,
  centerHeader = false,
  portalHostName,
}: BottomSheetProps) {
  const { height: offscreenOffset } = useWindowDimensions();
  const translateY = useSharedValue(offscreenOffset);
  const backdropOpacity = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const canDrag = useSharedValue(false);
  const [mounted, setMounted] = useState(false);
  const [popoverContainer, setPopoverContainer] = useState<HTMLElement | null>(
    null,
  );
  const capturePopoverContainer = useCallback(
    (node: ComponentRef<typeof View> | null) => {
      if (Platform.OS === "web") {
        setPopoverContainer(node as unknown as HTMLElement | null);
      }
    },
    [],
  );
  const mountedRef = useRef(false);
  const hasPresentedRef = useRef(false);
  const dismissPendingRef = useRef(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  function handleDismissed() {
    if (!dismissPendingRef.current) return;
    dismissPendingRef.current = false;
    onDismissRef.current?.();
  }

  useEffect(() => {
    if (!mounted && Platform.OS !== "ios") {
      handleDismissed();
    }
  }, [mounted]);

  function animateOut(onHidden: () => void) {
    translateY.value = withTiming(
      offscreenOffset,
      { duration: 200 },
      (finished) => {
        if (finished) {
          translateY.value = offscreenOffset;
          backdropOpacity.value = 0;
          runOnJS(onHidden)();
        }
      },
    );
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }

  function unmountSheet() {
    dismissPendingRef.current = true;
    mountedRef.current = false;
    setMounted(false);
  }

  function dismiss() {
    animateOut(() => {
      unmountSheet();
      onClose();
    });
  }

  function handleShow() {
    scrollOffset.value = 0;
    translateY.value = offscreenOffset;
    backdropOpacity.value = 0;
    translateY.value = withTiming(0, { duration: 250 });
    backdropOpacity.value = withTiming(1, { duration: 250 });
  }

  useEffect(() => {
    if (visible) {
      if (mountedRef.current) {
        handleShow();
      } else {
        hasPresentedRef.current = true;
        mountedRef.current = true;
        setMounted(true);
      }
      return;
    }
    if (mountedRef.current) {
      animateOut(unmountSheet);
    }
  }, [visible]);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.value = Math.max(0, event.contentOffset.y);
  });

  function createDismissGesture(scrollable: boolean) {
    return Gesture.Pan()
      .activeOffsetY(10)
      .failOffsetY(-10)
      .onStart(() => {
        canDrag.value = !scrollable || scrollOffset.value <= 0;
      })
      .onUpdate((event) => {
        if (canDrag.value) {
          translateY.value = Math.max(0, event.translationY);
        }
      })
      .onEnd((event) => {
        if (!canDrag.value) return;
        const shouldDismiss =
          event.translationY > DISMISS_DISTANCE ||
          event.velocityY > DISMISS_VELOCITY;
        if (shouldDismiss) {
          runOnJS(dismiss)();
        } else {
          translateY.value = withSpring(0);
        }
      })
      .onFinalize((_event, success) => {
        if (!success && canDrag.value) {
          translateY.value = withSpring(0);
        }
      });
  }

  const pan = createDismissGesture(false);
  const contentPan = Gesture.Simultaneous(
    createDismissGesture(true),
    Gesture.Native(),
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted && !hasPresentedRef.current) {
    return null;
  }

  const sheetHeader = (
    <View className="flex-row items-start gap-4">
      {centerHeader ? <View className="h-8 w-8" /> : null}
      <View className="flex-1">{header}</View>
      <Pressable
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        hitSlop={8}
      >
        <XIcon size={24} color={colors.base500} weight="bold" />
      </Pressable>
    </View>
  );

  return (
    <PopoverPortalContext.Provider value={popoverContainer}>
      <Modal
        visible={mounted}
        onDismiss={handleDismissed}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={dismiss}
        onShow={handleShow}
      >
        {mounted ? (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View ref={capturePopoverContainer} className="flex-1 justify-end">
              <Animated.View
                testID="bottom-sheet-backdrop"
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
                testID="bottom-sheet-surface"
                style={[sheetStyle, { maxHeight: "90%" }]}
                className="w-full rounded-t-3xl bg-base-100 web:max-w-2xl web:self-center"
              >
                <SafeAreaView edges={["bottom"]} className="shrink">
                  <GestureDetector gesture={pan}>
                    <View
                      accessible
                      accessibilityLabel="Arraste para baixo para fechar"
                      className="items-center px-6 pb-2 pt-3"
                    >
                      <View className="h-1 w-12 rounded-full bg-base-300" />
                    </View>
                  </GestureDetector>
                  <GestureDetector gesture={contentPan}>
                    <Animated.ScrollView
                      className="shrink"
                      onScroll={handleScroll}
                      scrollEventThrottle={16}
                      bounces={false}
                      overScrollMode="never"
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingTop: 12,
                        paddingBottom: 24,
                        gap: 20,
                      }}
                    >
                      {sheetHeader}
                      {typeof children === "function"
                        ? children(dismiss)
                        : children}
                    </Animated.ScrollView>
                  </GestureDetector>
                </SafeAreaView>
              </Animated.View>
              {portalHostName && (
                <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                  <PortalHost name={portalHostName} />
                </View>
              )}
            </View>
          </GestureHandlerRootView>
        ) : null}
      </Modal>
    </PopoverPortalContext.Provider>
  );
}
