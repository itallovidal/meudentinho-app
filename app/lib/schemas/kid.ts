import { z } from "zod";

export const kidSchema = z.object({
  name: z
    .string({ message: "O nome é obrigatório." })
    .min(3, "O nome deve ter no mínimo 3 caracteres."),
  birthDate: z.string().min(1, "A data de nascimento é obrigatória."),
  gender: z.enum(["male", "female"], { message: "O gênero é obrigatório." }),
  prematureWeeks: z.string().default("0"),
});
