import { z } from "zod";
import { parseLocalDate } from "@/lib/utils";

function isRealDate(value: string): boolean {
  if (!value) {
    // Deixa o `min(1)` abaixo reportar "obrigatória".
    return true;
  }
  const date = parseLocalDate(value.split("T")[0]);
  return date !== null;
}

function isNotFutureDate(value: string): boolean {
  if (!value) {
    return true;
  }
  const date = parseLocalDate(value.split("T")[0]);
  if (!date) {
    // Deixa a regra de formato reportar "data válida".
    return true;
  }
  const today = new Date();
  const startOfTomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );
  return date.getTime() < startOfTomorrow.getTime();
}

export const kidSchema = z.object({
  name: z
    .string({ message: "O nome é obrigatório." })
    .min(3, "O nome deve ter no mínimo 3 caracteres."),
  birthDate: z
    .string()
    .min(1, "A data de nascimento é obrigatória.")
    .refine(isRealDate, "Digite uma data válida.")
    .refine(isNotFutureDate, "A data não pode ser futura."),
  gender: z.enum(["male", "female"], { message: "O gênero é obrigatório." }),
  // `undefined` = "não prematuro / desmarcado" (o form faz
  // `setValue("prematureWeeks", undefined)` ao desmarcar). O default "0"
  // mantém o contrato com a API.
  prematureWeeks: z.string().optional().default("0"),
});
