import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string({ message: "O nome é obrigatório." })
    .min(3, "O nome deve ter no mínimo 3 caracteres."),
  email: z
    .string({ message: "O email é obrigatório." })
    .email("Digite um email válido."),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string({ message: "A senha atual é obrigatória." })
      .min(6, "A senha deve ter no mínimo 6 caracteres."),
    newPassword: z
      .string({ message: "A nova senha é obrigatória." })
      .min(6, "A senha deve ter no mínimo 6 caracteres."),
    passwordConfirmation: z
      .string({ message: "A confirmação de senha é obrigatória." })
      .min(6, "A confirmação de senha deve ter no mínimo 6 caracteres."),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "As senhas não conferem.",
    path: ["passwordConfirmation"],
  });

export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>;
