import { z } from "zod";
import { parseLocalDate } from "@/lib/utils";

export const toothEventFormSchema = z
  .object({
    eventType: z.enum(["eruption", "exfoliation"]),
    dentition: z.enum(["primary", "permanent"]),
    note: z
      .string()
      .max(500, "A observação deve ter no máximo 500 caracteres."),
    date: z.string(),
    dateUnknown: z.boolean(),
    historyIncomplete: z.boolean(),
  })
  .superRefine((values, context) => {
    if (!values.dateUnknown && !parseLocalDate(values.date))
      context.addIssue({
        code: "custom",
        path: ["date"],
        message: "Informe uma data válida.",
      });
  });

export type ToothEventFormValues = z.infer<typeof toothEventFormSchema>;
