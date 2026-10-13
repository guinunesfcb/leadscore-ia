import { GoogleGenAI, Type } from "@google/genai";
import { aiAnaliseSchema, type AIAnaliseData } from "./schemas";

interface LeadInput {
  nome: string;
  email: string;
  empresa?: string | null;
  segmento?: string | null;
  mensagem: string;
  origem?: string | null;
}

export interface ResultadoAnalise {
  analise: AIAnaliseData;
  modelo: string;
}

export async function analisarLead(lead: LeadInput): Promise<ResultadoAnalise> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Chave da Gemini API não configurada");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || 15000;

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `Você é um especialista em qualificação comercial e vendas B2B/B2C.
Sua missão é avaliar o potencial de compra de um lead comercial recebido pela empresa e sugerir a melhor abordagem.
Avalie a mensagem do lead com base em: clareza da dor/necessidade, orçamento aparente, urgência e maturidade de compra.

Critérios de pontuação (score de 0 a 100):
- 71 a 100 (quente): Demonstra interesse explícito, urgência, poder de decisão ou necessidade bem definida.
- 41 a 70 (morno): Demonstra interesse ou curiosidade, mas sem urgência imediata ou com dúvidas genéricas.
- 0 a 40 (frio): Mensagem vaga, spam, fora do perfil comercial ou sem intenção clara de compra.

Retorne obrigatoriamente um objeto JSON com:
- score: número inteiro de 0 a 100
- classificacao: "quente", "morno" ou "frio"
- justificativa: explicação comercial objetiva para a classificação
- resposta_sugerida: modelo de e-mail ou mensagem personalizada e profissional para o vendedor responder ao lead.`;

  const userContent = `Analise o seguinte lead:
- Nome: ${lead.nome}
- Empresa: ${lead.empresa || "Não informada"}
- Segmento: ${lead.segmento || "Não informado"}
- Origem do contato: ${lead.origem || "site"}
- Mensagem enviada:
"${lead.mensagem}"`;

  let response;
  let lastError: unknown;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { role: "user", parts: [{ text: userContent }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: "Nota de 0 a 100 representando o potencial de compra do lead",
              },
              classificacao: {
                type: Type.STRING,
                enum: ["quente", "morno", "frio"],
                description: "Classificação do lead: quente, morno ou frio",
              },
              justificativa: {
                type: Type.STRING,
                description: "Justificativa comercial detalhada para a nota atribuída",
              },
              resposta_sugerida: {
                type: Type.STRING,
                description: "Sugestão de resposta que o vendedor deve enviar ao lead",
              },
            },
            required: ["score", "classificacao", "justificativa", "resposta_sugerida"],
          },
        },
      });

      clearTimeout(timeoutId);
      break; // Sucesso, sai do loop
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Tempo limite excedido na análise do lead");
      }

      // Se não for a última tentativa, aguarda antes de tentar novamente (backoff exponencial)
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }
  }

  if (!response || !response.text) {
    throw lastError instanceof Error ? lastError : new Error("Falha ao obter resposta da IA");
  }

  const parsedJson = JSON.parse(response.text);
  const validAnalise = aiAnaliseSchema.parse(parsedJson);

  return {
    analise: validAnalise,
    modelo: modelName,
  };
}
