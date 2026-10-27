export type Dentition = "primary" | "permanent";

export type Arch = "upper" | "lower";
export type Side = "left" | "right";

export type Quadrant =
  "upper_right" | "upper_left" | "lower_right" | "lower_left";

export type ToothType =
  | "central_incisor"
  | "lateral_incisor"
  | "canine"
  | "first_molar"
  | "second_molar"
  | "first_premolar"
  | "second_premolar"
  | "third_molar";

export type ToothEventType = "eruption" | "exfoliation";

export interface ToothEvent {
  recordKind?: "dated" | "presence" | "undated";
  historyIncomplete?: boolean;
  confirmedAt?: string;
  id: string;
  parentId: string;
  kidId: string;
  occurrenceDate: string;
  dentition: Dentition;
  arch: Arch;
  side: Side;
  toothType: ToothType;
  eventType: ToothEventType;
  quadrant: Quadrant;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ToothEventRequestDTO {
  recordKind?: "dated" | "presence" | "undated";
  historyIncomplete?: boolean;
  kidId: string;
  occurrenceDate: string;
  dentition: Dentition;
  arch: Arch;
  side: Side;
  toothType: ToothType;
  eventType: ToothEventType;
  quadrant: Quadrant;
  note?: string;
}

export type ToothPredictionStatus = "current" | "tolerance" | "upcoming";

export interface ToothPrediction {
  id: string;
  toothType: ToothType;
  arch: Arch;
  dentition: Dentition;
  title: string;
  sides: Side[];
  pendingSides: number;
  status: ToothPredictionStatus;
  windowStart: string;
  windowEnd: string;
  limitDate: string | null;
}

export interface TeethExchangeStats {
  totalMilkTeeth: number;
  exchanged: number;
}
