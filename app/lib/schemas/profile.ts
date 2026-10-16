import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Digite um email válido."),
  password: z
    .string({ message: "A senha é obrigatória." })
    .min(8, "A senha deve ter no mínimo 8 caracteres."),
});

export const signupSchema = z
  .object({
    name: z
      .string({ message: "O nome é obrigatório." })
      .min(3, "O nome deve ter no mínimo 3 caracteres."),
    email: z.email("Digite um email válido."),
    password: z
      .string({ message: "A senha é obrigatória." })
      .min(8, "A senha deve ter no mínimo 8 caracteres."),
    passwordConfirmation: z
      .string({ message: "A confirmação de senha é obrigatória." })
      .min(8, "A confirmação de senha deve ter no mínimo 8 caracteres."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não conferem.",
    path: ["passwordConfirmation"],
  });
