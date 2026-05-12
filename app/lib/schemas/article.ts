import { z } from "zod";

export const articleSchema = z.object({
  title: z
    .string({ message: "O título é obrigatório." })
    .min(3, "O título deve ter no mínimo 3 caracteres."),
  summary: z
    .string({ message: "O resumo é obrigatório." })
    .min(10, "O resumo deve ter no mínimo 10 caracteres."),
  content: z
    .string({ message: "O conteúdo é obrigatório." })
    .min(20, "O conteúdo deve ter no mínimo 20 caracteres."),
  categories: z.array(z.string()).min(1, "Selecione pelo menos uma categoria."),
  imageCoverURL: z.url("Digite uma URL válida para a imagem de capa."),
});
