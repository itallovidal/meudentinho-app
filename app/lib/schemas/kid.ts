import { z } from "zod";
import { validateBirthDateKey } from "@/lib/utils";

export const kidSchema = z
  .object({
    name: z
      .string({ message: "O nome é obrigatório." })
      .min(3, "O nome deve ter no mínimo 3 caracteres."),
    birthDate: z.string().superRefine((value, context) => {
      const message = validateBirthDateKey(value);
      if (message) {
        context.addIssue({ code: "custom", message });
      }
    }),
    gender: z.enum(["male", "female"], {
      message: "Selecione o sexo do dependente.",
    }),
    isPremature: z.boolean().default(false),
    prematureWeeks: z.string().optional().default("0"),
    accepted: z
      .boolean({ message: "É necessário aceitar a Política de Privacidade." })
      .refine((value) => value === true, {
        message: "É necessário aceitar a Política de Privacidade.",
      }),
  })
  .superRefine((data, context) => {
    if (data.isPremature && !/^(2[0-9]|3[0-6])$/.test(data.prematureWeeks)) {
      context.addIssue({
        code: "custom",
        path: ["prematureWeeks"],
        message: "Selecione com quantas semanas de gestação a criança nasceu.",
      });
    }
  });

export const kidEditSchema = kidSchema.safeExtend({ accepted: z.boolean() });

export type KidFormValues = z.input<typeof kidSchema>;
