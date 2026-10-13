import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CaretDownIcon, CheckIcon, XIcon } from "phosphor-react-native";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

type PrematureWeeksSelectorProps = {
  value?: string;
  onChange: (weeks: string) => void;
  error?: string;
};

const WEEKS_OPTIONS = Array.from({ length: 17 }, (_, index) =>
  String(20 + index),
);
const MIDDLE_INDEX = Math.floor(WEEKS_OPTIONS.length / 2);
const SHEET_PADDING = 24;
const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;
const CARD_GAP = 12;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const SNAP_OFFSETS = WEEKS_OPTIONS.map((_, index) => index * CARD_STEP);

export function PrematureWeeksSelector({
  value,
  onChange,
  error,
}: PrematureWeeksSelectorProps) {
  const colors = THEME.light;
  const { width: screenWidth } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | undefined>(value);
  const scrollRef = useRef<ScrollView>(null);

  function openSheet() {
    setDraft(value);
    setOpen(true);
  }

  function closeSheet() {
    setOpen(false);
  }

  function centeredIndex() {
    const selectedIndex = draft ? WEEKS_OPTIONS.indexOf(draft) : -1;
    return selectedIndex >= 0 ? selectedIndex : MIDDLE_INDEX;
  }

  function handleContentSizeChange() {
    scrollRef.current?.scrollTo({
      x: centeredIndex() * CARD_STEP,
      y: 0,
      animated: false,
    });
  }

  function chooseWeeks(index: number) {
    setDraft(WEEKS_OPTIONS[index]);
    scrollRef.current?.scrollTo({ x: index * CARD_STEP, y: 0, animated: true });
  }

  function confirmChoice() {
    if (!draft) {
      return;
    }
    onChange(draft);
    closeSheet();
  }

  const sidePadding = (screenWidth - CARD_WIDTH) / 2;

  return (
    <Wrapper direction="column" className="w-full" gap="gap-2">
      <Text>Com quantas semanas de gestação a criança nasceu?</Text>

      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel="Escolher semanas de gestação"
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="h-14 w-full flex-row items-center justify-between rounded-xl bg-base-200 px-4"
      >
        <Text
          className={
            value ? "text-base text-base-900" : "text-base text-base-400"
          }
        >
          {value ? `${value} semanas` : "Selecione"}
        </Text>
        <CaretDownIcon size={20} color={colors.base600} weight="regular" />
      </Pressable>

      <Text className="text-sm text-base-500">
        Preencha apenas se souber informar.
      </Text>

      {error ? (
        <Text className="text-destructive" variant="small">
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closeSheet}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable
            onPress={closeSheet}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            className="absolute inset-0"
          />
          <SafeAreaView
            edges={["bottom"]}
            className="w-full rounded-t-3xl bg-base-100"
          >
            <View
              style={{
                paddingHorizontal: SHEET_PADDING,
                paddingTop: 16,
                paddingBottom: 24,
              }}
            >
              <View className="mb-6 h-1 w-12 self-center rounded-full bg-base-300" />

              <View className="flex-row items-start">
                <View className="h-10 w-10" />
                <View className="flex-1 px-2">
                  <Text className="text-center text-xl font-bold text-base-900">
                    Semanas de gestação
                  </Text>
                  <Text className="mt-3 text-center text-base leading-6 text-base-500">
                    Selecione com quantas semanas a criança nasceu.
                  </Text>
                </View>
                <Pressable
                  onPress={closeSheet}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar"
                  hitSlop={8}
                  className="h-10 w-10 items-end justify-start"
                >
                  <XIcon size={24} color={colors.base500} weight="bold" />
                </Pressable>
              </View>

              <ScrollView
                ref={scrollRef}
                horizontal
                onContentSizeChange={handleContentSizeChange}
                snapToOffsets={SNAP_OFFSETS}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -SHEET_PADDING, marginVertical: 32 }}
                contentContainerStyle={{
                  paddingHorizontal: sidePadding,
                  paddingVertical: 12,
                  gap: CARD_GAP,
                }}
              >
                {WEEKS_OPTIONS.map((weeks, index) => {
                  const isSelected = weeks === draft;
                  const isLast = index === WEEKS_OPTIONS.length - 1;
                  return (
                    <Pressable
                      key={weeks}
                      onPress={() => chooseWeeks(index)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${weeks} semanas`}
                      style={({ pressed }) => ({
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        flexGrow: 0,
                        flexShrink: 0,
                        marginRight: isLast ? 0 : CARD_GAP,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      })}
                      className={cn(
                        "items-center justify-center rounded-2xl p-5",
                        isSelected ? "bg-primary-500" : "bg-base-200",
                      )}
                    >
                      {isSelected ? (
                        <View className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-base-100 shadow-sm shadow-base-400">
                          <CheckIcon
                            size={14}
                            color={colors.primary500}
                            weight="bold"
                          />
                        </View>
                      ) : null}
                      <Text
                        className={cn(
                          "text-4xl font-bold",
                          isSelected ? "text-base-100" : "text-base-400",
                        )}
                      >
                        {weeks}
                      </Text>
                      <Text
                        className={cn(
                          "mt-1 text-base font-medium",
                          isSelected ? "text-base-100" : "text-base-400",
                        )}
                      >
                        semanas
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Button
                onPress={confirmChoice}
                disabled={!draft}
                className="h-14 w-full rounded-full"
              >
                <Text>Confirmar</Text>
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </Wrapper>
  );
}
