import {
  buildToothMilestones,
  getEruptionPositions,
} from "@/lib/toothMilestones";
import { toothState, type ChronologyGender } from "@/lib/toothChronology";
import type { Arch, Side, ToothEvent, ToothType } from "@/types/teeth";

const ARCHES: Arch[] = ["upper", "lower"];
const SIDES: Side[] = ["right", "left"];
const TOOTH_TYPES: ToothType[] = [
  "central_incisor",
  "lateral_incisor",
  "canine",
  "first_premolar",
  "second_premolar",
  "first_molar",
  "second_molar",
  "third_molar",
];

export interface SmileSummary {
  bornPermanent: number;
  bornMilk: number;
  fell: number;
  eruptionWindow: number;
  registered: number;
}

export function buildSmileSummary(
  birthDate: string | null,
  events: ToothEvent[],
  gender: ChronologyGender | null = null,
  referenceDate: Date = new Date(),
): SmileSummary {
  const summary: SmileSummary = {
    bornPermanent: 0,
    bornMilk: 0,
    fell: 0,
    eruptionWindow: 0,
    registered: 0,
  };
  summary.eruptionWindow = getEruptionPositions(
    buildToothMilestones({
      kidId: "",
      birthDate,
      events,
      gender,
      referenceDate,
    }),
  ).size;

  for (const arch of ARCHES) {
    for (const side of SIDES) {
      for (const toothType of TOOTH_TYPES) {
        const state = toothState({ toothType, arch, side }, events);
        if (state === "unregistered") {
          continue;
        }
        summary.registered += 1;
        if (state === "bornMilk") {
          summary.bornMilk += 1;
        } else if (state === "bornPermanent") {
          summary.bornPermanent += 1;
        } else {
          summary.fell += 1;
        }
      }
    }
  }

  return summary;
}
