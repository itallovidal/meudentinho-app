import { z } from "zod";
import { isArticleImageUrl } from "@/lib/articleUrls";

export const articleSchema = z.object({
  title: z
    .string({ message: "O título é obrigatório." })
    .trim()
    .min(3, "O título deve ter no mínimo 3 caracteres."),
  summary: z
    .string({ message: "O resumo é obrigatório." })
    .trim()
    .min(10, "O resumo deve ter no mínimo 10 caracteres."),
  content: z
    .string({ message: "O conteúdo é obrigatório." })
    .trim()
    .min(20, "O conteúdo deve ter no mínimo 20 caracteres."),
  categories: z
    .array(z.string().trim().min(1, "Selecione uma categoria válida."))
    .length(1, "Selecione exatamente uma categoria."),
  imageCoverURL: z
    .string()
    .trim()
    .refine(
      isArticleImageUrl,
      "Use um link de imagem HTTPS com um domínio válido.",
    ),
});
