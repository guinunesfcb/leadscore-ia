import { z } from "zod";

export const leadFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  empresa: z.string().optional().nullable(),
  segmento: z.string().optional().nullable(),
  mensagem: z.string().min(5, "Mensagem deve ter pelo menos 5 caracteres"),
  origem: z.string().default("site"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const aiAnaliseSchema = z.object({
  score: z.number().int().min(0).max(100),
  classificacao: z.enum(["quente", "morno", "frio"]),
  justificativa: z.string().min(1, "Justificativa obrigatória"),
  resposta_sugerida: z.string().min(1, "Resposta sugerida obrigatória"),
});

export type AIAnaliseData = z.infer<typeof aiAnaliseSchema>;

