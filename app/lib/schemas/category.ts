import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ message: "O nome da categoria é obrigatório." })
    .trim()
    .min(1, "O nome da categoria é obrigatório."),
});

export type CategoryFormValues = z.input<typeof categorySchema>;
