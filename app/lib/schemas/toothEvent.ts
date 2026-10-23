import { isToothEventDateUnknown } from "@/lib/toothIdentity";
import { z } from "zod";
import { eventDateKey } from "@/lib/utils";
import { TOOTH_TYPES } from "@/lib/toothMilestones";

export const toothEventSchema = z
  .object({
    id: z.string().min(1),
    kidId: z.string().min(1),
    parentId: z.string().min(1),
    arch: z.enum(["upper", "lower"]),
    side: z.enum(["left", "right"]),
    quadrant: z.enum([
      "upper_right",
      "upper_left",
      "lower_right",
      "lower_left",
    ]),
    toothType: z.enum(TOOTH_TYPES),
    dentition: z.enum(["primary", "permanent"]),
    eventType: z.enum(["eruption", "exfoliation"]),
    recordKind: z.enum(["dated", "presence", "undated"]).optional(),
    occurrenceDate: z.string(),
    historyIncomplete: z.boolean().optional(),
    confirmedAt: z.string().optional(),
    note: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .superRefine((event, context) => {
    if (`${event.arch}_${event.side}` !== event.quadrant)
      context.addIssue({
        code: "custom",
        message: "Posição do dente inconsistente.",
      });
    if (isToothEventDateUnknown(event)) {
      if (
        (event.recordKind === "presence" && event.eventType !== "eruption") ||
        event.occurrenceDate !== "" ||
        !event.confirmedAt ||
        !Number.isFinite(Date.parse(event.confirmedAt))
      )
        context.addIssue({
          code: "custom",
          message: "Registro sem data inválido.",
        });
    } else if (
      !eventDateKey(event.occurrenceDate) ||
      !Number.isFinite(Date.parse(event.occurrenceDate))
    ) {
      context.addIssue({
        code: "custom",
        message: "Registro datado sem data válida.",
      });
    }
  });
