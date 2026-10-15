import { FDI_TEETH } from "@/components/smile/teeth/fdiTeeth";
import type { MapToothState } from "@/lib/toothChronology";

export type ToothMapStateKey = MapToothState | "eruptionWindow";

export const TOOTH_STYLE: Record<
  ToothMapStateKey,
  { fill: string; stroke: string }
> = {
  unregistered: { fill: "#E2E8F0", stroke: "#475569" },
  bornMilk: { fill: "#7DD3FC", stroke: "#0C4A6E" },
  bornPermanent: { fill: "#34D399", stroke: "#065F46" },
  fell: { fill: "#FCA5A5", stroke: "#7F1D1D" },
  eruptionWindow: { fill: "#FDE047", stroke: "#854D0E" },
};

export const MILK_SYMBOL_DASH = "3 2";

export function isMilkSymbol(key: ToothMapStateKey): boolean {
  return key === "bornMilk" || key === "fell";
}

export const LEGEND: {
  key: ToothMapStateKey;
  label: string;
  description: string;
}[] = [
  {
    key: "unregistered",
    label: "Sem registro",
    description: "Ainda não foi informado",
  },
  {
    key: "eruptionWindow",
    label: "Hora de nascer",
    description: "Período esperado, ainda sem registro",
  },
  {
    key: "bornMilk",
    label: "Nasceu (de leite)",
    description: "Dente de leite que surgiu",
  },
  {
    key: "bornPermanent",
    label: "Nasceu (definitivo)",
    description: "Dente permanente que surgiu",
  },
  {
    key: "fell",
    label: "Caiu",
    description: "Dente de leite que foi trocado",
  },
];

export const LEGEND_TOOTH = FDI_TEETH["11"];
