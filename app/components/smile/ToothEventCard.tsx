import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import ToothSVG from "@/components/smile/teeth/ToothSVG";
import { FDI_TEETH } from "@/components/smile/teeth/fdiTeeth";
import {
  FDI_DECADE,
  FDI_UNIT,
  MILK_SYMBOL_DASH,
  TOOTH_STYLE,
  isMilkSymbol,
} from "@/components/smile/DentalMap";
import {
  archLabel,
  dentitionLabel,
  toothEventVerb,
  toothTypeLabel,
} from "@/lib/teethLabels";
import type { MapToothState } from "@/lib/toothChronology";
import { cn, parseLocalDate } from "@/lib/utils";
import type { ToothEvent } from "@/types/teeth";

type ToothEventCardTone = "light" | "muted";

type ToothEventCardProps = {
  event: ToothEvent;
  tone?: ToothEventCardTone;
  onPress?: (event: ToothEvent) => void;
};

function eventToothState(event: ToothEvent): MapToothState {
  if (event.eventType === "exfoliation") {
    return "fell";
  }
  return event.dentition === "permanent" ? "bornPermanent" : "bornMilk";
}

export function ToothEventCard({
  event,
  tone = "light",
  onPress,
}: ToothEventCardProps) {
  const state = eventToothState(event);
  const svg =
    FDI_TEETH[`${FDI_DECADE[event.quadrant]}${FDI_UNIT[event.toothType]}`];
  const style = TOOTH_STYLE[state];
  const date = parseLocalDate(event.occurrenceDate);
  const month = date
    ?.toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  const title = `${toothTypeLabel(event.toothType)} ${archLabel(event.arch)}`;
  const subtitle = `${toothEventVerb(event.eventType)} (${dentitionLabel(event.dentition).toLowerCase()})`;

  return (
    <Pressable
      onPress={() => onPress?.(event)}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Editar ${title}`}
      className={cn(
        "w-full flex-row items-center gap-4 rounded-2xl p-4 shadow-sm shadow-base-300",
        tone === "muted" ? "bg-base-200" : "bg-base-100",
      )}
    >
      {date && month ? (
        <View
          className={cn(
            "h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
            tone === "muted" ? "bg-base-100" : "bg-base-200",
          )}
        >
          <Text className="text-2xl font-bold leading-none text-primary-800">
            {String(date.getDate()).padStart(2, "0")}
          </Text>
          <Text className="mt-1 text-xs uppercase text-base-500">{month}</Text>
        </View>
      ) : null}
      <View className="flex-1 gap-1">
        <Text className="text-base font-bold text-primary-800">{title}</Text>
        <View className="flex-row items-center gap-2">
          {svg ? (
            <ToothSVG
              viewBox={svg.viewBox}
              contour={svg.contour}
              details={svg.details}
              fill={style.fill}
              stroke={style.stroke}
              strokeDasharray={
                isMilkSymbol(state) ? MILK_SYMBOL_DASH : undefined
              }
              width={20}
              height={20}
            />
          ) : null}
          <Text className="flex-1 text-sm text-base-500">{subtitle}</Text>
        </View>
        {event.note ? (
          <Text className="text-xs text-base-500" numberOfLines={2}>
            {event.note}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
