import type {
  Arch,
  Dentition,
  Quadrant,
  Side,
  ToothEvent,
  ToothEventType,
  ToothType,
} from "@/types/teeth";
import { eventDateKey, formatDatePtBR } from "@/lib/utils";
import type { MapToothState } from "@/lib/toothChronology";

const TOOTH_TYPE_LABELS: Record<ToothType, string> = {
  central_incisor: "Incisivo Central",
  lateral_incisor: "Incisivo Lateral",
  canine: "Canino",
  first_molar: "Primeiro Molar",
  second_molar: "Segundo Molar",
  first_premolar: "Primeiro Pré-molar",
  second_premolar: "Segundo Pré-molar",
  third_molar: "Terceiro Molar",
};

const TOOTH_EVENT_TYPE_LABELS: Record<ToothEventType, string> = {
  eruption: "Erupção",
  exfoliation: "Esfoliação",
};

const TOOTH_EVENT_VERBS: Record<ToothEventType, string> = {
  eruption: "Nasceu",
  exfoliation: "Caiu",
};

const DENTITION_LABELS: Record<Dentition, string> = {
  primary: "De leite",
  permanent: "Permanente",
};

const ARCH_LABELS: Record<Arch, string> = {
  upper: "Superior",
  lower: "Inferior",
};

const SIDE_LABELS: Record<Side, string> = {
  left: "Esquerdo",
  right: "Direito",
};

const QUADRANT_LABELS: Record<Quadrant, string> = {
  upper_right: "Superior Direito",
  upper_left: "Superior Esquerdo",
  lower_right: "Inferior Direito",
  lower_left: "Inferior Esquerdo",
};

export function toothTypeLabel(value: string): string {
  return TOOTH_TYPE_LABELS[value as ToothType] ?? value;
}

export function toothEventTypeLabel(value: string): string {
  return TOOTH_EVENT_TYPE_LABELS[value as ToothEventType] ?? value;
}

export function toothEventVerb(value: string): string {
  return TOOTH_EVENT_VERBS[value as ToothEventType] ?? value;
}

export function dentitionLabel(value: string): string {
  return DENTITION_LABELS[value as Dentition] ?? value;
}

export function archLabel(value: string): string {
  return ARCH_LABELS[value as Arch] ?? value;
}

export function sideLabel(value: string): string {
  return SIDE_LABELS[value as Side] ?? value;
}

export function quadrantLabel(value: string): string {
  return QUADRANT_LABELS[value as Quadrant] ?? value;
}

export interface ParsedToothId {
  toothType: ToothType;
  arch: Arch;
  side: Side;
  quadrant: Quadrant;
}

export function parseToothId(toothId: string | null): ParsedToothId | null {
  if (!toothId) {
    return null;
  }
  const parts = toothId.split("_");
  if (parts.length < 2) {
    return null;
  }
  let side: string | null = null;
  let typeParts: string[];
  if (parts.length > 2 && (parts[1] === "left" || parts[1] === "right")) {
    side = parts[1];
    typeParts = parts.slice(2);
  } else {
    typeParts = parts.slice(1);
  }
  const arch = parts[0];
  const toothType = typeParts.join("_");
  const quadrant = side ? `${arch}_${side}` : "";
  if (
    (arch !== "upper" && arch !== "lower") ||
    (side !== "left" && side !== "right") ||
    !(toothType in TOOTH_TYPE_LABELS) ||
    !(quadrant in QUADRANT_LABELS)
  ) {
    return null;
  }
  return {
    toothType: toothType as ToothType,
    arch: arch as Arch,
    side: side as Side,
    quadrant: quadrant as Quadrant,
  };
}

export function toothEventTitle(event: {
  toothType: string;
  arch: string;
  eventType: string;
  dentition: string;
}): string {
  const base = `${toothTypeLabel(event.toothType)} ${archLabel(event.arch)} ${toothEventVerb(event.eventType)}`;
  return `${base} (${dentitionLabel(event.dentition).toLowerCase()})`;
}

export function toothIdLabel(toothId: string | null): string {
  if (!toothId) {
    return "não selecionado";
  }
  const parsed = parseToothId(toothId);
  if (parsed) {
    return `${toothTypeLabel(parsed.toothType)} ${archLabel(parsed.arch)} ${sideLabel(parsed.side)}`;
  }
  const separator = toothId.indexOf("_");
  if (separator < 0) {
    return toothId;
  }
  const typeLabel =
    TOOTH_TYPE_LABELS[toothId.slice(separator + 1) as ToothType];
  const arch = ARCH_LABELS[toothId.slice(0, separator) as Arch];
  if (!typeLabel || !arch) {
    return toothId;
  }
  return `${typeLabel} ${arch}`;
}

export function toothAccessibilityLabel(params: {
  toothId: string;
  state: MapToothState | "eruptionWindow";
  event?: ToothEvent | null;
}): string {
  const name = toothIdLabel(params.toothId);
  const { state, event } = params;

  if (state === "unregistered") {
    return `${name}, sem registro`;
  }
  if (state === "eruptionWindow") {
    return `${name}, hora de nascer, ainda sem registro`;
  }

  const date = event ? formatDatePtBR(eventDateKey(event.occurrenceDate)) : null;
  const verb = event ? toothEventVerb(event.eventType).toLowerCase() : "";
  const dentition = event
    ? event.dentition === "permanent"
      ? "definitivo"
      : "de leite"
    : "";
  const occurred = date ? ` em ${date}` : "";
  return [name, dentition, `${verb}${occurred}`].filter(Boolean).join(", ");
}

export function toothEventName(event: {
  toothType: string;
  arch: string;
  side: string;
}): string {
  return `${toothTypeLabel(event.toothType)} ${archLabel(event.arch)} ${sideLabel(event.side)}`;
}

export function toothEventAccessibilityLabel(event: ToothEvent): string {
  const name = toothEventName(event);
  const verb = toothEventVerb(event.eventType).toLowerCase();
  const dentition = dentitionLabel(event.dentition).toLowerCase();
  const date = formatDatePtBR(eventDateKey(event.occurrenceDate));
  return `Editar ${name}, ${verb} (${dentition}), em ${date}`;
}
