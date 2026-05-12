import { z } from "zod";

export const kidSchema = z.object({
  name: z
    .string({ message: "O nome é obrigatório." })
    .min(3, "O nome deve ter no mínimo 3 caracteres."),
  birthDate: z.string({ message: "A data de nascimento é obrigatória." }),
  gender: z.enum(["male", "female"], { message: "O gênero é obrigatório." }),
  isPremature: z.boolean({ message: "O campo prematuro é obrigatório." }),
  prematureWeeks: z
    .number()
    .min(1, "A quantidade de semanas deve ser no mínimo 1.")
    .max(42, "A quantidade de semanas deve ser no máximo 42.")
    .optional(),
});
