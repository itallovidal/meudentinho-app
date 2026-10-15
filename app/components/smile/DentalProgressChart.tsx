import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ToothIcon } from "phosphor-react-native";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";

type DentalProgressTone = "milk" | "permanent";

type DentalProgressItem = {
  label: string;
  value: number;
  total: number;
  tone: DentalProgressTone;
};

type DentalProgressChartProps = {
  title: string;
  description: string;
  items: DentalProgressItem[];
};

const TONES: Record<DentalProgressTone, { color: string; track: string }> = {
  milk: { color: "#FFB86B", track: "#FFF1E3" },
  permanent: { color: "#6CB4EE", track: "#E6F2FC" },
};

const RING_SIZE = 124;
const RING_STROKE = 14;

function ProgressRing({
  value,
  total,
  tone,
}: {
  value: number;
  total: number;
  tone: DentalProgressTone;
}) {
  const { color, track } = TONES[tone];
  const percent = total > 0 ? Math.min(value / total, 1) : 0;
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View
      style={{ width: RING_SIZE, height: RING_SIZE }}
      className="items-center justify-center"
    >
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={track}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - percent)}
          rotation={-90}
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          fill="none"
        />
      </Svg>
      <View className="absolute items-center">
        <ToothIcon size={20} color={color} weight="fill" />
        <Text className="text-lg font-bold text-primary-800">
          {`${Math.round(percent * 100)}%`}
        </Text>
        <Text className="text-xs text-base-500">{`${value} de ${total}`}</Text>
      </View>
    </View>
  );
}

export default function DentalProgressChart({
  title,
  description,
  items,
}: DentalProgressChartProps) {
  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      gap="gap-4"
      className="w-full rounded-3xl bg-base-100 px-5 py-6 shadow-sm shadow-base-300"
    >
      <Text variant="h4" className="text-center text-primary-800">
        {title}
      </Text>
      <Text className="px-2 text-center text-sm leading-5 text-base-500">
        {description}
      </Text>

      <Wrapper
        direction="row"
        align="start"
        justify="center"
        gap="gap-8"
        className="w-full pt-2"
      >
        {items.map((item) => (
          <Wrapper
            key={item.label}
            direction="column"
            align="center"
            justify="start"
            gap="gap-3"
          >
            <ProgressRing
              value={item.value}
              total={item.total}
              tone={item.tone}
            />
            <Text className="text-sm font-semibold text-primary-800">
              {item.label}
            </Text>
          </Wrapper>
        ))}
      </Wrapper>
    </Wrapper>
  );
}
