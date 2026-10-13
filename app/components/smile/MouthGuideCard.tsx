import React from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, Rect } from "react-native-svg";
import { ToothIcon } from "phosphor-react-native";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";

type MouthGuideCardProps = {
  kidName?: string | null;
};

const GUIDE_COLORS = {
  frontFill: "#A9D6F0",
  frontStroke: "#4A90C2",
  tipFill: "#FBD67E",
  tipStroke: "#D19A2B",
  backFill: "#FFFFFF",
  backStroke: "#9AA5B1",
};

function OpenMouthIllustration() {
  // Boca aberta estilizada: rosto + fileira de dentinhos coloridos por função
  const upper: { fill: string; stroke: string }[] = [
    { fill: "#FFFFFF", stroke: GUIDE_COLORS.backStroke },
    { fill: "#FFFFFF", stroke: GUIDE_COLORS.backStroke },
    { fill: GUIDE_COLORS.tipFill, stroke: GUIDE_COLORS.tipStroke },
    { fill: GUIDE_COLORS.frontFill, stroke: GUIDE_COLORS.frontStroke },
    { fill: GUIDE_COLORS.frontFill, stroke: GUIDE_COLORS.frontStroke },
    { fill: GUIDE_COLORS.tipFill, stroke: GUIDE_COLORS.tipStroke },
    { fill: "#FFFFFF", stroke: GUIDE_COLORS.backStroke },
    { fill: "#FFFFFF", stroke: GUIDE_COLORS.backStroke },
  ];
  const lower: { fill: string; stroke: string }[] = [
    { fill: "#FFFFFF", stroke: GUIDE_COLORS.backStroke },
    { fill: GUIDE_COLORS.frontFill, stroke: GUIDE_COLORS.frontStroke },
    { fill: GUIDE_COLORS.frontFill, stroke: GUIDE_COLORS.frontStroke },
    { fill: GUIDE_COLORS.tipFill, stroke: GUIDE_COLORS.tipStroke },
    { fill: "#FFFFFF", stroke: GUIDE_COLORS.backStroke },
  ];

  return (
    <Svg width={148} height={148} viewBox="0 0 148 148">
      {/* rosto */}
      <Circle cx={74} cy={74} r={68} fill="#FFDDBE" />
      {/* boca aberta */}
      <Ellipse
        cx={74}
        cy={82}
        rx={50}
        ry={40}
        fill="#7B2D2D"
        stroke="#5A1F1F"
        strokeWidth={2.5}
      />
      {/* língua */}
      <Ellipse cx={74} cy={106} rx={24} ry={13} fill="#EE7B7B" />
      {/* dentes superiores */}
      {upper.map((t, i) => (
        <Rect
          key={`u-${i}`}
          x={74 - (upper.length * 13) / 2 + i * 13}
          y={52}
          width={12}
          height={15}
          rx={4}
          fill={t.fill}
          stroke={t.stroke}
          strokeWidth={1.6}
        />
      ))}
      {/* dentes inferiores */}
      {lower.map((t, i) => (
        <Rect
          key={`l-${i}`}
          x={74 - (lower.length * 13) / 2 + i * 13}
          y={100}
          width={12}
          height={13}
          rx={4}
          fill={t.fill}
          stroke={t.stroke}
          strokeWidth={1.6}
        />
      ))}
    </Svg>
  );
}

const LEFT_LABELS = [
  { title: "Dentes da Frente", sub: "(Incisivos)" },
  { title: "Pontas / Caninos", sub: "" },
  { title: "Dentes de Trás", sub: "(Molares)" },
];

const RIGHT_LEGEND = [
  {
    label: "Frente",
    sub: "(Corta)",
    color: GUIDE_COLORS.frontFill,
    stroke: GUIDE_COLORS.frontStroke,
  },
  {
    label: "Pontas",
    sub: "(Rasga)",
    color: GUIDE_COLORS.tipFill,
    stroke: GUIDE_COLORS.tipStroke,
  },
  {
    label: "Fundo",
    sub: "(Amassa)",
    color: GUIDE_COLORS.backFill,
    stroke: GUIDE_COLORS.backStroke,
  },
];

export function MouthGuideCard({ kidName }: MouthGuideCardProps) {
  const name = kidName?.trim() ? kidName : "seu pequeno";
  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      gap="gap-3"
      className="w-full rounded-3xl bg-base-100 p-5 shadow-sm shadow-base-300"
    >
      <Text variant="h4" className="text-primary-500">
        {`Como identificar na boca do ${name}?`}
      </Text>

      <Wrapper
        direction="row"
        align="center"
        justify="between"
        className="w-full"
      >
        {/* rótulos da esquerda */}
        <View className="w-[86px] gap-4">
          {LEFT_LABELS.map((item) => (
            <View key={item.title}>
              <Text className="text-[11px] leading-4 text-primary-500">
                {item.title}
              </Text>
              {item.sub ? (
                <Text className="text-[11px] leading-4 text-primary-500">
                  {item.sub}
                </Text>
              ) : null}
              <Text className="text-sm font-bold text-primary-500">→</Text>
            </View>
          ))}
        </View>

        <OpenMouthIllustration />

        {/* legenda da direita */}
        <View className="w-[76px] gap-3">
          {RIGHT_LEGEND.map((item) => (
            <View key={item.label} className="flex-row items-center gap-1.5">
              <ToothIcon
                size={24}
                color={item.stroke}
                weight="fill"
              />
              <View
                style={{
                  position: "absolute",
                  left: 5,
                  top: 6,
                  width: 14,
                  height: 11,
                  borderRadius: 3,
                  backgroundColor: item.color,
                }}
              />
              <View>
                <Text className="text-[11px] font-semibold leading-4 text-primary-500">
                  {item.label}
                </Text>
                <Text className="text-[11px] leading-4 text-base-500">
                  {item.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Wrapper>

      <Text className="text-xs leading-5 text-base-500">
        Toque em um dentinho do mapa para registrar quando ele nascer. Azul =
        da frente, amarelo = pontinhas, branquinho = do fundo.
      </Text>
    </Wrapper>
  );
}

export default MouthGuideCard;
