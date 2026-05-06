import type { LoginDTO } from "@/types/dtos";
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "O email é obrigatório." })
    .trim()
    .email("Digite um email válido."),
  password: z
    .string({ message: "A senha é obrigatória." })
    .min(6, "A senha deve ter no mínimo 6 caracteres."),
});
