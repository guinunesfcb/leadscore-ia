import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, analises } from "@/db/schema";
import { leadFormSchema } from "@/lib/schemas";
import { analisarLead } from "@/lib/analisarLead";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const todosLeads = await db.query.leads.findMany({
      orderBy: (leadsTable, { desc }) => [desc(leadsTable.created_at)],
      with: {
        analises: {
          orderBy: (analisesTable, { desc }) => [desc(analisesTable.created_at)],
        },
      },
    });

    return NextResponse.json(todosLeads);
  } catch (error) {
    console.error("Erro ao listar leads:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json(
      { error: "Erro ao buscar a lista de leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = leadFormSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: parsedData.error.flatten() },
        { status: 400 }
      );
    }

    const leadData = parsedData.data;

    // 1. Salvar lead no banco Neon
    const [novoLead] = await db
      .insert(leads)
      .values({
        nome: leadData.nome,
        email: leadData.email,
        empresa: leadData.empresa || null,
        segmento: leadData.segmento || null,
        mensagem: leadData.mensagem,
        origem: leadData.origem || "site",
      })
      .returning();

    // 2. Analisar lead com Gemini API
    const { analise, modelo } = await analisarLead(novoLead);

    // 3. Salvar análise no banco Neon
    const [novaAnalise] = await db
      .insert(analises)
      .values({
        lead_id: novoLead.id,
        score: analise.score,
        classificacao: analise.classificacao,
        justificativa: analise.justificativa,
        resposta_sugerida: analise.resposta_sugerida,
        modelo: modelo,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        lead: novoLead,
        analise: novaAnalise,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao processar lead:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json(
      { error: "Ocorreu um erro ao processar o lead. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

