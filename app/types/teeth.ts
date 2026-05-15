export type Dentition = 'primary' | 'permanent';

export type Arch = 'upper' | 'lower';
export type Side = 'left' | 'right';

export type Quadrant =
  | 'upper_right'
  | 'upper_left'
  | 'lower_right'
  | 'lower_left';

export type ToothType =
  | 'central_incisor'
  | 'lateral_incisor'
  | 'canine'
  | 'first_molar'
  | 'second_molar'
  | 'first_premolar'
  | 'second_premolar'
  | 'third_molar';

export type ToothEventType =
  | 'eruption'
  | 'exfoliation';

export interface ToothEvent {
  id: string;
  occurrenceDate: string; // ISO
  dentition: Dentition;
  arch: Arch;
  side: Side;
  toothType: ToothType;
  eventType: ToothEventType;
  note?: string;
}

export interface ToothPrediction {
  id: string;
  toothType: ToothType;
  expectedDate: string; // ISO
  title: string;
}

export interface TeethExchangeStats {
  totalMilkTeeth: number;
  exchanged: number;
}
