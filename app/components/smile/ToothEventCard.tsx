import { Pressable, View } from "react-native";
import { QuestionMarkIcon } from "phosphor-react-native";
import { Text } from "@/components/ui/text";
import { ToothSVG } from "@/components/smile/teeth/ToothSVG";
import {
  LEGEND_TOOTH,
  MILK_SYMBOL_DASH,
  TOOTH_STYLE,
  isMilkSymbol,
} from "@/components/smile/teeth/toothStyle";
import {
  archLabel,
  dentitionLabel,
  sideLabel,
  toothEventAccessibilityLabel,
  toothEventVerb,
  toothDentitionLabel,
} from "@/lib/teethLabels";
import type { MapToothState } from "@/lib/toothChronology";
import { THEME } from "@/lib/theme";
import { cn, eventDateKey, parseLocalDate } from "@/lib/utils";
import type { ToothEvent } from "@/types/teeth";

type ToothEventCardTone = "light" | "muted";

type ToothEventCardSize = "default" | "small";

type ToothEventCardProps = {
  event: ToothEvent;
  tone?: ToothEventCardTone;
  size?: ToothEventCardSize;
  onPress?: (event: ToothEvent) => void;
};

export function eventToothState(event: ToothEvent): MapToothState {
  if (event.eventType === "exfoliation") {
    return "fell";
  }
  return event.dentition === "permanent" ? "bornPermanent" : "bornMilk";
}

export function ToothEventCard({
  event,
  tone = "light",
  size = "default",
  onPress,
}: ToothEventCardProps) {
  const state = eventToothState(event);
  const style = TOOTH_STYLE[state];
  const date = parseLocalDate(eventDateKey(event.occurrenceDate));
  const month = date
    ?.toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  const title = toothDentitionLabel(event.toothType, event.dentition);
  const position = `${archLabel(event.arch)} • ${sideLabel(event.side)}`;
  const subtitle = `${toothEventVerb(event.eventType)} (${dentitionLabel(event.dentition).toLowerCase()})`;

  return (
    <Pressable
      onPress={() => onPress?.(event)}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={toothEventAccessibilityLabel(event)}
      className={cn(
        "w-full flex-row items-center shadow-sm shadow-base-300",
        size === "small" ? "gap-3 rounded-xl p-3" : "gap-4 rounded-2xl p-4",
        tone === "muted" ? "bg-base-200" : "bg-base-100",
      )}
    >
      <View
        className={cn(
          "shrink-0 items-center justify-center",
          size === "small" ? "h-12 w-12 rounded-xl" : "h-16 w-16 rounded-2xl",
          tone === "muted" ? "bg-base-100" : "bg-base-200",
        )}
      >
        {date && month ? (
          <>
            <Text
              className={cn(
                "font-bold leading-none text-primary-800",
                size === "small" ? "text-lg" : "text-2xl",
              )}
            >
              {String(date.getDate()).padStart(2, "0")}
            </Text>
            <Text className="mt-1 text-xs uppercase text-muted-foreground">
              {month}
            </Text>
          </>
        ) : (
          <QuestionMarkIcon
            size={size === "small" ? 24 : 32}
            color={THEME.light.primary800}
            weight="bold"
          />
        )}
      </View>
      <View className="flex-1 gap-1">
        <Text
          className={cn(
            "font-bold text-primary-800",
            size === "small" ? "text-sm" : "text-base",
          )}
        >
          {title}
        </Text>
        <Text className="text-xs text-muted-foreground">{position}</Text>
        <View className="flex-row items-center gap-2">
          <ToothSVG
            viewBox={LEGEND_TOOTH.viewBox}
            contour={LEGEND_TOOTH.contour}
            details={LEGEND_TOOTH.details}
            fill={style.fill}
            stroke={style.stroke}
            strokeDasharray={isMilkSymbol(state) ? MILK_SYMBOL_DASH : undefined}
            width={size === "small" ? 16 : 22}
            height={size === "small" ? 16 : 22}
          />
          <Text
            className={cn(
              "flex-1 text-muted-foreground",
              size === "small" ? "text-xs" : "text-sm",
            )}
          >
            {subtitle}
          </Text>
        </View>
        {event.note ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={2}>
            {event.note}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
