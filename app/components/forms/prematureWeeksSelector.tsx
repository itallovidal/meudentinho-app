import { useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { CaretDownIcon, CheckIcon } from "phosphor-react-native";
import { Button } from "../ui/button";
import { BottomSheet } from "../ui/bottomSheet";
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
  const { width: containerWidth, onLayout } = useContainerWidth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | undefined>(value);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

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

  const sidePadding = Math.max(0, (containerWidth - CARD_WIDTH) / 2);

  return (
    <Wrapper direction="column" className="w-full" gap="gap-2">
      <Text>Com quantas semanas de gestação a criança nasceu?</Text>

      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel="Escolher semanas de gestação"
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        className="h-14 w-full flex-row items-center justify-between rounded-xl bg-base-200 px-4"
      >
        <Text
          className={
            value ? "text-base text-base-900" : "text-base text-muted-foreground"
          }
        >
          {value ? `${value} semanas` : "Selecione"}
        </Text>
        <CaretDownIcon size={20} color={colors.base600} weight="regular" />
      </Pressable>

      <Text className="text-sm text-muted-foreground">
        Informe as semanas de gestação para registrar a prematuridade.
      </Text>

      {error ? (
        <Text className="text-destructive" variant="small">
          {error}
        </Text>
      ) : null}

      <BottomSheet
        visible={open}
        onClose={closeSheet}
        centerHeader
        header={
          <>
            <Text className="text-center text-xl font-bold text-base-900">
              Semanas de gestação
            </Text>
            <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
              Selecione com quantas semanas a criança nasceu.
            </Text>
          </>
        }
      >
        <ScrollView
          ref={scrollRef}
          onLayout={onLayout}
          horizontal
          onContentSizeChange={handleContentSizeChange}
          snapToOffsets={SNAP_OFFSETS}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -SHEET_PADDING, marginVertical: 12 }}
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
                    isSelected ? "text-base-100" : "text-muted-foreground",
                  )}
                >
                  {weeks}
                </Text>
                <Text
                  className={cn(
                    "mt-1 text-base font-medium",
                    isSelected ? "text-base-100" : "text-muted-foreground",
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
      </BottomSheet>
    </Wrapper>
  );
}
