import { z } from "zod";
import { isAdultBirthDate } from "@/lib/utils";

export const loginSchema = z.object({
  email: z.email("Digite um email válido."),
  password: z
    .string({ message: "A senha é obrigatória." })
    .min(6, "A senha deve ter no mínimo 6 caracteres."),
});

export const signupSchema = z
  .object({
    name: z
      .string({ message: "O nome é obrigatório." })
      .min(3, "O nome deve ter no mínimo 3 caracteres."),
    email: z.email("Digite um email válido."),
    password: z
      .string({ message: "A senha é obrigatória." })
      .min(6, "A senha deve ter no mínimo 6 caracteres."),
    passwordConfirmation: z
      .string({ message: "A confirmação de senha é obrigatória." })
      .min(6, "A confirmação de senha deve ter no mínimo 6 caracteres."),
    accepted: z
      .boolean({ message: "É necessário aceitar a Política de Privacidade." })
      .refine((value) => value === true, {
        message: "É necessário aceitar a Política de Privacidade.",
      }),
    guardianBirthDate: z
      .string({ message: "Informe sua data de nascimento." })
      .min(1, "Informe sua data de nascimento.")
      .refine(isAdultBirthDate, "É necessário ter 18 anos ou mais."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não conferem.",
    path: ["passwordConfirmation"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
